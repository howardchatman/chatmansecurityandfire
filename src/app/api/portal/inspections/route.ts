import { NextRequest, NextResponse } from "next/server";
import {
  getAssignedInspections,
  getCompletedInspections,
} from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only technicians and inspectors can access this
    if (!["technician", "inspector", "admin", "manager"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "active" or "completed"

    if (type === "completed") {
      const limit = parseInt(searchParams.get("limit") || "20");
      const inspections = await getCompletedInspections(user.id, limit);
      return NextResponse.json({ data: inspections });
    }

    // Default: get active/assigned inspections
    const inspections = await getAssignedInspections(user.id);
    return NextResponse.json({ data: inspections });
  } catch (error) {
    console.error("Error fetching assigned inspections:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspections" },
      { status: 500 }
    );
  }
}
