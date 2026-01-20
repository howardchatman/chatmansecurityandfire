import { NextRequest, NextResponse } from "next/server";
import { createLead, type Lead } from "@/lib/supabase";

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
  return NextResponse.json({
    success: true,
    message: "Leads API is working",
  });
}
