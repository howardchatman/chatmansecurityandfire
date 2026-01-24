import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, addInspectionPhoto } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const inspectionId = formData.get("inspection_id") as string;
    const deficiencyId = formData.get("deficiency_id") as string | null;
    const photoType = (formData.get("photo_type") as string) || "general";
    const caption = formData.get("caption") as string | null;
    const location = formData.get("location") as string | null;
    const deviceTag = formData.get("device_tag") as string | null;

    if (!file || !inspectionId) {
      return NextResponse.json(
        { error: "Missing required fields: file, inspection_id" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, HEIC" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${inspectionId}/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("inspection-photos")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("inspection-photos")
      .getPublicUrl(filename);

    // Save photo record to database
    const photo = await addInspectionPhoto({
      inspection_id: inspectionId,
      deficiency_id: deficiencyId || undefined,
      photo_url: urlData.publicUrl,
      thumbnail_url: urlData.publicUrl, // Could generate thumbnail later
      caption: caption || undefined,
      photo_type: photoType as "general" | "deficiency" | "before" | "after" | "panel" | "device",
      location: location || undefined,
      device_tag: deviceTag || undefined,
      uploaded_by: user.id,
      taken_at: new Date().toISOString(),
    });

    return NextResponse.json({ data: photo }, { status: 201 });
  } catch (error) {
    console.error("Error uploading inspection photo:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
