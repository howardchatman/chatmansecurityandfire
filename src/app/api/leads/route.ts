import { NextRequest, NextResponse } from "next/server";
import { createLead, getLeads, type Lead } from "@/lib/supabase";
import { sendLeadNotification, sendCustomerConfirmation } from "@/lib/email";
import { upsertGhlContact } from "@/lib/gohighlevel";
import { verifyAuth } from "@/lib/auth";

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

    // Phone is required for anything that's an actual service inquiry — every
    // one of those leads should be callable. Content downloads (the printable
    // checklist) are email-only lead magnets and are exempt.
    const PHONE_EXEMPT_SOURCES = ["checklist_page", "checklist", "checklist_pdf", "newsletter"];
    const source = String(body.source || "website");
    if (!PHONE_EXEMPT_SOURCES.includes(source)) {
      const digits = String(body.phone || "").replace(/\D/g, "");
      if (!digits) {
        return NextResponse.json(
          { success: false, error: "Phone number is required" },
          { status: 400 }
        );
      }
      if (digits.length < 10) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid 10-digit phone number" },
          { status: 400 }
        );
      }
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
    const composedMessage = messageParts.length ? messageParts.join("\n") : undefined;

    const lead: Lead = {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      message: composedMessage,
      preferred_contact: body.preferred_contact || "email",
      source: body.source || "website",
    };

    const data = await createLead(lead);

    // Push into GoHighLevel — the single source of truth for CRM / leads /
    // sales pipeline. Fires for every lead (phone-only or with email).
    upsertGhlContact({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source || "website",
      tags: [body.serviceNeed, body.buildingType].filter(Boolean),
      note: lead.message || undefined,
    }).catch((err) => console.error("Failed to push lead to GoHighLevel:", err));

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

// Listing leads exposes customer PII — staff only. (POST stays public: it is
// what the website's contact / service forms submit to.)
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !["admin", "manager"].includes(auth.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

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
