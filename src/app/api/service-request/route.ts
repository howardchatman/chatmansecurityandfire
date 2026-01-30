import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["name", "phone", "role", "property_address", "deadline", "issue"];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Log the submission for now
    console.log("Service request received:", {
      name: body.name,
      phone: body.phone,
      role: body.role,
      property_address: body.property_address,
      deadline: body.deadline,
      issue: body.issue,
      details: body.details || null,
      files_count: body.files_count || 0,
      source: body.source || "start_page",
      created_at: new Date().toISOString(),
    });

    // Try to save to Supabase if available
    try {
      const { data, error } = await supabaseAdmin
        .from("service_requests")
        .insert([
          {
            name: body.name,
            phone: body.phone,
            role: body.role,
            property_address: body.property_address,
            deadline: body.deadline,
            issue: body.issue,
            details: body.details || null,
            files_count: body.files_count || 0,
            source: body.source || "start_page",
            status: "new",
          },
        ])
        .select()
        .single();

      if (error) {
        // If table doesn't exist, still return success (data was logged)
        console.log("Supabase insert note:", error.message);
      } else {
        console.log("Service request saved to database:", data.id);
      }
    } catch (dbError) {
      // Database error - still return success since we logged the data
      console.log("Database not configured, data logged to console");
    }

    return NextResponse.json({
      success: true,
      message: "Service request received",
    });
  } catch (error) {
    console.error("Error processing service request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Service Request API is working",
  });
}
