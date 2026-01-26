import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/supabase";
import { sendAccessRequestNotification } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, reason } = body;

    // Validate required fields
    if (!name || !email || !company) {
      return NextResponse.json(
        { success: false, error: "Name, email, and company are required" },
        { status: 400 }
      );
    }

    // Create lead with source = "account_request"
    const lead = await createLead({
      name,
      email,
      phone: "", // Optional for account requests
      message: reason ? `Account Access Request: ${reason}\n\nCompany: ${company}` : `Account Access Request\n\nCompany: ${company}`,
      source: "account_request",
      preferred_contact: "email",
    });

    // Send email notification (don't await to avoid slowing down response)
    sendAccessRequestNotification({
      name,
      email,
      company,
      reason,
    }).catch((err) => console.error("Failed to send access request notification:", err));

    return NextResponse.json({
      success: true,
      data: lead,
      message: "Access request submitted successfully"
    });
  } catch (error) {
    console.error("Error creating access request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit access request" },
      { status: 500 }
    );
  }
}
