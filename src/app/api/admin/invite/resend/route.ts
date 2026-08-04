import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";
import {
  generateInviteToken,
  inviteExpiry,
  buildInviteUrl,
  sendEmployeeInviteEmail,
  INVITE_TTL_DAYS,
} from "@/lib/employee-invite";

// POST: Issue a fresh invite link for someone who never enrolled (or whose
// link expired) and email it to them. Replacing the token invalidates the old
// link, so this doubles as "that link leaked, give me a new one".
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "Employee id is required" }, { status: 400 });
    }

    const { data: user, error: fetchError } = await supabaseAdmin
      .from("admin_users")
      .select("id, email, name, role, invite_accepted_at")
      .eq("id", id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    const token = generateInviteToken();
    const { error } = await supabaseAdmin
      .from("admin_users")
      .update({
        invite_token: token,
        invite_expires_at: inviteExpiry(),
        invite_accepted_at: null,
        is_active: true,
      })
      .eq("id", id);

    if (error) {
      console.error("Error issuing invite:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const inviteUrl = buildInviteUrl(token);
    const sent = await sendEmployeeInviteEmail({
      to: user.email,
      name: user.name || user.email,
      role: user.role,
      inviteUrl,
    });

    return NextResponse.json({
      success: true,
      inviteUrl,
      emailSent: sent.success !== false,
      message: sent.success !== false
        ? `New invite emailed to ${user.email}. Good for ${INVITE_TTL_DAYS} days. Any previous link no longer works.`
        : "Invite link created, but the email failed to send. Copy the link and send it to them.",
    });
  } catch (error) {
    console.error("Error resending invite:", error);
    return NextResponse.json({ success: false, error: "Failed to resend invite" }, { status: 500 });
  }
}
