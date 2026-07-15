import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-min-32-chars-long!!"
);

const VALID_ROLES = ["admin", "manager", "technician", "inspector", "dispatcher"];

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

// Readable temporary password (no ambiguous chars)
function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let p = "";
  for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

// POST: Add an employee to admin_users (the table login actually checks)
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const email: string | undefined = body.email?.toLowerCase().trim();
    const name: string | undefined = body.full_name || body.name;
    const role: string | undefined = body.role;

    if (!email || !name || !role) {
      return NextResponse.json(
        { success: false, error: "Email, full name, and role are required" },
        { status: 400 }
      );
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    // Prevent duplicates
    const { data: existing } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .insert({
        email,
        name,
        role,
        is_active: true,
        password_hash: passwordHash,
      })
      .select("id, email, name, role, is_active, created_at")
      .single();

    if (error) {
      console.error("Error creating employee:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      tempPassword,
      message: `${name} added. Share their temporary password so they can log in and change it.`,
    });
  } catch (error) {
    console.error("Error adding employee:", error);
    const msg = error instanceof Error ? error.message : "Failed to add employee";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// GET: List employees from admin_users
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    let query = supabaseAdmin
      .from("admin_users")
      .select("id, email, name, role, is_active, last_login, created_at")
      .order("created_at", { ascending: true });

    if (role && role !== "all") {
      query = query.eq("role", role);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: "Failed to fetch employees" }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch employees" }, { status: 500 });
  }
}

// PATCH: Update an employee's role or active status
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, role, is_active, name } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Employee id is required" }, { status: 400 });
    }
    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active;
    if (name !== undefined) updates.name = name;

    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .update(updates)
      .eq("id", id)
      .select("id, email, name, role, is_active")
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json({ success: false, error: "Failed to update employee" }, { status: 500 });
  }
}
