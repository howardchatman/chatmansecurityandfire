import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import crypto from "crypto";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-min-32-chars-long!!"
);

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string; role: string; teamId?: string };
  } catch {
    return null;
  }
}

// Generate URL-safe random token
function generateToken(): string {
  const bytes = crypto.randomBytes(32);
  return bytes.toString("base64url");
}

// GET: List customer links (admin/manager only)
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth();
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
    const auth = await verifyAuth();
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

    // Generate unique token
    const token = generateToken();

    // Calculate expiration
    const expiresAt = expires_in_days
      ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000)
      : null;

    // Create the customer link
    const { data: link, error: createError } = await supabase
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

    // Build the full URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://chatmansecurityandfire.com";
    const portalUrl = `${baseUrl}/c/${token}`;

    // TODO: Send email if requested
    if (send_email) {
      // Email sending will be implemented with the email service
      console.log("Would send email to:", customer_email, "with link:", portalUrl);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...link,
        portal_url: portalUrl,
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
