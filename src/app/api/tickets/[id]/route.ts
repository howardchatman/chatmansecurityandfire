import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("service_tickets")
      .update({
        title: body.title,
        description: body.description,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_email: body.customer_email,
        site_address: body.site_address,
        site_city: body.site_city,
        service_type: body.service_type,
        priority: body.priority,
        status: body.status,
        assigned_to: body.assigned_to || null,
        scheduled_date: body.scheduled_date || null,
        notes: body.notes,
        updated_at: new Date().toISOString(),
        resolved_at: body.status === "resolved" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("PUT /api/tickets/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update ticket" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin.from("service_tickets").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tickets/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete ticket" }, { status: 500 });
  }
}
