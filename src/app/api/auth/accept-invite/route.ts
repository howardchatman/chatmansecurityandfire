import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth";

// Public endpoint: an invited employee enrolls here. The token is the only
// credential, so it must be unexpired, unused, and belong to an active account.

const MIN_PASSWORD_LENGTH = 8;

async function loadInvite(token: string) {
  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("id, email, name, role, is_active, invite_expires_at, invite_accepted_at")
    .eq("invite_token", token)
    .maybeSingle();

  if (error || !data) return { invite: null, reason: "This invite link isn't valid." };
  if (data.invite_accepted_at) {
    return { invite: null, reason: "This invite has already been used. Try signing in instead." };
  }
  if (data.invite_expires_at && new Date(data.invite_expires_at) < new Date()) {
    return { invite: null, reason: "This invite link has expired. Ask your manager to send a new one." };
  }
  if (data.is_active === false) {
    return { invite: null, reason: "This account is inactive. Ask your manager to re-enable it." };
  }
  return { invite: data, reason: null };
}

// GET: validate a token so the enrollment page can greet them by name.
export async function GET(request: NextRequest) {
  try {
    const token = new URL(request.url).searchParams.get("token");
    if (!token) {
      return NextResponse.json({ success: false, error: "Missing token" }, { status: 400 });
    }

    const { invite, reason } = await loadInvite(token);
    if (!invite) {
      return NextResponse.json({ success: false, error: reason }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: { name: invite.name, email: invite.email, role: invite.role },
    });
  } catch (error) {
    console.error("Error validating invite:", error);
    return NextResponse.json({ success: false, error: "Failed to validate invite" }, { status: 500 });
  }
}

// POST: set the password and consume the invite.
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: "Token and password are required" },
        { status: 400 }
      );
    }
    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const { invite, reason } = await loadInvite(token);
    if (!invite) {
      return NextResponse.json({ success: false, error: reason }, { status: 400 });
    }

    const password_hash = await hashPassword(password);

    // Clearing invite_token makes the link single-use.
    const { error } = await supabaseAdmin
      .from("admin_users")
      .update({
        password_hash,
        invite_token: null,
        invite_expires_at: null,
        invite_accepted_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    if (error) {
      console.error("Error accepting invite:", error);
      return NextResponse.json({ success: false, error: "Failed to set password" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { email: invite.email, role: invite.role },
      message: "Your password is set. You can sign in now.",
    });
  } catch (error) {
    console.error("Error accepting invite:", error);
    return NextResponse.json({ success: false, error: "Failed to accept invite" }, { status: 500 });
  }
}
