import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { supabaseAdmin as supabase } from "@/lib/supabase";


// DELETE: Remove an assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admin and manager can remove assignments
    if (!["admin", "manager"].includes(auth.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id: jobId, assignmentId } = await params;

    // Get assignment details for the event
    const { data: assignment } = await supabase
      .from("job_assignments")
      .select(`
        *,
        user:profiles!job_assignments_user_id_fkey(id, full_name)
      `)
      .eq("id", assignmentId)
      .eq("job_id", jobId)
      .single();

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("job_assignments")
      .delete()
      .eq("id", assignmentId)
      .eq("job_id", jobId);

    if (error) {
      console.error("Error removing assignment:", error);
      return NextResponse.json(
        { success: false, error: "Failed to remove assignment" },
        { status: 500 }
      );
    }

    // Create job event
    await supabase.from("job_events").insert({
      job_id: jobId,
      event_type: "assignment_removed",
      payload: {
        user_id: assignment.user_id,
        user_name: assignment.user?.full_name || "Unknown",
        role: assignment.role,
      },
      created_by: auth.userId,
    });

    return NextResponse.json({
      success: true,
      message: "Assignment removed successfully",
    });
  } catch (error) {
    console.error("Error removing assignment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove assignment" },
      { status: 500 }
    );
  }
}
