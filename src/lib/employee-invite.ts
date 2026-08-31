import crypto from "crypto";
import { sendEmail } from "@/lib/email";

export const INVITE_TTL_DAYS = 7;

export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function inviteExpiry(): string {
  return new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

function siteBase(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || "https://www.chatmansecurityandfire.com").replace(
    /\/$/,
    ""
  );
}

export function buildInviteUrl(token: string): string {
  return `${siteBase()}/welcome/${token}`;
}

// Email images need an absolute, publicly reachable URL — a relative path
// resolves against the mail client, not the site.
const LOGO_URL = `${siteBase()}/csf_wide_logo.png`;

const ROLE_BLURB: Record<string, string> = {
  technician: "You'll use it to see your assigned jobs, clock in and out, and upload job photos from your phone.",
  inspector: "You'll use it to run inspections and file reports from the field.",
  manager: "You'll use it to schedule jobs, manage the crew, and track work in progress.",
  dispatcher: "You'll use it to schedule jobs and keep the crew's day organized.",
  admin: "You'll have full access to the admin dashboard.",
  customer: "You'll use it to view your projects, invoices, and inspection reports.",
};

export async function sendEmployeeInviteEmail(opts: {
  to: string;
  name: string;
  role: string;
  inviteUrl: string;
}) {
  const blurb = ROLE_BLURB[opts.role] || "You'll use it to access the team portal.";
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937">
    <!-- Light band, not navy: email clients can't apply CSS filters, and the
         logo's interior is opaque white, so it needs a light background. -->
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center">
      <img src="${LOGO_URL}" alt="Chatman Security &amp; Fire" width="240"
           style="width:240px;max-width:80%;height:auto;display:inline-block" />
    </div>

    <div style="padding:28px 4px">
      <p style="font-size:16px;margin:0 0 16px">Hi ${opts.name},</p>
      <p style="margin:0 0 16px;line-height:1.6">
        You've been set up with a <strong>${opts.role}</strong> account at Chatman Security &amp; Fire.
        ${blurb}
      </p>
      <p style="margin:0 0 24px;line-height:1.6">
        Click below to choose your password and finish setting up your login.
      </p>

      <div style="text-align:center;margin:28px 0">
        <a href="${opts.inviteUrl}"
           style="background:#E85D04;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;display:inline-block">
          Set up my login
        </a>
      </div>

      <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:0 0 8px">
        This link expires in ${INVITE_TTL_DAYS} days and can only be used once.
        If the button doesn't work, paste this into your browser:
      </p>
      <p style="font-size:12px;color:#6b7280;word-break:break-all;margin:0">${opts.inviteUrl}</p>
    </div>

    <div style="border-top:1px solid #e5e7eb;padding-top:16px;font-size:12px;color:#9ca3af">
      <p style="margin:0">Chatman Security &amp; Fire, Inc. &middot; Houston, TX &middot; (832) 859-7009</p>
      <p style="margin:8px 0 0">If you weren't expecting this, you can ignore this email.</p>
    </div>
  </div>`;

  return sendEmail({
    to: opts.to,
    subject: "Set up your Chatman Security & Fire login",
    html,
  });
}
