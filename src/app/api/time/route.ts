import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth";

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

// POST: clock in (one open entry per employee at a time)
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { lat, lng, accuracy, job_id, project_id, notes } = body;

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

  const { data, error } = await supabaseAdmin
    .from("time_entries")
    .insert({
      employee_id: user.id,
      employee_name: user.name,
      clock_in: new Date().toISOString(),
      clock_in_lat: typeof lat === "number" ? lat : null,
      clock_in_lng: typeof lng === "number" ? lng : null,
      clock_in_accuracy: typeof accuracy === "number" ? accuracy : null,
      job_id: job_id || null,
      project_id: project_id || null,
      notes: notes || null,
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
  const { lat, lng, accuracy, notes } = body;

  const { data: open, error: findErr } = await supabaseAdmin
    .from("time_entries")
    .select("id, notes")
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

  const { data, error } = await supabaseAdmin
    .from("time_entries")
    .update({
      clock_out: new Date().toISOString(),
      clock_out_lat: typeof lat === "number" ? lat : null,
      clock_out_lng: typeof lng === "number" ? lng : null,
      clock_out_accuracy: typeof accuracy === "number" ? accuracy : null,
      notes: notes ? [open.notes, notes].filter(Boolean).join("\n") : open.notes,
    })
    .eq("id", open.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}
