import { NextRequest, NextResponse } from "next/server";
import { createLead, getLeads, type Lead } from "@/lib/supabase";
import { sendLeadNotification, sendCustomerConfirmation } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    const lead: Lead = {
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      message: body.message || null,
      preferred_contact: body.preferred_contact || "email",
      source: body.source || "website",
    };

    const data = await createLead(lead);

    // Send email notification (don't await to avoid slowing down response)
    sendLeadNotification({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || undefined,
      message: lead.message || undefined,
      source: lead.source || "website",
    }).catch((err) => console.error("Failed to send lead notification:", err));

    // Send confirmation email to customer
    const serviceMatch = lead.message?.match(/Service needed: (.+)/);
    sendCustomerConfirmation({
      customerEmail: lead.email,
      customerName: lead.name,
      service: serviceMatch?.[1] || undefined,
    }).catch((err) => console.error("Failed to send customer confirmation:", err));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lead" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const leads = await getLeads();
    return NextResponse.json({
      success: true,
      data: leads,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
