import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hashPassword, verifyAuth } from "@/lib/auth";
import {
  generateInviteToken,
  inviteExpiry,
  buildInviteUrl,
  sendEmployeeInviteEmail,
  INVITE_TTL_DAYS,
} from "@/lib/employee-invite";

// admin_users backs every login, customers included — "customer" accounts are
// what the /portal area authenticates against.
const VALID_ROLES = ["admin", "manager", "technician", "inspector", "dispatcher", "customer"];

async function verifyAdminAuth(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth || auth.role !== "admin") return null;
  return auth;
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
    const auth = await verifyAdminAuth(request);
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
    const phone: string | undefined = body.phone?.trim() || undefined;

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

    // Two ways to onboard:
    //  "invite"   (default) — email a one-time link, they choose their own
    //                         password. The admin never handles a credential.
    //  "password"           — generate a temp password to read out to them,
    //                         for someone without working email.
    const method: "invite" | "password" = body.method === "password" ? "password" : "invite";

    // An account always gets a password hash so no row is ever passwordless;
    // for the invite flow it is a random value nobody is told, and setting a
    // password through the invite link replaces it.
    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(
      method === "password" ? tempPassword : generateInviteToken()
    );

    const row: Record<string, unknown> = {
      email,
      name,
      role,
      is_active: true,
      password_hash: passwordHash,
    };
    if (phone) row.phone = phone;

    let inviteToken: string | null = null;
    if (method === "invite") {
      inviteToken = generateInviteToken();
      row.invite_token = inviteToken;
      row.invite_expires_at = inviteExpiry();
    }

    let { data, error } = await supabaseAdmin
      .from("admin_users")
      .insert(row)
      .select("*")
      .single();

    // If the phone column doesn't exist yet, retry without it
    if (error && phone && /phone/i.test(error.message)) {
      delete row.phone;
      ({ data, error } = await supabaseAdmin
        .from("admin_users")
        .insert(row)
        .select("*")
        .single());
    }

    // If the invite columns aren't migrated yet, fall back to a temp password
    // rather than failing to create the employee at all.
    if (error && inviteToken && /invite_token|invite_expires_at/i.test(error.message)) {
      delete row.invite_token;
      delete row.invite_expires_at;
      row.password_hash = await hashPassword(tempPassword);
      inviteToken = null;
      ({ data, error } = await supabaseAdmin
        .from("admin_users")
        .insert(row)
        .select("*")
        .single());
    }

    if (error) {
      console.error("Error creating employee:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (data) delete data.password_hash;

    if (inviteToken) {
      const inviteUrl = buildInviteUrl(inviteToken);
      const sent = await sendEmployeeInviteEmail({ to: email, name, role, inviteUrl });
      return NextResponse.json({
        success: true,
        data,
        inviteUrl,
        emailSent: sent.success !== false,
        message: sent.success !== false
          ? `Invite emailed to ${email}. The link is good for ${INVITE_TTL_DAYS} days.`
          : `${name} was added, but the invite email failed to send. Copy the link below and send it to them.`,
      });
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
    const auth = await verifyAdminAuth(request);
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
      .select("*")
      .order("created_at", { ascending: true });

    if (role && role !== "all") {
      query = query.eq("role", role);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: "Failed to fetch employees" }, { status: 500 });
    }
    const safe = (data || []).map((u: Record<string, unknown>) => {
      const { password_hash: _ph, ...rest } = u;
      return rest;
    });
    return NextResponse.json({ success: true, data: safe });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch employees" }, { status: 500 });
  }
}

// DELETE: Remove a login. Accounts that already own work history are
// deactivated instead of deleted, so their jobs/notes keep a valid author.
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Employee id is required" }, { status: 400 });
    }

    if (id === auth.id) {
      return NextResponse.json(
        { success: false, error: "You cannot delete the account you are signed in with." },
        { status: 400 }
      );
    }

    const { data: assignments } = await supabaseAdmin
      .from("job_assignments")
      .select("id")
      .eq("user_id", id)
      .limit(1);

    if (assignments && assignments.length > 0) {
      const { error } = await supabaseAdmin
        .from("admin_users")
        .update({ is_active: false })
        .eq("id", id);
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        deactivated: true,
        message: "This person has job history, so their account was deactivated instead of deleted. They can no longer sign in.",
      });
    }

    const { error } = await supabaseAdmin.from("admin_users").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Employee deleted" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json({ success: false, error: "Failed to delete employee" }, { status: 500 });
  }
}

// PATCH: Update an employee's role or active status
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, role, is_active, name, customer_id } = body;
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
    // Links a customer-role login to its customers row, which is what the
    // portal scopes invoices / payments / projects by. Pass null to unlink.
    if (customer_id !== undefined) updates.customer_id = customer_id;

    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .update(updates)
      .eq("id", id)
      .select("id, email, name, role, is_active, customer_id")
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
