import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ?id= reopens one saved proposal (the draft page uses this).
  const id = new URL(request.url).searchParams.get("id");
  if (id) {
    const { data, error } = await supabaseAdmin.from("proposal_history").select("*").eq("id", id).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    return NextResponse.json({ data });
  }
  const { data, error } = await supabaseAdmin
    .from("proposal_history")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const row: Record<string, unknown> = {
    client_id: body.client_id || null, client_name: body.client_name, tier: body.tier,
    status: body.status || "draft", total_low: body.total_low, total_high: body.total_high,
    total: body.total, proposal_type: body.proposal_type,
    customer_id: body.customer_id || body.proposal_data?.customer_id || null,
    filename: body.filename, share_token: body.share_token || null,
    proposal_data: body.proposal_data || null,
  };

  // Until the 20261005b migration runs, total / proposal_type / customer_id
  // don't exist and PostgREST rejects the whole insert. Drop whichever column
  // it names and try again, so a draft is never lost to a missing column —
  // everything is still kept inside proposal_data.
  let result = await supabaseAdmin.from("proposal_history").insert([row]).select().single();
  for (let i = 0; i < 3 && result.error; i++) {
    const missing = /'([a-z_]+)' column/.exec(result.error.message)?.[1];
    if (!missing || !(missing in row)) break;
    delete row[missing];
    result = await supabaseAdmin.from("proposal_history").insert([row]).select().single();
  }
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ data: result.data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const updates: Record<string, unknown> = {};
  if (body.status !== undefined) updates.status = body.status;
  if (body.client_name !== undefined) updates.client_name = body.client_name;
  if (body.tier !== undefined) updates.tier = body.tier;
  if (body.total_low !== undefined) updates.total_low = body.total_low;
  if (body.total_high !== undefined) updates.total_high = body.total_high;
  if (body.filename !== undefined) updates.filename = body.filename;

  const { data, error } = await supabaseAdmin
    .from("proposal_history")
    .update(updates)
    .eq("id", body.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { error } = await supabaseAdmin.from("proposal_history").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
