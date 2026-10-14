import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";
import { PROPOSAL_FILES_BUCKET, PROPOSAL_FILE_TYPES, PROPOSAL_FILE_MAX_BYTES } from "@/lib/proposal-ai";

// POST {name, type, size} — a one-time signed URL the browser uploads a plan
// set or site photo to directly. Plan PDFs are often far over Vercel's 4.5 MB
// request limit, so the bytes never pass through this function.

async function ensureBucket() {
  const { data } = await supabaseAdmin.storage.getBucket(PROPOSAL_FILES_BUCKET);
  if (data) return;
  const { error } = await supabaseAdmin.storage.createBucket(PROPOSAL_FILES_BUCKET, {
    public: false,
    fileSizeLimit: PROPOSAL_FILE_MAX_BYTES,
    allowedMimeTypes: Object.keys(PROPOSAL_FILE_TYPES),
  });
  // Another request may have created it a moment ago.
  if (error && !/already exists/i.test(error.message)) throw error;
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth || !["admin", "manager"].includes(auth.role)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { name, type, size } = await request.json().catch(() => ({}));
  if (!name || !type) {
    return NextResponse.json({ success: false, error: "Missing file name or type" }, { status: 400 });
  }
  if (!(type in PROPOSAL_FILE_TYPES)) {
    return NextResponse.json(
      {
        success: false,
        error: `${name}: only PDF, JPG, PNG, WebP, or GIF files can be read. iPhone photos in HEIC format need to be saved as JPG first.`,
      },
      { status: 400 }
    );
  }
  if (Number(size) > PROPOSAL_FILE_MAX_BYTES) {
    return NextResponse.json(
      { success: false, error: `${name} is over ${PROPOSAL_FILE_MAX_BYTES / 1024 / 1024} MB.` },
      { status: 400 }
    );
  }

  try {
    await ensureBucket();
    const safeName = String(name).replace(/[^A-Za-z0-9._-]+/g, "_").slice(-80);
    const month = new Date().toISOString().slice(0, 7);
    const path = `drafts/${month}/${crypto.randomUUID()}-${safeName}`;
    const { data, error } = await supabaseAdmin.storage.from(PROPOSAL_FILES_BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw error || new Error("No upload URL");
    return NextResponse.json({ success: true, data: { path, signedUrl: data.signedUrl } });
  } catch (err) {
    console.error("Proposal file upload URL failed:", err);
    return NextResponse.json({ success: false, error: "Couldn't prepare the upload. Try again." }, { status: 500 });
  }
}
