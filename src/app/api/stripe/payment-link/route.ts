import { NextRequest, NextResponse } from "next/server";
import { createPaymentLink, centsFromDollars } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      description,
      amount, // in dollars
      customerEmail,
      metadata,
    } = body;

    // Validate required fields
    if (!description || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: description, amount" },
        { status: 400 }
      );
    }

    const amountInCents = centsFromDollars(amount);

    const paymentLink = await createPaymentLink({
      amount: amountInCents,
      description,
      customerEmail,
      metadata,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: paymentLink.url,
        id: paymentLink.id,
        amount: amountInCents,
        description,
      },
    });
  } catch (error) {
    console.error("Error creating payment link:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create payment link" },
      { status: 500 }
    );
  }
}
