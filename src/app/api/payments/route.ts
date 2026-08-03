import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";
import { getCustomerIdForUser } from "@/lib/customer";

// GET: List payments with optional filters
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customer_id");
    const invoiceId = searchParams.get("invoice_id");

    // A customer may only ever see their own payments.
    let effectiveCustomerId = customerId;
    if (auth.role === "customer") {
      const ownCustomerId = await getCustomerIdForUser(auth);
      if (!ownCustomerId) {
        return NextResponse.json({ success: true, data: [] });
      }
      effectiveCustomerId = ownCustomerId;
    }

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
    if (effectiveCustomerId) {
      query = query.eq("customer_id", effectiveCustomerId);
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
    const auth = await verifyAuth(request);
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
