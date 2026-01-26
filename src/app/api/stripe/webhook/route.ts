import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    let event;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 }
        );
      }
    } else {
      // For testing without signature verification
      event = JSON.parse(body);
    }

    console.log("[Stripe Webhook] Received:", event.type);

    switch (event.type) {
      case "invoice.paid": {
        const invoice = event.data.object;
        console.log("[Stripe Webhook] Invoice paid:", invoice.id);

        // Update invoice status in database if tracking
        if (invoice.metadata?.invoice_db_id) {
          await supabase
            .from("security_invoices")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              stripe_payment_intent: invoice.payment_intent,
            })
            .eq("id", invoice.metadata.invoice_db_id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.log("[Stripe Webhook] Invoice payment failed:", invoice.id);

        if (invoice.metadata?.invoice_db_id) {
          await supabase
            .from("security_invoices")
            .update({ status: "payment_failed" })
            .eq("id", invoice.metadata.invoice_db_id);
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("[Stripe Webhook] Checkout completed:", session.id);

        // Handle successful payment from payment link
        if (session.metadata?.type === "deposit") {
          // Could trigger balance invoice creation here
          console.log("Deposit payment received, may need to create balance invoice");
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("[Stripe Webhook] Payment succeeded:", paymentIntent.id);
        break;
      }

      default:
        console.log("[Stripe Webhook] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
