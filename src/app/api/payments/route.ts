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

// GET: List payments with optional filters
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customer_id");
    const invoiceId = searchParams.get("invoice_id");

    let query = supabaseAdmin
      .from("payments")
      .select(`
        *,
        invoice:invoices(id, invoice_number, total, status),
        customer:customers(id, name, email, company)
      `)
      .order("payment_date", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (customerId) {
      query = query.eq("customer_id", customerId);
    }
    if (invoiceId) {
      query = query.eq("invoice_id", invoiceId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching payments:", error);
      return NextResponse.json({ success: false, error: "Failed to fetch payments" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch payments" }, { status: 500 });
  }
}

// POST: Record a manual payment (check, cash, etc.)
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
    const { invoice_id, customer_id, amount, payment_method, notes, payment_date } = body;

    if (!invoice_id || !customer_id || !amount) {
      return NextResponse.json(
        { success: false, error: "invoice_id, customer_id, and amount are required" },
        { status: 400 }
      );
    }

    // Record payment
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        invoice_id,
        customer_id,
        amount,
        payment_method: payment_method || "cash",
        payment_date: payment_date || new Date().toISOString(),
        status: "completed",
        notes: notes || null,
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error recording payment:", paymentError);
      return NextResponse.json({ success: false, error: "Failed to record payment" }, { status: 500 });
    }

    // Update invoice amount_paid and status
    const { data: invoice } = await supabaseAdmin
      .from("invoices")
      .select("total, amount_paid")
      .eq("id", invoice_id)
      .single();

    if (invoice) {
      const newAmountPaid = (invoice.amount_paid || 0) + amount;
      const newStatus = newAmountPaid >= invoice.total ? "paid" : "partial";

      await supabaseAdmin
        .from("invoices")
        .update({
          amount_paid: newAmountPaid,
          status: newStatus,
          ...(newStatus === "paid" ? { paid_at: new Date().toISOString() } : {}),
        })
        .eq("id", invoice_id);
    }

    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    console.error("Error recording payment:", error);
    return NextResponse.json({ success: false, error: "Failed to record payment" }, { status: 500 });
  }
}
