import { NextRequest, NextResponse } from "next/server";
// Webhooks are authenticated by Stripe's signature, not a user session, so they
// must use the service-role client. The anon client is blocked by RLS, which
// made every payment update silently no-op while still returning 200 to Stripe.
import { supabaseAdmin } from "@/lib/supabase";
import Stripe from "stripe";

// Lazy initialization to avoid build errors when STRIPE_SECRET_KEY is not set
let stripeInstance: Stripe | null = null;

function getStripe() {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("Stripe secret key is not configured");
    }
    stripeInstance = new Stripe(key, {
      apiVersion: "2025-12-15.clover",
    });
  }
  return stripeInstance;
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleInvoicePaid(stripeInvoice: Stripe.Invoice) {
  console.log("Invoice paid:", stripeInvoice.id);

  const amountPaid = (stripeInvoice.amount_paid || 0) / 100;

  const { data: invoice } = await supabaseAdmin
    .from("invoices")
    .select("id, total, customer_id")
    .eq("stripe_invoice_id", stripeInvoice.id)
    .single();

  if (!invoice) {
    console.error("No invoice found for stripe_invoice_id:", stripeInvoice.id);
    return;
  }

  const isFullyPaid = amountPaid >= (invoice.total || 0);

  await supabaseAdmin
    .from("invoices")
    .update({
      status: isFullyPaid ? "paid" : "partial",
      amount_paid: amountPaid,
      paid_at: isFullyPaid ? new Date().toISOString() : null,
    })
    .eq("id", invoice.id);

  // Record the payment itself. Marking the invoice paid is not enough — without
  // this row the admin Payments page and the customer's payment history stay
  // empty even though money moved, and there is no receipt to link to.
  await recordInvoicePayment(stripeInvoice, invoice, amountPaid);

  if (isFullyPaid) {
    // Also update the job status to paid if linked
    const { data: inv } = await supabaseAdmin
      .from("invoices")
      .select("job_id")
      .eq("id", invoice.id)
      .single();

    if (inv?.job_id) {
      await supabaseAdmin
        .from("jobs")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", inv.job_id);
    }
  }
}

/**
 * Insert a payments row for a paid Stripe invoice.
 *
 * Idempotent: Stripe retries webhooks, and invoice.paid can arrive more than
 * once, so a payment already recorded for this Stripe invoice is left alone
 * rather than duplicated into the books.
 */
async function recordInvoicePayment(
  stripeInvoice: Stripe.Invoice,
  invoice: { id: string; customer_id: string | null },
  amountPaid: number
) {
  const reference = `stripe:${stripeInvoice.id}`;

  const { data: existing } = await supabaseAdmin
    .from("payments")
    .select("id")
    .eq("invoice_id", invoice.id)
    .eq("notes", reference)
    .maybeSingle();

  if (existing) {
    console.log("Payment already recorded for", stripeInvoice.id);
    return;
  }

  // Work out how they actually paid — card vs ACH matters for reconciliation
  // and for what the customer sees on their receipt.
  let paymentMethod = "card";
  let receiptUrl: string | null = null;
  const paymentIntentId = (stripeInvoice as unknown as { payment_intent?: string })
    .payment_intent;

  if (paymentIntentId) {
    try {
      const stripe = getStripe();
      const charges = await stripe.charges.list({ payment_intent: paymentIntentId, limit: 1 });
      const charge = charges.data[0];
      receiptUrl = charge?.receipt_url ?? null;
      const type = charge?.payment_method_details?.type;
      if (type === "us_bank_account" || type === "ach_debit") paymentMethod = "ach";
      else if (type) paymentMethod = type;
    } catch (err) {
      // Never let a lookup failure lose the payment record itself.
      console.error("Could not resolve charge details for", paymentIntentId, err);
    }
  }

  const { error } = await supabaseAdmin.from("payments").insert({
    invoice_id: invoice.id,
    customer_id: invoice.customer_id,
    amount: amountPaid,
    payment_method: paymentMethod,
    payment_date: new Date().toISOString(),
    status: "completed",
    receipt_url: receiptUrl,
    notes: reference,
  });

  if (error) {
    console.error("Failed to record payment for", stripeInvoice.id, error);
  } else {
    console.log(`Recorded ${paymentMethod} payment of ${amountPaid} for invoice`, invoice.id);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("Checkout completed:", session.id);

  const { quote_id, acceptance_id, payment_type } = session.metadata || {};

  // Update payment record
  const { error: paymentError } = await supabaseAdmin
    .from("payments")
    .update({
      status: "succeeded",
      stripe_payment_intent_id: session.payment_intent as string,
      paid_at: new Date().toISOString(),
    })
    .eq("stripe_checkout_session_id", session.id);

  if (paymentError) {
    console.error("Error updating payment:", paymentError);
  }

  // Update quote status
  if (quote_id) {
    const updateData: Record<string, unknown> = {};

    if (payment_type === "deposit") {
      updateData.deposit_paid = true;
      updateData.deposit_paid_at = new Date().toISOString();
      updateData.payment_status = "deposit_paid";
    } else {
      updateData.status = "paid";
      updateData.payment_status = "paid";
    }

    const { error: quoteError } = await supabaseAdmin
      .from("quotes")
      .update(updateData)
      .eq("id", quote_id);

    if (quoteError) {
      console.error("Error updating quote:", quoteError);
    }
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment succeeded:", paymentIntent.id);

  const stripe = getStripe();

  // Get the charge for receipt URL
  const charges = await stripe.charges.list({
    payment_intent: paymentIntent.id,
    limit: 1,
  });

  const receiptUrl = charges.data[0]?.receipt_url;

  // Update payment record
  const { error } = await supabaseAdmin
    .from("payments")
    .update({
      status: "succeeded",
      stripe_charge_id: charges.data[0]?.id,
      receipt_url: receiptUrl,
      paid_at: new Date().toISOString(),
    })
    .eq("stripe_payment_intent_id", paymentIntent.id);

  if (error) {
    console.error("Error updating payment:", error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment failed:", paymentIntent.id);

  const failureMessage = paymentIntent.last_payment_error?.message || "Payment failed";

  // Update payment record
  const { error } = await supabaseAdmin
    .from("payments")
    .update({
      status: "failed",
      failure_reason: failureMessage,
      failed_at: new Date().toISOString(),
    })
    .eq("stripe_payment_intent_id", paymentIntent.id);

  if (error) {
    console.error("Error updating payment:", error);
  }
}

async function handleRefund(charge: Stripe.Charge) {
  console.log("Refund processed:", charge.id);

  const refundAmount = charge.amount_refunded / 100;
  const isFullRefund = charge.refunded;

  // Update payment record
  const { error } = await supabaseAdmin
    .from("payments")
    .update({
      status: isFullRefund ? "refunded" : "partially_refunded",
      refund_amount: refundAmount,
      refunded_at: new Date().toISOString(),
    })
    .eq("stripe_charge_id", charge.id);

  if (error) {
    console.error("Error updating payment:", error);
  }

  // Update quote payment status if fully refunded
  if (isFullRefund) {
    // Get the payment to find the quote
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("quote_id")
      .eq("stripe_charge_id", charge.id)
      .single();

    if (payment?.quote_id) {
      await supabaseAdmin
        .from("quotes")
        .update({ payment_status: "refunded" })
        .eq("id", payment.quote_id);
    }
  }
}

// Note: In Next.js App Router, request.text() handles raw body access
// No need for bodyParser: false config like in Pages Router
