import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2025-12-15.clover" });
}

// POST: Create a Stripe Checkout session for an already-accepted quote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { customer_email, customer_name, payment_type = "full" } = body;

    // Load link + quote
    const { data: link, error: linkError } = await supabase
      .from("customer_links")
      .select(`
        *,
        quote:quotes(
          id,
          quote_number,
          status,
          payment_status,
          totals,
          deposit_amount,
          customer
        )
      `)
      .eq("token", token)
      .single();

    if (linkError || !link) {
      return NextResponse.json({ error: "Invalid link" }, { status: 404 });
    }

    if (link.status !== "active") {
      return NextResponse.json({ error: "This link is no longer active" }, { status: 403 });
    }

    const quote = link.quote;
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Only allow payment on accepted quotes that aren't fully paid
    if (!["accepted", "sent", "viewed"].includes(quote.status)) {
      return NextResponse.json({ error: "This quote cannot be paid at this time" }, { status: 400 });
    }

    if (quote.payment_status === "paid") {
      return NextResponse.json({ error: "This quote has already been paid" }, { status: 400 });
    }

    const total = quote.totals?.total || quote.totals?.grandTotal || 0;
    const depositAmount = quote.deposit_amount || 0;
    const paymentAmount = payment_type === "deposit" && depositAmount > 0 ? depositAmount : total;

    if (paymentAmount <= 0) {
      return NextResponse.json({ error: "No amount due" }, { status: 400 });
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://chatmansecurityandfire.com";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "us_bank_account"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Chatman Security & Fire – ${quote.quote_number}`,
              description: payment_type === "deposit" ? "Deposit payment" : "Full payment",
            },
            unit_amount: Math.round(paymentAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/c/${token}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/c/${token}`,
      customer_email: customer_email || quote.customer?.email || undefined,
      metadata: {
        quote_id: quote.id,
        quote_number: quote.quote_number,
        customer_link_id: link.id,
        payment_type,
      },
    });

    // Record pending payment
    await supabase.from("payments").insert({
      quote_id: quote.id,
      customer_link_id: link.id,
      stripe_checkout_session_id: session.id,
      amount: paymentAmount,
      payment_type,
      status: "pending",
      customer_email: customer_email || quote.customer?.email || null,
      customer_name: customer_name || quote.customer?.name || null,
      team_id: link.team_id,
    });

    return NextResponse.json({ checkout_url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 });
  }
}
