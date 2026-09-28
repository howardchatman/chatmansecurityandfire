import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { squareConfigured, lastSync, syncAll } from "@/lib/square";

// GET  → is Square configured, and when did it last sync?
// POST → run a full sync now (customers, catalog, invoices). Admin/manager.

async function gate(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || !["admin", "manager"].includes(user.role)) return null;
  return user;
}

export async function GET(request: NextRequest) {
  if (!(await gate(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let last = null;
  try {
    last = await lastSync();
  } catch {
    // table missing before the migration runs — report "never synced"
  }
  return NextResponse.json({ configured: squareConfigured(), last });
}

export async function POST(request: NextRequest) {
  if (!(await gate(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!squareConfigured()) {
    return NextResponse.json(
      { error: "SQUARE_ACCESS_TOKEN is not set on the server." },
      { status: 400 }
    );
  }
  try {
    const result = await syncAll();
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sync failed";
    console.error("[square] sync failed:", msg);
    // Say what actually broke — a bad token, a missing migration — rather than
    // a generic failure.
    const hint = /square_catalog_id|square_customer_id|square_invoice_id|square_sync_state/.test(msg)
      ? " The 20260913_square_sync migration hasn't been run yet."
      : /401|UNAUTHORIZED/.test(msg)
      ? " Square rejected the access token — check SQUARE_ACCESS_TOKEN."
      : "";
    return NextResponse.json({ error: msg + hint }, { status: 500 });
  }
}
