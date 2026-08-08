import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { getRole } from "@/lib/careers";

// Public endpoint — anyone can apply for a job, so POST is deliberately
// unauthenticated. GET is staff-only: applications contain résumés and personal
// details and must never be publicly listable.

const RESUME_BUCKET = "resumes";
const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const ALLOWED = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();

    const roleSlug = String(form.get("role_slug") || "").trim();
    const fullName = String(form.get("full_name") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const phone = String(form.get("phone") || "").trim();

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Name, email, and phone are required." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "That email doesn't look right." }, { status: 400 });
    }
    if (String(phone).replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a 10-digit phone number." },
        { status: 400 }
      );
    }

    const role = getRole(roleSlug);

    // ---- résumé (optional) ----
    let resumeUrl: string | null = null;
    let resumeFilename: string | null = null;
    const file = form.get("resume") as File | null;

    if (file && file.size > 0) {
      if (!ALLOWED.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: "Résumé must be a PDF, Word document, or plain text file." },
          { status: 400 }
        );
      }
      if (file.size > MAX_RESUME_BYTES) {
        return NextResponse.json(
          { success: false, error: "Résumé is too large — 10MB maximum." },
          { status: 400 }
        );
      }

      const ext = (file.name.split(".").pop() || "pdf").toLowerCase();
      const safeName = fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
      const path = `${roleSlug || "general"}/${Date.now()}-${safeName}.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(RESUME_BUCKET)
        .upload(path, Buffer.from(await file.arrayBuffer()), {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Résumé upload failed:", uploadError);
        // Don't lose the application over a failed upload — take the details
        // and let the office chase the résumé.
      } else {
        // The bucket is private: résumés are personal data and must not be
        // guessable by URL. Store the path and sign it on demand for staff.
        resumeUrl = path;
        resumeFilename = file.name;
      }
    }

    const disciplines = form.getAll("disciplines").map(String).filter(Boolean);

    const { data, error } = await supabaseAdmin
      .from("career_applications")
      .insert({
        role_slug: roleSlug || "general",
        role_title: role?.title || "General Application",
        full_name: fullName,
        email,
        phone,
        city: String(form.get("city") || "").trim() || null,
        years_experience: String(form.get("years_experience") || "").trim() || null,
        disciplines,
        licenses: String(form.get("licenses") || "").trim() || null,
        message: String(form.get("message") || "").trim() || null,
        resume_url: resumeUrl,
        resume_filename: resumeFilename,
        wants_profile: form.get("wants_profile") === "true",
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving application:", error);
      return NextResponse.json(
        { success: false, error: "Couldn't submit your application. Please call (832) 859-7009." },
        { status: 500 }
      );
    }

    sendEmail({
      to: process.env.ADMIN_EMAIL || "howardchatman@icloud.com",
      subject: `Application: ${data.role_title} — ${fullName}`,
      html: `
        <h2>New job application</h2>
        <p><strong>${fullName}</strong> applied for <strong>${data.role_title}</strong>.</p>
        <p>
          Email: <a href="mailto:${email}">${email}</a><br/>
          Phone: <a href="tel:${phone}">${phone}</a><br/>
          ${data.city ? `Area: ${data.city}<br/>` : ""}
          ${data.years_experience ? `Experience: ${data.years_experience}<br/>` : ""}
          ${disciplines.length ? `Works on: ${disciplines.join(", ")}<br/>` : ""}
          ${data.licenses ? `Licenses: ${data.licenses}<br/>` : ""}
        </p>
        ${data.message ? `<p><strong>They said:</strong><br/>${String(data.message).replace(/\n/g, "<br/>")}</p>` : ""}
        <p>${resumeFilename ? `Résumé attached to their record: ${resumeFilename}` : "No résumé uploaded."}</p>
        <p><a href="https://www.chatmansecurityandfire.com/admin/careers">Review in the dashboard</a></p>
      `,
    }).catch((err) => console.error("Application notification failed:", err));

    return NextResponse.json({
      success: true,
      message: "Application received. We'll be in touch.",
    });
  } catch (error) {
    console.error("Error handling application:", error);
    return NextResponse.json({ success: false, error: "Couldn't submit your application." }, { status: 500 });
  }
}

// Staff only — this returns personal data.
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !["admin", "manager"].includes(auth.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const roleSlug = searchParams.get("role_slug");

    let query = supabaseAdmin
      .from("career_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") query = query.eq("status", status);
    if (roleSlug && roleSlug !== "all") query = query.eq("role_slug", roleSlug);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Résumés live in a private bucket, so hand back short-lived signed links
    // rather than storing public URLs that would never expire.
    const withLinks = await Promise.all(
      (data || []).map(async (row) => {
        if (!row.resume_url) return row;
        const { data: signed } = await supabaseAdmin.storage
          .from(RESUME_BUCKET)
          .createSignedUrl(row.resume_url, 60 * 60);
        return { ...row, resume_link: signed?.signedUrl || null };
      })
    );

    return NextResponse.json({ success: true, data: withLinks });
  } catch (error) {
    console.error("Error loading applications:", error);
    return NextResponse.json({ success: false, error: "Failed to load applications" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !["admin", "manager"].includes(auth.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id, status, notes } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabaseAdmin
      .from("career_applications")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
  }
}
