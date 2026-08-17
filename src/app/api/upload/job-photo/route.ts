import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, addJobPhoto, JobPhoto } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";
import { EMPLOYEE_ROLES, PHOTO_TYPES, PHOTO_MAX_BYTES, storagePath, fileTooLarge } from "@/lib/uploads";

// Job photo upload — the route behind the tech job page's "Add Photo" button,
// which shipped as a TODO. Mirrors the inspection-photo route: multipart in,
// public job-photos bucket, one job_photos row out.

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!EMPLOYEE_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const jobId = formData.get("job_id") as string | null;
    const photoType = (formData.get("photo_type") as string) || "general";
    const caption = formData.get("caption") as string | null;

    if (!file || !jobId) {
      return NextResponse.json({ error: "Missing required fields: file, job_id" }, { status: 400 });
    }
    if (!PHOTO_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: JPEG, PNG, WebP, HEIC" }, { status: 400 });
    }
    if (file.size > PHOTO_MAX_BYTES) {
      return NextResponse.json({ error: fileTooLarge(PHOTO_MAX_BYTES) }, { status: 400 });
    }

    const filename = storagePath(jobId, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("job-photos")
      .upload(filename, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("[job-photo] storage upload failed:", uploadError);
      const missing = /bucket/i.test(uploadError.message);
      return NextResponse.json(
        {
          error: missing
            ? "The job-photos storage bucket does not exist yet. Run the 20260817_uploads migration."
            : "Failed to upload file to storage",
        },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage.from("job-photos").getPublicUrl(filename);

    const photo = await addJobPhoto({
      job_id: jobId,
      uploaded_by: user.id,
      photo_url: urlData.publicUrl,
      thumbnail_url: urlData.publicUrl,
      caption: caption || undefined,
      photo_type: photoType as JobPhoto["photo_type"],
      taken_at: new Date().toISOString(),
    });

    return NextResponse.json({ data: photo }, { status: 201 });
  } catch (error) {
    console.error("[job-photo]", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
