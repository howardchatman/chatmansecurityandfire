import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendAccessGrantedEmail } from "@/lib/email";
import crypto from "crypto";

// Generate URL-safe random token
function generateToken(): string {
  const bytes = crypto.randomBytes(32);
  return bytes.toString("base64url");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Parse company from message if it's an access request
    let company = "";
    if (lead.message) {
      const companyMatch = lead.message.match(/Company:\s*(.+)/);
      if (companyMatch) {
        company = companyMatch[1].trim();
      }
    }

    // Check if customer already exists
    let customer;
    const { data: existingCustomer } = await supabase
      .from("security_customers")
      .select("*")
      .eq("email", lead.email)
      .single();

    if (existingCustomer) {
      customer = existingCustomer;
    } else {
      // Create customer record
      const { data: newCustomer, error: customerError } = await supabase
        .from("security_customers")
        .insert({
          name: lead.name,
          email: lead.email,
          phone: lead.phone || null,
          company: company || null,
          status: "active",
        })
        .select()
        .single();

      if (customerError) {
        console.error("Error creating customer:", customerError);
        return NextResponse.json(
          { success: false, error: "Failed to create customer" },
          { status: 500 }
        );
      }
      customer = newCustomer;
    }

    // Generate portal access token
    const token = generateToken();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://chatmansecurityandfire.com";
    const portalUrl = `${baseUrl}/c/${token}`;

    // Calculate expiration (1 year for portal access)
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    // Create customer link for portal access
    const { error: linkError } = await supabase
      .from("customer_links")
      .insert({
        token,
        customer_email: lead.email,
        customer_name: lead.name,
        customer_phone: lead.phone || null,
        link_type: "portal_access",
        expires_at: expiresAt,
        status: "active",
      });

    if (linkError) {
      console.error("Error creating customer link:", linkError);
      // Continue anyway - customer was created
    }

    // Update lead status to won
    const { error: updateError } = await supabase
      .from("leads")
      .update({ status: "won" })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating lead status:", updateError);
    }

    // Send access granted email
    sendAccessGrantedEmail({
      customerEmail: lead.email,
      customerName: lead.name,
      portalUrl,
    }).catch((err) => console.error("Failed to send access granted email:", err));

    return NextResponse.json({
      success: true,
      data: {
        customer,
        portalUrl,
        message: "Access granted successfully",
      },
    });
  } catch (error) {
    console.error("Error granting access:", error);
    return NextResponse.json(
      { success: false, error: "Failed to grant access" },
      { status: 500 }
    );
  }
}
