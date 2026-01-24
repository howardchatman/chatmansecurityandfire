import { NextRequest, NextResponse } from "next/server";
import {
  getDeficiencyById,
  updateDeficiency,
  deleteDeficiency,
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
    const deficiency = await getDeficiencyById(id);

    if (!deficiency) {
      return NextResponse.json({ error: "Deficiency not found" }, { status: 404 });
    }

    return NextResponse.json({ data: deficiency });
  } catch (error) {
    console.error("Error fetching deficiency:", error);
    return NextResponse.json(
      { error: "Failed to fetch deficiency" },
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

    const deficiency = await updateDeficiency(id, body);

    return NextResponse.json({ data: deficiency });
  } catch (error) {
    console.error("Error updating deficiency:", error);
    return NextResponse.json(
      { error: "Failed to update deficiency" },
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

    const { id } = await params;
    await deleteDeficiency(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting deficiency:", error);
    return NextResponse.json(
      { error: "Failed to delete deficiency" },
      { status: 500 }
    );
  }
}
