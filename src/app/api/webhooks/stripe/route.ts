import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("Checkout completed:", session.id);

  const { quote_id, acceptance_id, payment_type } = session.metadata || {};

  // Update payment record
  const { error: paymentError } = await supabase
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

    const { error: quoteError } = await supabase
      .from("security_quotes")
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
  const { error } = await supabase
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
  const { error } = await supabase
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
  const { error } = await supabase
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
    const { data: payment } = await supabase
      .from("payments")
      .select("quote_id")
      .eq("stripe_charge_id", charge.id)
      .single();

    if (payment?.quote_id) {
      await supabase
        .from("security_quotes")
        .update({ payment_status: "refunded" })
        .eq("id", payment.quote_id);
    }
  }
}

// Note: In Next.js App Router, request.text() handles raw body access
// No need for bodyParser: false config like in Pages Router
