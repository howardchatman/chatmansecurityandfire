import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeAndStore } from "@/lib/google-calendar";
import { jwtVerify } from "jose";

// Google redirects here after consent with ?code & ?state (or ?error). Verify
// the state we minted in /connect, swap the code for tokens, store them, and
// send the admin back to the integrations page.

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");
const back = (request: NextRequest, qs: string) =>
  NextResponse.redirect(new URL(`/admin/settings/integrations?${qs}`, request.url));

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (error) return back(request, `error=${encodeURIComponent(error)}`);
  if (!code || !state) return back(request, "error=missing_code");

  let uid: string | undefined;
  try {
    const { payload } = await jwtVerify(state, secret);
    if (payload.purpose !== "gcal") throw new Error("bad purpose");
    uid = payload.uid as string;
  } catch {
    return back(request, "error=bad_state");
  }

  try {
    await exchangeCodeAndStore(code, uid);
  } catch (e) {
    console.error("[gcal] callback exchange failed:", e);
    return back(request, "error=exchange_failed");
  }

  return back(request, "connected=1");
}
