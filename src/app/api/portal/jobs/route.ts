import { NextRequest, NextResponse } from "next/server";
import { getAssignedJobs } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";

// GET: Get jobs assigned to the current user
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // The field view: jobs assigned to the caller. Admins and managers who go
    // out on jobs use it too.
    if (!["technician", "inspector", "admin", "manager"].includes(auth.role)) {
      return NextResponse.json(
        { success: false, error: "This endpoint is for field staff" },
        { status: 403 }
      );
    }

    const jobs = await getAssignedJobs(auth.id);

    return NextResponse.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching assigned jobs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
