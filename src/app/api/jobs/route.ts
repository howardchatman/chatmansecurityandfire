import { NextRequest, NextResponse, after } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { sendSms, smsTemplates } from "@/lib/sms";
import { syncJobToCalendar } from "@/lib/google-calendar";
import { blanksToNull, dbErrorText } from "@/lib/job-input";
import {
  getJobs,
  createJob,
  updateJob,
  assignUserToJob,
  removeJobAssignment,
  getProfiles,
  JobStatus,
  supabaseAdmin,
} from "@/lib/supabase";


// GET: List jobs (filtered by role)
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as JobStatus | null;
    const team_id = searchParams.get("team_id");
    const scheduled_date = searchParams.get("scheduled_date");

    // Build filters based on role
    const filters: {
      status?: JobStatus;
      team_id?: string;
      scheduled_date?: string;
    } = {};

    if (status) filters.status = status;
    if (scheduled_date) filters.scheduled_date = scheduled_date;

    // Admin sees all, manager sees team jobs
    if (auth.role === "manager" && auth.teamId) {
      filters.team_id = team_id || auth.teamId;
    } else if (team_id && auth.role === "admin") {
      filters.team_id = team_id;
    }

    const jobs = await getJobs(filters);

    return NextResponse.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

// POST: Create a new job (admin/manager only)
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admin and manager can create jobs
    if (!["admin", "manager"].includes(auth.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = blanksToNull(await request.json());
    const {
      customer_name,
      customer_email,
      customer_phone,
      site_address,
      site_city,
      site_state,
      site_zip,
      job_type,
      priority,
      description,
      notes,
      scheduled_date,
      scheduled_end_date,
      scheduled_time_start,
      scheduled_time_end,
      estimated_duration_hours,
      team_id,
      assigned_users, // Array of { user_id, role }
    } = body;

    if (scheduled_end_date && (!scheduled_date || scheduled_end_date < scheduled_date)) {
      return NextResponse.json(
        { success: false, error: "The end date must be on or after the start date." },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!customer_name || !site_address || !job_type) {
      return NextResponse.json(
        { success: false, error: "Customer name, site address, and job type are required" },
        { status: 400 }
      );
    }

    // jobs.created_by references profiles. A login without a profiles mirror
    // would fail the whole insert, so record the creator only when it resolves.
    const { data: creator } = await supabaseAdmin.from("profiles").select("id").eq("id", auth.userId).maybeSingle();

    // Create the job
    const job = await createJob({
      customer_name,
      customer_email,
      customer_phone,
      site_address,
      site_city,
      site_state: site_state || "TX",
      site_zip,
      job_type,
      priority: priority || "normal",
      status: scheduled_date ? "scheduled" : "pending",
      description,
      notes,
      scheduled_date,
      // Only sent for multi-day jobs, so one-day jobs keep working even before
      // the 20261014_multi_day_jobs migration adds the column.
      ...(scheduled_end_date ? { scheduled_end_date } : {}),
      scheduled_time_start,
      scheduled_time_end,
      estimated_duration_hours,
      created_by: creator ? auth.userId : undefined,
      team_id: team_id || auth.teamId,
    });

    // Assign users if provided
    if (assigned_users && Array.isArray(assigned_users)) {
      for (const assignment of assigned_users) {
        try {
          await assignUserToJob({
            job_id: job.id,
            user_id: assignment.user_id,
            assigned_by: auth.userId,
            role: assignment.role || "technician",
          });
        } catch (err) {
          console.error("Error assigning user:", err);
        }
      }
    }

    // Push the new job onto the connected Google Calendar (no-op if not
    // connected). Fire-and-forget — a calendar hiccup must not fail creation.
    after(syncJobToCalendar(job).catch((err) =>
      console.error("Failed to sync job to Google Calendar:", err)
    ));

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      {
        success: false,
        error: /scheduled_end_date/i.test(String((error as { message?: string })?.message))
          ? "Multi-day jobs need one database update first: run supabase/migrations/20261014_multi_day_jobs.sql in Supabase, then save again."
          : dbErrorText(error, "Failed to create job"),
      },
      { status: 500 }
    );
  }
}

// PATCH: Update a job
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = blanksToNull(await request.json());
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Techs can only update certain fields
    if (["technician", "inspector"].includes(auth.role)) {
      const allowedFields = ["status", "notes", "completion_notes", "actual_start_time", "actual_end_time", "completed_at"];
      const updateFields = Object.keys(updates);
      const hasDisallowedField = updateFields.some((f) => !allowedFields.includes(f));

      if (hasDisallowedField) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions to update these fields" },
          { status: 403 }
        );
      }
    }

    const job = await updateJob(id, updates);

    // Text the customer at the two moments they actually care about. Fire and
    // forget — a failed text must never fail the status change itself.
    if (updates.status && job?.customer_phone) {
      const who = { name: job.customer_name || "Customer", phone: job.customer_phone, email: job.customer_email };
      if (updates.status === "scheduled" && job.scheduled_date) {
        const when = new Date(job.scheduled_date + "T12:00:00").toLocaleDateString("en-US", {
          weekday: "long", month: "long", day: "numeric",
        });
        after(sendSms({ ...who, message: smsTemplates.jobScheduled(when) })
          .catch((err) => console.error("job scheduled text failed:", err)));
      } else if (updates.status === "completed") {
        after(sendSms({ ...who, message: smsTemplates.jobComplete() })
          .catch((err) => console.error("job complete text failed:", err)));
      }
    }

    // Keep the Google Calendar event in step with a reschedule (no-op if the
    // calendar isn't connected). Runs via after() so it completes past the response.
    after(syncJobToCalendar(job).catch((err) =>
      console.error("Failed to sync job to Google Calendar:", err)
    ));

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { success: false, error: dbErrorText(error, "Failed to update job") },
      { status: 500 }
    );
  }
}
