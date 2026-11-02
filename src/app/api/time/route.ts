import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { checkOnSite, readPosition, LOCATION_REQUIRED } from "@/lib/on-site";

async function getUser(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  return payload as { id: string; email: string; name: string; role: string };
}

// GET: list time entries.
// - ?open=true          -> the caller's currently open entry (if any)
// - ?from=&to=          -> date range (ISO). Defaults to current week.
// - ?employee_id=       -> admin/manager only; others always see their own.
export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const isManager = ["admin", "manager"].includes(user.role);

  if (searchParams.get("open") === "true") {
    const { data, error } = await supabaseAdmin
      .from("time_entries")
      .select("*")
      .eq("employee_id", user.id)
      .is("clock_out", null)
      .order("clock_in", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  }

  let query = supabaseAdmin
    .from("time_entries")
    .select("*")
    .order("clock_in", { ascending: false })
    .limit(500);

  const employeeParam = searchParams.get("employee_id");
  if (!isManager) {
    query = query.eq("employee_id", user.id);
  } else if (employeeParam && employeeParam !== "all") {
    query = query.eq("employee_id", employeeParam);
  }

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from) query = query.gte("clock_in", from);
  if (to) query = query.lte("clock_in", to);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}

// POST: clock in (one open entry per employee at a time). Location is
// required, and it has to be at the job site (lib/on-site).
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { job_id, project_id, notes } = body;
  const position = readPosition(body);
  if (!position) {
    return NextResponse.json({ success: false, error: LOCATION_REQUIRED, code: "location_required" }, { status: 400 });
  }

  // Refuse a second open entry
  const { data: open } = await supabaseAdmin
    .from("time_entries")
    .select("id")
    .eq("employee_id", user.id)
    .is("clock_out", null)
    .maybeSingle();
  if (open) {
    return NextResponse.json(
      { success: false, error: "You're already clocked in. Clock out first." },
      { status: 409 }
    );
  }

  // Techs and inspectors on the general time clock are checked against their
  // jobs for today. The office (admin/manager) can clock in from anywhere
  // there unless they're checking into a specific job.
  const fieldRole = ["technician", "inspector"].includes(user.role);
  const site =
    job_id || fieldRole
      ? await checkOnSite({ userId: user.id, position, jobId: job_id || null, strict: true })
      : { ok: true as const, jobId: null, note: null };
  if (!site.ok) {
    return NextResponse.json({ success: false, error: site.error, code: "off_site" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("time_entries")
    .insert({
      employee_id: user.id,
      employee_name: user.name,
      clock_in: new Date().toISOString(),
      clock_in_lat: position.lat,
      clock_in_lng: position.lng,
      clock_in_accuracy: position.accuracy,
      job_id: site.jobId || job_id || null,
      project_id: project_id || null,
      notes: [notes, site.note].filter(Boolean).join("\n") || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}

// PATCH: clock out the caller's open entry
export async function PATCH(request: NextRequest) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { notes } = body;
  const position = readPosition(body);
  if (!position) {
    return NextResponse.json({ success: false, error: LOCATION_REQUIRED, code: "location_required" }, { status: 400 });
  }

  const { data: open, error: findErr } = await supabaseAdmin
    .from("time_entries")
    .select("id, notes, job_id")
    .eq("employee_id", user.id)
    .is("clock_out", null)
    .order("clock_in", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findErr) {
    return NextResponse.json({ success: false, error: findErr.message }, { status: 500 });
  }
  if (!open) {
    return NextResponse.json(
      { success: false, error: "No open time entry. Clock in first." },
      { status: 409 }
    );
  }

  // Checking out away from the site is allowed (so a forgotten check-out can
  // still be closed) but noted on the entry for the office to see.
  const fieldRole = ["technician", "inspector"].includes(user.role);
  const site =
    open.job_id || fieldRole
      ? await checkOnSite({ userId: user.id, position, jobId: open.job_id, strict: false })
      : null;
  const offSiteNote =
    site?.ok && site.note?.startsWith("[Off site") ? site.note.replace("[Off site", "[Checked out off site") : null;

  const { data, error } = await supabaseAdmin
    .from("time_entries")
    .update({
      clock_out: new Date().toISOString(),
      clock_out_lat: position.lat,
      clock_out_lng: position.lng,
      clock_out_accuracy: position.accuracy,
      notes: [open.notes, notes, offSiteNote].filter(Boolean).join("\n") || null,
    })
    .eq("id", open.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}
