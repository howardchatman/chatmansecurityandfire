import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";
import {
  EMPLOYEE_ROLES,
  DOCUMENT_TYPES,
  DOCUMENT_MAX_BYTES,
  storagePath,
  fileTooLarge,
} from "@/lib/uploads";

// Forms and documents attached to a job or inspection — backflow test forms,
// signed paperwork, scanned field sheets.
//
// The bucket is private. Reads go through one-hour signed URLs minted here,
// the same pattern as résumés: a leaked link dies on its own instead of
// living forever in someone's chat history.

const SIGNED_URL_TTL = 60 * 60;

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!EMPLOYEE_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("job_id");
  const inspectionId = searchParams.get("inspection_id");
  if (!jobId && !inspectionId) {
    return NextResponse.json({ error: "Provide job_id or inspection_id" }, { status: 400 });
  }

  let q = supabaseAdmin
    .from("uploaded_documents")
    .select("*")
    .order("created_at", { ascending: false });
  if (jobId) q = q.eq("job_id", jobId);
  if (inspectionId) q = q.eq("inspection_id", inspectionId);

  const { data, error } = await q;
  if (error) {
    console.error("[documents] list failed:", error);
    const missing = /uploaded_documents/.test(error.message);
    return NextResponse.json(
      {
        error: missing
          ? "The uploaded_documents table does not exist yet. Run the 20260817_uploads migration."
          : error.message,
      },
      { status: 500 }
    );
  }

  const rows = await Promise.all(
    (data ?? []).map(async (d) => {
      const { data: signed } = await supabaseAdmin.storage
        .from("tech-documents")
        .createSignedUrl(d.file_path, SIGNED_URL_TTL);
      return { ...d, url: signed?.signedUrl ?? null };
    })
  );

  return NextResponse.json({ data: rows });
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!EMPLOYEE_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const jobId = (formData.get("job_id") as string) || null;
    const inspectionId = (formData.get("inspection_id") as string) || null;
    const label = (formData.get("label") as string) || null;

    if (!file || (!jobId && !inspectionId)) {
      return NextResponse.json(
        { error: "Missing required fields: file, and job_id or inspection_id" },
        { status: 400 }
      );
    }
    if (!DOCUMENT_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PDF, images, Word, Excel, CSV, or text" },
        { status: 400 }
      );
    }
    if (file.size > DOCUMENT_MAX_BYTES) {
      return NextResponse.json({ error: fileTooLarge(DOCUMENT_MAX_BYTES) }, { status: 400 });
    }

    const parent = jobId ? `job/${jobId}` : `inspection/${inspectionId}`;
    const path = storagePath(parent, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("tech-documents")
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("[documents] storage upload failed:", uploadError);
      const missing = /bucket/i.test(uploadError.message);
      return NextResponse.json(
        {
          error: missing
            ? "The tech-documents storage bucket does not exist yet. Run the 20260817_uploads migration."
            : "Failed to upload file to storage",
        },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("uploaded_documents")
      .insert([
        {
          job_id: jobId,
          inspection_id: inspectionId,
          file_path: path,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          label,
          uploaded_by: user.id,
          uploaded_by_name: user.name || user.email,
        },
      ])
      .select()
      .single();

    if (error) {
      // The row failed after the object landed — remove the orphan so storage
      // doesn't accumulate files no list will ever show.
      await supabaseAdmin.storage.from("tech-documents").remove([path]);
      console.error("[documents] insert failed:", error);
      const missing = /uploaded_documents/.test(error.message);
      return NextResponse.json(
        {
          error: missing
            ? "The uploaded_documents table does not exist yet. Run the 20260817_uploads migration."
            : error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[documents]", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}
