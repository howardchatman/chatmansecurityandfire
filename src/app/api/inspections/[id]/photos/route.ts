import { NextRequest, NextResponse } from "next/server";
import {
  getInspectionPhotos,
  addInspectionPhoto,
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
    const photos = await getInspectionPhotos(id);

    return NextResponse.json({ data: photos });
  } catch (error) {
    console.error("Error fetching inspection photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspection photos" },
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
    if (!body.photo_url) {
      return NextResponse.json(
        { error: "Missing required field: photo_url" },
        { status: 400 }
      );
    }

    const photo = await addInspectionPhoto({
      ...body,
      inspection_id: inspectionId,
      uploaded_by: user.id,
      photo_type: body.photo_type || "general",
      taken_at: body.taken_at || new Date().toISOString(),
    });

    return NextResponse.json({ data: photo }, { status: 201 });
  } catch (error) {
    console.error("Error adding inspection photo:", error);
    return NextResponse.json(
      { error: "Failed to add inspection photo" },
      { status: 500 }
    );
  }
}
