import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { sendSms, smsTemplates } from "@/lib/sms";
import { supabaseAdmin as supabase,
  getJobById,
  updateJob,
  getJobPhotos,
  addJobPhoto,
  getJobNotes,
  addJobNote,
  assignUserToJob,
  removeJobAssignment,
  acknowledgeAssignment,
} from "@/lib/supabase";


// GET: Get job details with all related data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch job with all related data in one query
    const { data: job, error } = await supabase
      .from("jobs")
      .select(`
        *,
        team:teams(id, name),
        assignments:job_assignments(
          id,
          role,
          assigned_at,
          acknowledged_at,
          user:profiles!job_assignments_user_id_fkey(id, full_name, email, phone, role)
        ),
        job_notes(
          id,
          note,

          created_at,
          author:profiles(id, full_name, email)
        ),
        job_photos(
          id,
          photo_url,
          thumbnail_url,
          caption,
          photo_type,
          location,
          created_at
        )
      `)
      .eq("id", id)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    // Check if tech/inspector is assigned to this job
    if (["technician", "inspector"].includes(auth.role)) {
      const isAssigned = job.assignments?.some((a: { user: { id: string } }) => a.user?.id === auth.userId);
      if (!isAssigned) {
        return NextResponse.json(
          { success: false, error: "Not assigned to this job" },
          { status: 403 }
        );
      }
      // Notes have no "visibility" column — the boolean is_customer_visible
      // governs what the customer portal shows, not what staff can read. A
      // tech assigned to the job sees every note on it.
    } else if (auth.role === "manager" && auth.teamId) {
      // Managers can only see their team's jobs
      if (job.team_id && job.team_id !== auth.teamId) {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a job and everything hanging off it (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Only admins can delete jobs" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // An invoiced job is a financial record — void the invoice first.
    const { data: invoice } = await supabase
      .from("invoices")
      .select("invoice_number")
      .eq("job_id", id)
      .maybeSingle();

    if (invoice) {
      return NextResponse.json(
        {
          success: false,
          error: `This job is attached to invoice ${invoice.invoice_number}. Delete that invoice first.`,
        },
        { status: 400 }
      );
    }

    // Child rows first — these do not all cascade.
    await supabase.from("job_assignments").delete().eq("job_id", id);
    await supabase.from("job_notes").delete().eq("job_id", id);
    await supabase.from("job_photos").delete().eq("job_id", id);
    await supabase.from("job_events").delete().eq("job_id", id);
    await supabase.from("job_checklists").delete().eq("job_id", id);

    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) {
      console.error("Error deleting job:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Job deleted" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete job" },
      { status: 500 }
    );
  }
}

// PATCH: Update job or perform actions
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action, ...data } = body;

    // Handle specific actions
    switch (action) {
      case "add_photo": {
        const photo = await addJobPhoto({
          job_id: id,
          uploaded_by: auth.userId,
          photo_url: data.photo_url,
          thumbnail_url: data.thumbnail_url,
          caption: data.caption,
          photo_type: data.photo_type || "general",
          taken_at: data.taken_at || new Date().toISOString(),
        });
        return NextResponse.json({ success: true, data: photo });
      }

      case "add_note": {
        const note = await addJobNote({
          job_id: id,
          user_id: auth.userId,
          note: data.note,
          note_type: data.note_type || "general",
          is_customer_visible: data.is_customer_visible || false,
        });

        // Only a note the crew deliberately shared gets texted. Internal notes
        // must never leave the building.
        if (data.is_customer_visible) {
          const { data: jb } = await supabase
            .from("jobs")
            .select("customer_name, customer_phone, customer_email")
            .eq("id", id)
            .maybeSingle();
          if (jb?.customer_phone) {
            sendSms({
              name: jb.customer_name || "Customer",
              phone: jb.customer_phone,
              email: jb.customer_email,
              message: smsTemplates.jobUpdate(String(data.note).slice(0, 90)),
            }).catch((err) => console.error("job update text failed:", err));
          }
        }

        return NextResponse.json({ success: true, data: note });
      }

      case "assign_user": {
        if (!["admin", "manager"].includes(auth.role)) {
          return NextResponse.json(
            { success: false, error: "Insufficient permissions" },
            { status: 403 }
          );
        }
        const assignment = await assignUserToJob({
          job_id: id,
          user_id: data.user_id,
          assigned_by: auth.userId,
          role: data.role || "technician",
        });
        return NextResponse.json({ success: true, data: assignment });
      }

      case "remove_assignment": {
        if (!["admin", "manager"].includes(auth.role)) {
          return NextResponse.json(
            { success: false, error: "Insufficient permissions" },
            { status: 403 }
          );
        }
        await removeJobAssignment(id, data.user_id);
        return NextResponse.json({ success: true });
      }

      case "acknowledge": {
        // Find the assignment for this user
        const job = await getJobById(id);
        const assignment = job.assignments?.find((a) => a.user_id === auth.userId);
        if (!assignment) {
          return NextResponse.json(
            { success: false, error: "Not assigned to this job" },
            { status: 403 }
          );
        }
        const updated = await acknowledgeAssignment(assignment.id);
        return NextResponse.json({ success: true, data: updated });
      }

      case "start": {
        const updated = await updateJob(id, {
          status: "in_progress",
          actual_start_time: new Date().toISOString(),
        });
        return NextResponse.json({ success: true, data: updated });
      }

      case "complete": {
        const updated = await updateJob(id, {
          status: "completed",
          actual_end_time: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          completion_notes: data.completion_notes,
          customer_signature_url: data.customer_signature_url,
        });
        return NextResponse.json({ success: true, data: updated });
      }

      default: {
        // Regular update
        const job = await updateJob(id, data);
        return NextResponse.json({ success: true, data: job });
      }
    }
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update job" },
      { status: 500 }
    );
  }
}
