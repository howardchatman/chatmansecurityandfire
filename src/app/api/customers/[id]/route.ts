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

// GET: Single customer with related data
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

    // Get customer
    const { data: customer, error } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !customer) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    // Fetch related data in parallel
    const [quotesRes, jobsRes, invoicesRes, paymentsRes] = await Promise.all([
      supabaseAdmin
        .from("quotes")
        .select("id, quote_number, status, totals, created_at")
        .eq("customer->>email", customer.email)
        .order("created_at", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("jobs")
        .select("id, job_number, status, job_type, scheduled_date, total_amount, description")
        .eq("customer_email", customer.email)
        .order("created_at", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("invoices")
        .select("id, invoice_number, status, total, amount_paid, due_date, created_at")
        .eq("customer_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("payments")
        .select("id, amount, payment_method, payment_date, status")
        .eq("customer_id", id)
        .order("payment_date", { ascending: false })
        .limit(20),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        quotes: quotesRes.data || [],
        jobs: jobsRes.data || [],
        invoices: invoicesRes.data || [],
        payments: paymentsRes.data || [],
      },
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch customer" }, { status: 500 });
  }
}

// PATCH: Update customer
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

    // Only allow certain fields to be updated
    const allowedFields = ["name", "email", "phone", "company", "address", "city", "state", "zip", "notes", "status"];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const { data, error } = await supabaseAdmin
      .from("customers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer:", error);
      return NextResponse.json({ success: false, error: "Failed to update customer" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json({ success: false, error: "Failed to update customer" }, { status: 500 });
  }
}

// DELETE: Delete customer
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
      return NextResponse.json({ success: false, error: "Only admins can delete customers" }, { status: 403 });
    }

    const { id } = await params;

    const { error } = await supabaseAdmin.from("customers").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: "Failed to delete customer" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Customer deleted" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json({ success: false, error: "Failed to delete customer" }, { status: 500 });
  }
}
