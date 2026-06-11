import { NextRequest, NextResponse } from "next/server";
import { createLead, getLeads, type Lead } from "@/lib/supabase";
import { sendLeadNotification, sendCustomerConfirmation } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    // Validate email format only if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { success: false, error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    // Build a rich message from LeadCaptureForm fields
    const messageParts: string[] = [];
    if (body.serviceNeed) messageParts.push(`Service needed: ${body.serviceNeed}`);
    if (body.buildingType) messageParts.push(`Building type: ${body.buildingType}`);
    if (body.description) messageParts.push(`Details: ${body.description}`);
    if (body.page) messageParts.push(`Page: ${body.page}`);
    if (body.message) messageParts.push(body.message);
    const composedMessage = messageParts.length ? messageParts.join("\n") : null;

    const lead: Lead = {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      message: composedMessage,
      preferred_contact: body.preferred_contact || "email",
      source: body.source || "website",
    };

    const data = await createLead(lead);

    // Send email notification (don't await to avoid slowing down response)
    sendLeadNotification({
      name: lead.name,
      email: lead.email || "not provided",
      phone: lead.phone || undefined,
      message: lead.message || undefined,
      source: lead.source || "website",
    }).catch((err) => console.error("Failed to send lead notification:", err));

    // Send confirmation to customer only if they provided an email
    if (lead.email) {
      sendCustomerConfirmation({
        customerEmail: lead.email,
        customerName: lead.name,
        service: body.serviceNeed || undefined,
      }).catch((err) => console.error("Failed to send customer confirmation:", err));
    }

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
