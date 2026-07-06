import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let query = supabaseAdmin
      .from("inventory")
      .select("*")
      .order("name", { ascending: true });

    if (category && category !== "all") query = query.eq("category", category);
    if (status && status !== "all") query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/inventory error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ success: false, error: "Item name is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("inventory")
      .insert({
        sku: body.sku || null,
        name: body.name,
        description: body.description || null,
        category: body.category || "other",
        manufacturer: body.manufacturer || null,
        unit_cost: parseFloat(body.unit_cost) || 0,
        unit_price: parseFloat(body.unit_price) || 0,
        stock_qty: parseInt(body.stock_qty) || 0,
        min_stock: parseInt(body.min_stock) || 0,
        location: body.location || null,
        status: body.status || "active",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/inventory error:", error);
    return NextResponse.json({ success: false, error: "Failed to create inventory item" }, { status: 500 });
  }
}
