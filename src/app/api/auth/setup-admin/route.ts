import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth";

// This endpoint creates/updates users with correct password hashes
// Call this once to set up accounts
export async function POST() {
  const users = [
    {
      email: "howard@chatmaninc.com",
      password: "Howard1234",
      name: "Howard",
      role: "admin",
    },
    {
      email: "howardchatman@hotmail.com",
      password: "Howard1234",
      name: "Howard Chatman",
      role: "customer",
    },
  ];

  try {
    const results = [];

    for (const user of users) {
      // Hash the password properly with bcrypt
      const passwordHash = await hashPassword(user.password);

      // Upsert the user
      const { data, error } = await supabaseAdmin
        .from("security_admin_users")
        .upsert(
          {
            email: user.email,
            password_hash: passwordHash,
            name: user.name,
            role: user.role,
            is_active: true,
          },
          { onConflict: "email" }
        )
        .select()
        .single();

      if (error) {
        console.error(`Error creating user ${user.email}:`, error);
        results.push({ email: user.email, success: false, error: error.message });
      } else {
        results.push({ email: user.email, success: true, userId: data.id, role: user.role });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Users created/updated successfully",
      results,
    });
  } catch (error) {
    console.error("Error in setup:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create users" },
      { status: 500 }
    );
  }
}

// Also allow GET for easy browser access
export async function GET() {
  return POST();
}
