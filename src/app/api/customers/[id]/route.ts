import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET: Single customer with related data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    // A customer's whole file — contact details, quotes, jobs, invoices,
    // proposals — is staff-only. Portal logins see their own records through
    // /api/portal/*, which scopes to their customer.
    if (auth.role === "customer") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
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

    // Proposal drafts saved from the AI draft page or the Proposal Agent.
    // Linked by customer_id once the 20261005b migration has run; before that
    // (and for drafts saved earlier) the id only lives inside proposal_data.
    const PROPOSAL_COLS = "id, client_name, status, total, filename, proposal_type, created_at, proposal_data";
    let proposalsRes = await supabaseAdmin
      .from("proposal_history")
      .select(PROPOSAL_COLS)
      .or(`customer_id.eq.${id},proposal_data->>customer_id.eq.${id}`)
      .order("created_at", { ascending: false })
      .limit(20);
    if (proposalsRes.error) {
      proposalsRes = await supabaseAdmin
        .from("proposal_history")
        .select("id, client_name, status, filename, created_at, proposal_data")
        .eq("proposal_data->>customer_id", id)
        .order("created_at", { ascending: false })
        .limit(20) as typeof proposalsRes;
    }
    const proposals = (proposalsRes.data || []).map((p) => {
      const pd = (p.proposal_data || {}) as { document?: { project_name?: string; total?: number } };
      return {
        id: p.id,
        title: pd.document?.project_name || p.filename || p.client_name || "Proposal",
        status: p.status || "draft",
        total: (p as { total?: number | null }).total ?? pd.document?.total ?? null,
        created_at: p.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        proposals,
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
    const auth = await verifyAuth(request);
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
    const auth = await verifyAuth(request);
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
