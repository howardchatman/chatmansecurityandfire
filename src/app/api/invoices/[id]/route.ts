import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-min-32-chars-long!!"
);

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string; role: string; teamId?: string };
  } catch {
    return null;
  }
}

// GET: Single invoice with items, customer, payments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: invoice, error } = await supabaseAdmin
      .from("invoices")
      .select(`
        *,
        customer:customers(id, name, email, phone, company, address, city, state, zip),
        items:invoice_items(*),
        payments:payments(*)
      `)
      .eq("id", id)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch invoice" }, { status: 500 });
  }
}

// PATCH: Update invoice
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!["admin", "manager"].includes(auth.role)) {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Handle item updates if provided
    if (body.items && Array.isArray(body.items)) {
      // Delete existing items and re-insert
      await supabaseAdmin.from("invoice_items").delete().eq("invoice_id", id);

      const lineItems = body.items.map((item: { description: string; quantity: number; unit_price: number; item_type?: string }) => ({
        invoice_id: id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: Math.round(item.quantity * item.unit_price * 100) / 100,
        item_type: item.item_type || "service",
      }));

      await supabaseAdmin.from("invoice_items").insert(lineItems);

      // Recalculate totals
      const subtotal = lineItems.reduce((sum: number, item: { total: number }) => sum + item.total, 0);
      const taxRate = body.tax_rate !== undefined ? body.tax_rate : 0.0825;
      const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
      const total = Math.round((subtotal + taxAmount) * 100) / 100;

      body.subtotal = subtotal;
      body.tax_amount = taxAmount;
      body.total = total;
      delete body.items;
    }

    // Remove fields that shouldn't be updated directly
    delete body.id;
    delete body.invoice_number;
    delete body.created_at;
    delete body.customer;
    delete body.payments;

    const { data, error } = await supabaseAdmin
      .from("invoices")
      .update(body)
      .eq("id", id)
      .select(`
        *,
        customer:customers(id, name, email, phone, company),
        items:invoice_items(*)
      `)
      .single();

    if (error) {
      console.error("Error updating invoice:", error);
      return NextResponse.json({ success: false, error: "Failed to update invoice" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ success: false, error: "Failed to update invoice" }, { status: 500 });
  }
}

// DELETE: Delete invoice (draft only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (auth.role !== "admin") {
      return NextResponse.json({ success: false, error: "Only admins can delete invoices" }, { status: 403 });
    }

    const { id } = await params;

    // Check if invoice is draft
    const { data: invoice } = await supabaseAdmin
      .from("invoices")
      .select("status")
      .eq("id", id)
      .single();

    if (invoice && invoice.status !== "draft") {
      return NextResponse.json(
        { success: false, error: "Only draft invoices can be deleted. Void the invoice instead." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("invoices").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: "Failed to delete invoice" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Invoice deleted" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json({ success: false, error: "Failed to delete invoice" }, { status: 500 });
  }
}
