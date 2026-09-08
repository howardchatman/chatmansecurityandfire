import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { authUrl, googleConfigured } from "@/lib/google-calendar";
import { SignJWT } from "jose";

// Kick off the Google OAuth consent flow. Admin/manager only.
//
// The `state` is a short-lived signed token tying the callback back to this
// admin — it is the CSRF guard: the callback rejects any code that doesn't
// arrive with a state we minted.

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || !["admin", "manager"].includes(user.role)) {
    return NextResponse.redirect(new URL("/login?next=/admin/settings/integrations", request.url));
  }
  if (!googleConfigured()) {
    return NextResponse.redirect(
      new URL("/admin/settings/integrations?error=not_configured", request.url)
    );
  }

  const state = await new SignJWT({ uid: user.id, purpose: "gcal" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret);

  return NextResponse.redirect(authUrl(state));
}
