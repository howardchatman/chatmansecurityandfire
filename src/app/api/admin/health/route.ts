import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// Admin-only health check: which KIND of Supabase key the running deployment
// uses, and whether the database answers. Never returns a key or any part of
// one — only its type — so it's safe to call from anywhere.
//
// Exists so a key rotation can be verified on the live site before the old
// keys are disabled; disabling legacy keys while production still holds one
// takes the whole site down.

function kind(k: string | undefined): string {
  if (!k) return "missing";
  if (k.startsWith("sb_secret_")) return "new_secret";
  if (k.startsWith("sb_publishable_")) return "new_publishable";
  if (k.startsWith("eyJ")) return "legacy_jwt";
  return "unknown";
}

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabaseAdmin.from("leads").select("id", { head: true, count: "exact" });

  return NextResponse.json({
    supabase: {
      server_key: kind(process.env.SUPABASE_SERVICE_ROLE_KEY),
      browser_key: kind(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      database_ok: !error,
      ...(error ? { database_error: error.message } : {}),
    },
    checked_at: new Date().toISOString(),
  });
}
