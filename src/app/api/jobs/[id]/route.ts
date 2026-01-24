import { NextRequest, NextResponse } from "next/server";
import {
  supabase,
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
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-min-32-chars-long!!"
);

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string; role: string; teamId?: string };
  } catch {
    return null;
  }
}

// GET: Get job details with all related data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth();
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
          user:profiles(id, full_name, email, phone, role)
        ),
        job_notes(
          id,
          note,
          visibility,
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
      // Filter notes visibility for techs
      if (job.job_notes) {
        job.job_notes = job.job_notes.filter(
          (n: { visibility: string }) => n.visibility === "tech" || n.visibility === "customer"
        );
      }
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

// PATCH: Update job or perform actions
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth();
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
