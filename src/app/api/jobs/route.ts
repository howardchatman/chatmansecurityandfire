import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { sendSms, smsTemplates } from "@/lib/sms";
import {
  getJobs,
  createJob,
  updateJob,
  assignUserToJob,
  removeJobAssignment,
  getProfiles,
  JobStatus,
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

    const body = await request.json();
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
      scheduled_time_start,
      scheduled_time_end,
      estimated_duration_hours,
      team_id,
      assigned_users, // Array of { user_id, role }
    } = body;

    // Validate required fields
    if (!customer_name || !site_address || !job_type) {
      return NextResponse.json(
        { success: false, error: "Customer name, site address, and job type are required" },
        { status: 400 }
      );
    }

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
      scheduled_time_start,
      scheduled_time_end,
      estimated_duration_hours,
      created_by: auth.userId,
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

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create job" },
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

    const body = await request.json();
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
        sendSms({ ...who, message: smsTemplates.jobScheduled(when) })
          .catch((err) => console.error("job scheduled text failed:", err));
      } else if (updates.status === "completed") {
        sendSms({ ...who, message: smsTemplates.jobComplete() })
          .catch((err) => console.error("job complete text failed:", err));
      }
    }

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update job" },
      { status: 500 }
    );
  }
}
