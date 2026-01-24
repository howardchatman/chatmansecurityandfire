import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Stripe from "stripe";

// Lazy initialization to avoid build errors when STRIPE_SECRET_KEY is not set
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Stripe secret key is not configured");
  }
  return new Stripe(key, {
    apiVersion: "2025-12-15.clover",
  });
}

// POST: Accept/approve a quote via customer link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const {
      signature_name,
      signature_email,
      payment_option = "pay_later",
    } = body;

    // Validate input
    if (!signature_name || !signature_email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Get the customer link
    const { data: link, error: linkError } = await supabase
      .from("customer_links")
      .select(`
        *,
        quote:security_quotes(
          id,
          quote_number,
          status,
          totals,
          deposit_amount,
          customer
        )
      `)
      .eq("token", token)
      .single();

    if (linkError || !link) {
      return NextResponse.json(
        { success: false, error: "Invalid link" },
        { status: 404 }
      );
    }

    // Check link validity
    if (link.status !== "active") {
      return NextResponse.json(
        { success: false, error: "This link is no longer active" },
        { status: 403 }
      );
    }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      // Auto-expire the link
      await supabase
        .from("customer_links")
        .update({ status: "expired" })
        .eq("id", link.id);

      return NextResponse.json(
        { success: false, error: "This link has expired" },
        { status: 403 }
      );
    }

    // Check if quote exists and is acceptable
    const quote = link.quote;
    if (!quote) {
      return NextResponse.json(
        { success: false, error: "Quote not found" },
        { status: 404 }
      );
    }

    if (!["sent", "viewed"].includes(quote.status)) {
      return NextResponse.json(
        { success: false, error: "This quote has already been processed" },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
    const userAgent = request.headers.get("user-agent") || "";

    // Calculate amounts
    const total = quote.totals?.total || quote.totals?.grandTotal || 0;
    const depositAmount = quote.deposit_amount || 0;
    const paymentAmount = payment_option === "pay_deposit" ? depositAmount : total;

    // Create quote acceptance record
    const { data: acceptance, error: acceptanceError } = await supabase
      .from("quote_acceptances")
      .insert({
        quote_id: quote.id,
        customer_link_id: link.id,
        accepted_by_name: signature_name,
        accepted_by_email: signature_email,
        accepted_by_ip: ip,
        signature_type: "typed",
        signature_data: signature_name,
        terms_accepted: true,
        payment_option,
        deposit_amount: payment_option === "pay_deposit" ? depositAmount : null,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (acceptanceError) {
      console.error("Error creating acceptance:", acceptanceError);
      return NextResponse.json(
        { success: false, error: "Failed to record acceptance" },
        { status: 500 }
      );
    }

    // Update the quote status
    const { error: quoteUpdateError } = await supabase
      .from("security_quotes")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        accepted_by: signature_name,
      })
      .eq("id", quote.id);

    if (quoteUpdateError) {
      console.error("Error updating quote:", quoteUpdateError);
    }

    // Record link access
    await supabase.from("customer_link_access_log").insert({
      customer_link_id: link.id,
      ip_address: ip,
      user_agent: userAgent,
      action: "approve",
    });

    // If paying now, create Stripe checkout session
    if (payment_option !== "pay_later" && paymentAmount > 0) {
      try {
        const stripe = getStripe();
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://chatmansecurityandfire.com";

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Chatman Security & Fire - ${quote.quote_number}`,
                  description: payment_option === "pay_deposit"
                    ? "Deposit payment"
                    : "Full payment",
                },
                unit_amount: Math.round(paymentAmount * 100), // Convert to cents
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${baseUrl}/c/${token}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/c/${token}`,
          customer_email: signature_email,
          metadata: {
            quote_id: quote.id,
            quote_number: quote.quote_number,
            customer_link_id: link.id,
            acceptance_id: acceptance.id,
            payment_type: payment_option === "pay_deposit" ? "deposit" : "full",
          },
        });

        // Create pending payment record
        await supabase.from("payments").insert({
          quote_id: quote.id,
          customer_link_id: link.id,
          quote_acceptance_id: acceptance.id,
          stripe_checkout_session_id: session.id,
          amount: paymentAmount,
          payment_type: payment_option === "pay_deposit" ? "deposit" : "full",
          status: "pending",
          customer_email: signature_email,
          customer_name: signature_name,
          team_id: link.team_id,
        });

        return NextResponse.json({
          success: true,
          message: "Quote approved",
          checkout_url: session.url,
          acceptance_id: acceptance.id,
        });
      } catch (stripeError) {
        console.error("Stripe error:", stripeError);
        // Still return success for the approval, just without payment
        return NextResponse.json({
          success: true,
          message: "Quote approved. Payment processing unavailable.",
          acceptance_id: acceptance.id,
        });
      }
    }

    // No payment requested
    return NextResponse.json({
      success: true,
      message: "Quote approved successfully",
      acceptance_id: acceptance.id,
    });
  } catch (error) {
    console.error("Error accepting quote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process approval" },
      { status: 500 }
    );
  }
}
