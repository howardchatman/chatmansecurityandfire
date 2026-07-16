import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth";

async function getUser(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  return payload as { id: string; role: string };
}

// GET: list opportunities (?status=&min_fit=)
export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user || !["admin", "manager"].includes(user.role)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const minFit = searchParams.get("min_fit");

  let query = supabaseAdmin
    .from("bid_opportunities")
    .select("*")
    .order("fit_score", { ascending: false, nullsFirst: false })
    .order("due_date", { ascending: true })
    .limit(300);

  if (status && status !== "all") query = query.eq("status", status);
  if (minFit) query = query.gte("fit_score", parseInt(minFit));

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}

// PATCH: update status/notes
export async function PATCH(request: NextRequest) {
  const user = await getUser(request);
  if (!user || !["admin", "manager"].includes(user.role)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, status, notes } = body;
  if (!id) {
    return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status !== undefined) updates.status = status;
  if (notes !== undefined) updates.notes = notes;

  const { data, error } = await supabaseAdmin
    .from("bid_opportunities")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}
