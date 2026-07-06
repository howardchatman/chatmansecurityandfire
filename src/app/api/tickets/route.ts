import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function generateTicketNumber() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `TKT-${y}${m}${d}-${rand}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    let query = supabaseAdmin
      .from("service_tickets")
      .select("*, assignee:profiles!service_tickets_assigned_to_fkey(id, full_name)")
      .order("created_at", { ascending: false });

    if (status && status !== "all") query = query.eq("status", status);
    if (priority && priority !== "all") query = query.eq("priority", priority);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/tickets error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.customer_name) {
      return NextResponse.json({ success: false, error: "Title and customer name are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("service_tickets")
      .insert({
        ticket_number: generateTicketNumber(),
        title: body.title,
        description: body.description || null,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone || null,
        customer_email: body.customer_email || null,
        site_address: body.site_address || null,
        site_city: body.site_city || null,
        service_type: body.service_type || "other",
        priority: body.priority || "normal",
        status: body.status || "open",
        assigned_to: body.assigned_to || null,
        scheduled_date: body.scheduled_date || null,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tickets error:", error);
    return NextResponse.json({ success: false, error: "Failed to create ticket" }, { status: 500 });
  }
}
