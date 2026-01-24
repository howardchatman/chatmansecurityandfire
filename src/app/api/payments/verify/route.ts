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

// GET: Verify payment by session ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Get the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // Check payment status
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { success: false, error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Get payment record from database
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select(`
        *,
        quote:security_quotes(quote_number)
      `)
      .eq("stripe_checkout_session_id", sessionId)
      .single();

    if (paymentError || !payment) {
      // Try to get receipt URL from Stripe
      let receiptUrl: string | null = null;
      const paymentIntent = session.payment_intent;

      if (paymentIntent && typeof paymentIntent === "object" && paymentIntent.latest_charge) {
        try {
          const chargeId = typeof paymentIntent.latest_charge === "string"
            ? paymentIntent.latest_charge
            : paymentIntent.latest_charge.id;
          const charge = await stripe.charges.retrieve(chargeId);
          receiptUrl = charge.receipt_url;
        } catch {
          // Ignore errors fetching receipt
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          amount: (session.amount_total || 0) / 100,
          payment_type: session.metadata?.payment_type || "full",
          receipt_url: receiptUrl,
          quote_number: session.metadata?.quote_number,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        amount: payment.amount,
        payment_type: payment.payment_type,
        receipt_url: payment.receipt_url,
        quote_number: payment.quote?.quote_number,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
