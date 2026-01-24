import { NextRequest, NextResponse } from "next/server";
import {
  getInspectionWithDetails,
  updateInspection,
  deleteInspection,
} from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const inspection = await getInspectionWithDetails(id);

    if (!inspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
    }

    return NextResponse.json({ data: inspection });
  } catch (error) {
    console.error("Error fetching inspection:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspection" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Handle special actions
    if (body.action) {
      switch (body.action) {
        case "start":
          const startedInspection = await updateInspection(id, {
            status: "in_progress",
            actual_start_time: new Date().toISOString(),
          });
          return NextResponse.json({ data: startedInspection });

        case "complete":
          const completedInspection = await updateInspection(id, {
            status: "completed",
            actual_end_time: new Date().toISOString(),
            passed: body.passed,
            pass_with_deficiencies: body.pass_with_deficiencies,
            notes: body.notes,
            fire_marshal_notes: body.fire_marshal_notes,
            checklist_results: body.checklist_results,
          });
          return NextResponse.json({ data: completedInspection });

        case "cancel":
          const cancelledInspection = await updateInspection(id, {
            status: "cancelled",
            internal_notes: body.internal_notes || body.reason,
          });
          return NextResponse.json({ data: cancelledInspection });

        default:
          return NextResponse.json({ error: "Invalid action" }, { status: 400 });
      }
    }

    // Regular update
    const inspection = await updateInspection(id, body);
    return NextResponse.json({ data: inspection });
  } catch (error) {
    console.error("Error updating inspection:", error);
    return NextResponse.json(
      { error: "Failed to update inspection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin and manager can delete inspections
    if (!["admin", "manager"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await deleteInspection(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting inspection:", error);
    return NextResponse.json(
      { error: "Failed to delete inspection" },
      { status: 500 }
    );
  }
}
