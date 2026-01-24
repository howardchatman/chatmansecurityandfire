import { NextRequest, NextResponse } from "next/server";
import {
  getInspections,
  createInspection,
  InspectionType,
  InspectionStatus,
} from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as InspectionStatus | null;
    const inspection_type = searchParams.get("type") as InspectionType | null;
    const inspector_id = searchParams.get("inspector_id");
    const customer_id = searchParams.get("customer_id");
    const scheduled_date = searchParams.get("scheduled_date");

    const inspections = await getInspections({
      status: status || undefined,
      inspection_type: inspection_type || undefined,
      inspector_id: inspector_id || undefined,
      customer_id: customer_id || undefined,
      scheduled_date: scheduled_date || undefined,
    });

    return NextResponse.json({ data: inspections });
  } catch (error) {
    console.error("Error fetching inspections:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspections" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin, manager, technician, inspector can create inspections
    if (!["admin", "manager", "technician", "inspector"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.customer_name || !body.site_address || !body.inspection_type) {
      return NextResponse.json(
        { error: "Missing required fields: customer_name, site_address, inspection_type" },
        { status: 400 }
      );
    }

    const inspection = await createInspection({
      ...body,
      created_by: user.id,
      status: body.status || "scheduled",
    });

    return NextResponse.json({ data: inspection }, { status: 201 });
  } catch (error) {
    console.error("Error creating inspection:", error);
    return NextResponse.json(
      { error: "Failed to create inspection" },
      { status: 500 }
    );
  }
}
