import { NextRequest, NextResponse } from "next/server";
import { createQuote, getQuotes } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const quotes = await getQuotes(status);
    return NextResponse.json({ success: true, data: quotes });
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.quote_type || !body.customer || !body.site || !body.line_items) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const quote = await createQuote({
      quote_type: body.quote_type,
      template_name: body.template_name,
      status: body.status || "draft",
      customer: body.customer,
      site: body.site,
      line_items: body.line_items,
      totals: body.totals,
      terms: body.terms,
      expires_at: body.expires_at,
    });

    return NextResponse.json({ success: true, data: quote });
  } catch (error) {
    console.error("Error creating quote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create quote" },
      { status: 500 }
    );
  }
}
