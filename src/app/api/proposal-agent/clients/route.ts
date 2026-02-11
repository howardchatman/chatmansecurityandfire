import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabaseAdmin
    .from("proposal_clients")
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
  const { data, error } = await supabaseAdmin
    .from("proposal_clients")
    .insert([{
      name: body.name, contact_name: body.contact_name, contact_title: body.contact_title,
      contact_email: body.contact_email, org_type: body.org_type, num_facilities: body.num_facilities,
      address: body.address, notes: body.notes
    }])
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { data, error } = await supabaseAdmin
    .from("proposal_clients")
    .update({
      name: body.name, contact_name: body.contact_name, contact_title: body.contact_title,
      contact_email: body.contact_email, org_type: body.org_type, num_facilities: body.num_facilities,
      address: body.address, notes: body.notes, updated_at: new Date().toISOString()
    })
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
  const { error } = await supabaseAdmin.from("proposal_clients").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
