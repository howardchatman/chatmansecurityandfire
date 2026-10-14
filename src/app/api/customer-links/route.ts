import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { createQuoteLink, generateLinkToken } from "@/lib/customer-links";
import { sendQuoteEmail } from "@/lib/email";

// GET: List customer links (admin/manager only)
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!["admin", "manager"].includes(auth.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get("quote_id");
    const jobId = searchParams.get("job_id");
    const status = searchParams.get("status");

    let query = supabase
      .from("customer_links")
      .select(`
        *,
        quote:quotes(id, quote_number, status, totals),
        job:jobs(id, job_number, status),
        created_by_user:profiles!customer_links_created_by_fkey(full_name)
      `)
      .order("created_at", { ascending: false });

    if (quoteId) {
      query = query.eq("quote_id", quoteId);
    }
    if (jobId) {
      query = query.eq("job_id", jobId);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching customer links:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch customer links" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching customer links:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer links" },
      { status: 500 }
    );
  }
}

// POST: Create a new customer link
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!["admin", "manager"].includes(auth.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      quote_id,
      job_id,
      customer_email,
      customer_name,
      customer_phone,
      link_type = "quote_approval",
      expires_in_days = 30,
      max_uses,
      send_email = false,
    } = body;

    // Validate required fields
    if (!customer_email) {
      return NextResponse.json(
        { success: false, error: "Customer email is required" },
        { status: 400 }
      );
    }

    if (!quote_id && !job_id) {
      return NextResponse.json(
        { success: false, error: "Either quote_id or job_id is required" },
        { status: 400 }
      );
    }

    // Job links keep their own flow below; quote links go through the shared
    // helper, which also moves the quote from draft to sent.
    let link;
    let portalUrl: string;
    if (quote_id && link_type === "quote_approval") {
      try {
        const created = await createQuoteLink({
          quoteId: quote_id,
          customerEmail: customer_email,
          customerName: customer_name,
          customerPhone: customer_phone,
          createdBy: auth.userId,
          teamId: auth.teamId,
          expiresInDays: expires_in_days,
          maxUses: max_uses,
        });
        link = created.link;
        portalUrl = created.url;
      } catch (createError) {
        console.error("Error creating customer link:", createError);
        return NextResponse.json(
          { success: false, error: "Failed to create customer link" },
          { status: 500 }
        );
      }
    } else {
      const token = generateLinkToken();
      const expiresAt = expires_in_days
        ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000)
        : null;
      const { data, error: createError } = await supabase
        .from("customer_links")
        .insert({
          token,
          quote_id,
          job_id,
          customer_email,
          customer_name,
          customer_phone,
          link_type,
          expires_at: expiresAt,
          max_uses,
          created_by: auth.userId,
          team_id: auth.teamId,
        })
        .select()
        .single();
      if (createError) {
        console.error("Error creating customer link:", createError);
        return NextResponse.json(
          { success: false, error: "Failed to create customer link" },
          { status: 500 }
        );
      }
      link = data;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.chatmansecurityandfire.com";
      portalUrl = `${baseUrl}/c/${token}`;
    }

    let emailed = false;
    if (send_email && quote_id) {
      const { data: q } = await supabase
        .from("quotes")
        .select("quote_number, totals, template_name")
        .eq("id", quote_id)
        .maybeSingle();
      if (q) {
        const result = await sendQuoteEmail({
          customerEmail: customer_email,
          customerName: customer_name || "there",
          quoteNumber: q.quote_number,
          total: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
            q.totals?.total || q.totals?.grandTotal || 0
          ),
          description: q.template_name || "Fire & Life Safety Services",
          viewUrl: portalUrl,
        });
        emailed = !!result?.success;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...link,
        portal_url: portalUrl,
        emailed,
      },
    });
  } catch (error) {
    console.error("Error creating customer link:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create customer link" },
      { status: 500 }
    );
  }
}
