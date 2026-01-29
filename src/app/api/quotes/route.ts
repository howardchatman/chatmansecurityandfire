import { NextRequest, NextResponse } from "next/server";
import { createQuote, getQuotes, supabaseAdmin } from "@/lib/supabase";

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

    // Upsert customer to security_customers CRM table
    const customerData = body.customer;
    if (customerData.email) {
      try {
        // Check if customer already exists by email
        const { data: existing } = await supabaseAdmin
          .from("security_customers")
          .select("id")
          .eq("email", customerData.email)
          .single();

        if (existing) {
          // Update existing customer
          await supabaseAdmin
            .from("security_customers")
            .update({
              name: customerData.name,
              phone: customerData.phone || undefined,
              company: customerData.company || undefined,
              address: customerData.address || undefined,
              city: customerData.city || undefined,
              state: customerData.state || undefined,
              zip: customerData.zip || undefined,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
        } else {
          // Create new customer
          await supabaseAdmin
            .from("security_customers")
            .insert([{
              name: customerData.name,
              email: customerData.email,
              phone: customerData.phone || null,
              company: customerData.company || null,
              address: customerData.address || null,
              city: customerData.city || null,
              state: customerData.state || null,
              zip: customerData.zip || null,
              status: "active",
            }]);
        }
      } catch (err) {
        // Don't fail the quote save if customer upsert fails
        console.error("Error upserting customer:", err);
      }
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
