import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabaseAdmin
    .from("proposal_inventory")
    .select("*")
    .order("category")
    .order("name");
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
    .from("proposal_inventory")
    .insert([{ name: body.name, category: body.category, unit_cost: body.unit_cost, unit: body.unit, description: body.description }])
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
    .from("proposal_inventory")
    .update({ name: body.name, category: body.category, unit_cost: body.unit_cost, unit: body.unit, description: body.description, updated_at: new Date().toISOString() })
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
  const { error } = await supabaseAdmin.from("proposal_inventory").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
