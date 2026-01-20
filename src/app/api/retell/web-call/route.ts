import { NextRequest, NextResponse } from "next/server";
import { createWebCall } from "@/lib/retell";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    // Create metadata for the call
    const metadata: Record<string, string> = {};
    if (name) metadata.caller_name = name;
    if (email) metadata.caller_email = email;
    if (phone) metadata.caller_phone = phone;

    // Create web call via Retell
    const webCallData = await createWebCall(
      Object.keys(metadata).length > 0 ? metadata : undefined
    );

    if (!webCallData) {
      return NextResponse.json(
        {
          success: false,
          error: "Voice calling is not configured. Please call 1-800-555-1234 for immediate assistance.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        call_id: webCallData.call_id,
        access_token: webCallData.access_token,
      },
    });
  } catch (error) {
    console.error("Web call API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create web call" },
      { status: 500 }
    );
  }
}
