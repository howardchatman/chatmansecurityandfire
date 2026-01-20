import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyPassword, createToken, AUTH_COOKIE_NAME, User } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Look up user in security_admin_users table
    const { data: user, error } = await supabaseAdmin
      .from("security_admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("is_active", true)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login
    await supabaseAdmin
      .from("security_admin_users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    // Create JWT token
    const tokenUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = await createToken(tokenUser);

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: tokenUser,
    });

    // Set httpOnly cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
