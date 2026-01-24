import { NextRequest, NextResponse } from "next/server";
import {
  getDeficienciesByInspection,
  createDeficiency,
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
    const deficiencies = await getDeficienciesByInspection(id);

    return NextResponse.json({ data: deficiencies });
  } catch (error) {
    console.error("Error fetching deficiencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch deficiencies" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: inspectionId } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.category || !body.description || !body.severity) {
      return NextResponse.json(
        { error: "Missing required fields: category, description, severity" },
        { status: 400 }
      );
    }

    const deficiency = await createDeficiency({
      ...body,
      inspection_id: inspectionId,
      created_by: user.id,
      status: body.status || "open",
    });

    return NextResponse.json({ data: deficiency }, { status: 201 });
  } catch (error) {
    console.error("Error creating deficiency:", error);
    return NextResponse.json(
      { error: "Failed to create deficiency" },
      { status: 500 }
    );
  }
}
