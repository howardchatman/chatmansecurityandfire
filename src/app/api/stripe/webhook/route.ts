import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
// Webhooks are authenticated by Stripe's signature, not a user session, so they
// must use the service-role client. The anon client is blocked by RLS, which
// made every payment update silently no-op while still returning 200 to Stripe.
import { supabaseAdmin } from "@/lib/supabase";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    // The signature is the ONLY thing authenticating this endpoint. There is no
    // unverified path: this previously fell back to trusting the raw body when
    // no signature header was present, which let anyone POST a forged
    // invoice.paid and mark an invoice paid without paying.
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured — refusing webhook");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("[Stripe Webhook] Received:", event.type);

    switch (event.type) {
      case "invoice.paid": {
        const invoice = event.data.object;
        console.log("[Stripe Webhook] Invoice paid:", invoice.id);

        // Update invoice status in database if tracking
        if (invoice.metadata?.invoice_db_id) {
          await supabaseAdmin
            .from("invoices")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              // payment_intent is no longer on the Invoice type in this API
              // version but is still present on the wire for card payments.
              stripe_payment_intent:
                (invoice as unknown as { payment_intent?: string }).payment_intent ?? null,
            })
            .eq("id", invoice.metadata.invoice_db_id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.log("[Stripe Webhook] Invoice payment failed:", invoice.id);

        if (invoice.metadata?.invoice_db_id) {
          await supabaseAdmin
            .from("invoices")
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
