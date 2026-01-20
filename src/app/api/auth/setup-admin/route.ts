import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// This endpoint creates the admin user if it doesn't exist
// Should only be called once during setup
export async function POST() {
  const adminEmail = "howard@chatmaninc.com";
  const adminPassword = "Howard1234";

  try {
    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(
      (user) => user.email === adminEmail
    );

    if (userExists) {
      return NextResponse.json({
        success: true,
        message: "Admin user already exists",
      });
    }

    // Create the admin user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: "Howard",
        role: "admin",
      },
    });

    if (error) {
      console.error("Error creating admin user:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      userId: data.user.id,
    });
  } catch (error) {
    console.error("Error in setup-admin:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create admin user" },
      { status: 500 }
    );
  }
}
