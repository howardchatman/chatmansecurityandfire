import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.chatmansecurityandfire.com";

/** URL-safe random token for a customer link. */
export function generateLinkToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Create a review-and-sign link for a quote and move the quote out of draft.
 *
 * Generating a signable link IS sending the quote: the accept route only allows
 * signing when the quote is "sent" or "viewed", and nothing else transitions it
 * out of draft, so without the status change no quote could be signed.
 */
export async function createQuoteLink(opts: {
  quoteId: string;
  customerEmail: string;
  customerName?: string | null;
  customerPhone?: string | null;
  createdBy?: string | null;
  teamId?: string | null;
  expiresInDays?: number | null;
  maxUses?: number | null;
}) {
  const token = generateLinkToken();
  const days = opts.expiresInDays === undefined ? 30 : opts.expiresInDays;
  const expiresAt = days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null;

  const { data: link, error } = await supabaseAdmin
    .from("customer_links")
    .insert({
      token,
      quote_id: opts.quoteId,
      customer_email: opts.customerEmail,
      customer_name: opts.customerName ?? null,
      customer_phone: opts.customerPhone ?? null,
      link_type: "quote_approval",
      expires_at: expiresAt,
      max_uses: opts.maxUses ?? null,
      created_by: opts.createdBy ?? null,
      team_id: opts.teamId ?? null,
    })
    .select()
    .single();
  if (error || !link) throw error || new Error("Failed to create customer link");

  await supabaseAdmin
    .from("quotes")
    .update({ status: "sent", updated_at: new Date().toISOString() })
    .eq("id", opts.quoteId)
    .eq("status", "draft");

  return { link, url: `${BASE_URL}/c/${token}` };
}
