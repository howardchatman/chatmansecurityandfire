import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: qrCode, error } = await supabaseAdmin
    .from("qr_codes")
    .select("id, destination_url, is_active, scan_count")
    .eq("slug", slug)
    .single();

  if (error || !qrCode || !qrCode.is_active) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Log scan + increment counter (fire-and-forget)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const userAgent = request.headers.get("user-agent") || "";

  supabaseAdmin
    .from("qr_scans")
    .insert({ qr_code_id: qrCode.id, ip_address: ip, user_agent: userAgent })
    .then(() => {
      supabaseAdmin
        .from("qr_codes")
        .update({
          scan_count: (qrCode.scan_count || 0) + 1,
          last_scanned_at: new Date().toISOString(),
        })
        .eq("id", qrCode.id)
        .then(() => {});
    });

  // 307 Temporary Redirect (destination can change)
  return NextResponse.redirect(qrCode.destination_url, 307);
}
