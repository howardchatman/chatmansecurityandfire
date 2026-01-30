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

// GET: List invoices with optional filters
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customer_id");
    const jobId = searchParams.get("job_id");
    const search = searchParams.get("search");

    let query = supabaseAdmin
      .from("invoices")
      .select(`
        *,
        customer:customers(id, name, email, phone, company)
      `)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (customerId) {
      query = query.eq("customer_id", customerId);
    }
    if (jobId) {
      query = query.eq("job_id", jobId);
    }
    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching invoices:", error);
      return NextResponse.json({ success: false, error: "Failed to fetch invoices" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch invoices" }, { status: 500 });
  }
}

// POST: Create a new invoice with line items
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!["admin", "manager"].includes(auth.role)) {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const { customer_id, job_id, quote_id, items, tax_rate, due_date, notes, status: invoiceStatus } = body;

    if (!customer_id) {
      return NextResponse.json({ success: false, error: "Customer is required" }, { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "At least one line item is required" }, { status: 400 });
    }

    // Calculate totals
    const rate = tax_rate !== undefined ? tax_rate : 0.0825;
    const subtotal = items.reduce((sum: number, item: { quantity: number; unit_price: number }) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);
    const taxAmount = Math.round(subtotal * rate * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .insert({
        customer_id,
        job_id: job_id || null,
        quote_id: quote_id || null,
        subtotal,
        tax_rate: rate,
        tax_amount: taxAmount,
        total,
        amount_paid: 0,
        status: invoiceStatus || "draft",
        due_date: due_date || null,
        notes: notes || null,
        created_by: auth.userId,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Error creating invoice:", invoiceError);
      return NextResponse.json({ success: false, error: "Failed to create invoice" }, { status: 500 });
    }

    // Insert line items
    const lineItems = items.map((item: { description: string; quantity: number; unit_price: number; item_type?: string }) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: Math.round(item.quantity * item.unit_price * 100) / 100,
      item_type: item.item_type || "service",
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("invoice_items")
      .insert(lineItems);

    if (itemsError) {
      console.error("Error creating invoice items:", itemsError);
    }

    // Fetch the complete invoice with items
    const { data: completeInvoice } = await supabaseAdmin
      .from("invoices")
      .select(`
        *,
        customer:customers(id, name, email, phone, company),
        items:invoice_items(*)
      `)
      .eq("id", invoice.id)
      .single();

    return NextResponse.json({ success: true, data: completeInvoice });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ success: false, error: "Failed to create invoice" }, { status: 500 });
  }
}
