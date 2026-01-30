import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import {
  getOrCreateStripeCustomer,
  createInvoice as createStripeInvoice,
  sendInvoice as sendStripeInvoice,
  formatAmount,
} from "@/lib/stripe";
import { sendInvoiceEmail } from "@/lib/email";

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

// POST: Send invoice via Stripe + Email
export async function POST(
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

    // Fetch invoice with customer and items
    const { data: invoice, error } = await supabaseAdmin
      .from("invoices")
      .select(`
        *,
        customer:customers(id, name, email, phone, company),
        items:invoice_items(*)
      `)
      .eq("id", id)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    if (!invoice.customer?.email) {
      return NextResponse.json({ success: false, error: "Customer email is required to send invoice" }, { status: 400 });
    }

    // Create Stripe customer
    const stripeCustomer = await getOrCreateStripeCustomer({
      email: invoice.customer.email,
      name: invoice.customer.name || invoice.customer.company || "Customer",
      phone: invoice.customer.phone,
    });

    // Build Stripe invoice items from our line items
    const stripeItems = (invoice.items || []).map((item: { description: string; total: number }) => ({
      description: item.description,
      amount: Math.round(item.total * 100), // Convert to cents
    }));

    // Create and send Stripe invoice
    const stripeInvoice = await createStripeInvoice({
      customerId: stripeCustomer.id,
      items: stripeItems,
      dueDate: invoice.due_date
        ? new Date(invoice.due_date)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      metadata: {
        invoice_db_id: invoice.id,
        invoice_number: invoice.invoice_number,
      },
    });

    await sendStripeInvoice(stripeInvoice.id);

    // Update our invoice with Stripe data
    await supabaseAdmin
      .from("invoices")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        stripe_invoice_id: stripeInvoice.id,
        stripe_hosted_url: stripeInvoice.hosted_invoice_url || null,
        stripe_pdf_url: stripeInvoice.invoice_pdf || null,
      })
      .eq("id", id);

    // Send email notification
    if (stripeInvoice.hosted_invoice_url) {
      const dueDate = invoice.due_date
        ? new Date(invoice.due_date).toLocaleDateString()
        : "Upon Receipt";

      sendInvoiceEmail({
        customerEmail: invoice.customer.email,
        customerName: invoice.customer.name || invoice.customer.company || "Customer",
        invoiceNumber: invoice.invoice_number,
        total: formatAmount(Math.round(invoice.total * 100)),
        dueDate,
        description: `Invoice ${invoice.invoice_number}`,
        payUrl: stripeInvoice.hosted_invoice_url,
      }).catch((err) => console.error("Failed to send invoice email:", err));
    }

    return NextResponse.json({
      success: true,
      message: "Invoice sent successfully",
      data: {
        stripe_invoice_id: stripeInvoice.id,
        hosted_url: stripeInvoice.hosted_invoice_url,
        pdf_url: stripeInvoice.invoice_pdf,
      },
    });
  } catch (error) {
    console.error("Error sending invoice:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send invoice" },
      { status: 500 }
    );
  }
}
