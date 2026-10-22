import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { sendOwnerAlert, emailHeader } from "@/lib/email";
import { sendSms } from "@/lib/sms";

export const maxDuration = 120;

// What we bid on — used for both source queries and AI fit scoring
const SERVICE_PROFILE = `Chatman Security & Fire (Houston, TX) is a licensed low-voltage
and life-safety contractor. We bid on: commercial fire alarm systems (design, install,
inspection), fire sprinkler systems, fire extinguishers, emergency lighting, fire lane
striping, security/burglar alarm and camera systems, access control, structured cabling,
fiber optic cabling, and commercial WiFi/wireless networks. We are a small business
with an active SAM.gov registration and bid nationwide: Texas work (primarily Greater
Houston) we self-perform; work outside Texas we deliver as prime with vetted local
subcontractors. We do not provide security guard or patrol services; score those low. Location is
not a reason to score low; score on how well the scope matches our trades.`;

const SEARCH_KEYWORDS = [
  "fire alarm",
  "fire sprinkler",
  "fire suppression",
  "fire protection",
  "structured cabling",
  "fiber optic",
  "access control",
  "video surveillance",
  "fire extinguisher",
  "emergency lighting",
];

// Searched nationwide; Texas or not is shown on each bid. Newest first, and
// at most this many new ones per run, so every saved bid gets a fit score
// (anything past the cap is picked up on the next run).
const MAX_NEW_PER_RUN = 200;
const SCORE_CHUNK = 50;

interface SamOpportunity {
  noticeId: string;
  title: string;
  fullParentPathName?: string;
  postedDate?: string;
  naicsCode?: string;
  responseDeadLine?: string;
  uiLink?: string;
  placeOfPerformance?: { state?: { code?: string }; city?: { name?: string } };
}

async function authorized(request: NextRequest): Promise<"cron" | "admin" | null> {
  // Vercel cron (Authorization: Bearer CRON_SECRET) or a signed-in admin
  const header = request.headers.get("authorization");
  if (process.env.CRON_SECRET && header === `Bearer ${process.env.CRON_SECRET}`) return "cron";
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload && ["admin", "manager"].includes((payload as { role: string }).role) ? "admin" : null;
}

// The morning digest: new bids worth a look, best fit first. Only the cron
// run sends it (a manual run means you're already looking at the page), and
// only when something scored at least DIGEST_MIN_FIT.
const DIGEST_MIN_FIT = 50;
const DIGEST_MAX = 25;
const SITE = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.chatmansecurityandfire.com").replace(/\/$/, "");

const esc = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

interface DigestBid {
  title: string;
  agency: string | null;
  location: string | null;
  due_date: string | null;
  url: string | null;
  fit_score: number | null;
  fit_reason: string | null;
  service_match: string | null;
}

async function sendDigest(rows: DigestBid[]) {
  const good = rows
    .filter((r) => (r.fit_score ?? 0) >= DIGEST_MIN_FIT)
    .sort((a, b) => (b.fit_score ?? 0) - (a.fit_score ?? 0));
  if (good.length === 0) return;

  const inTexas = (r: DigestBid) => !r.location || /\bTX$/.test(r.location.trim());
  const due = (d: string | null) =>
    d ? new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "no due date";

  const items = good
    .slice(0, DIGEST_MAX)
    .map((r) => {
      const fit = r.fit_score ?? 0;
      const color = fit >= 80 ? "#15803d" : fit >= 65 ? "#c2410c" : "#4b5563";
      const tags = [
        r.service_match ? r.service_match.replace(/_/g, " ") : null,
        inTexas(r) ? null : "out of state · subcontract",
      ].filter(Boolean);
      return `
        <tr><td style="padding:14px 0;border-bottom:1px solid #e5e7eb;">
          <div style="font-size:12px;margin-bottom:4px;">
            <b style="color:${color};">Fit ${fit}</b>
            ${tags.length ? ` · <span style="color:#6b7280;">${esc(tags.join(" · "))}</span>` : ""}
            · <span style="color:#6b7280;">due ${due(r.due_date)}</span>
          </div>
          <div style="font-size:15px;font-weight:bold;color:#111827;">
            ${r.url ? `<a href="${esc(r.url)}" style="color:#111827;">${esc(r.title)}</a>` : esc(r.title)}
          </div>
          <div style="font-size:13px;color:#6b7280;margin-top:2px;">
            ${esc([r.agency, r.location].filter(Boolean).join(" · "))}
          </div>
          ${r.fit_reason ? `<div style="font-size:13px;color:#374151;margin-top:4px;font-style:italic;">${esc(r.fit_reason)}</div>` : ""}
        </td></tr>`;
    })
    .join("");

  const more = good.length > DIGEST_MAX ? good.length - DIGEST_MAX : 0;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
      ${emailHeader(`${good.length} new bid${good.length === 1 ? "" : "s"} worth a look`)}
      <div style="padding:24px;background:#f9fafb;">
        <table style="width:100%;border-collapse:collapse;">${items}</table>
        ${more ? `<p style="color:#6b7280;font-size:13px;">+${more} more good fits in the Bid Finder.</p>` : ""}
        <p style="text-align:center;margin-top:20px;">
          <a href="${SITE}/admin/bids" style="background:#E85D04;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold;">Open Bid Finder</a>
        </p>
      </div>
    </div>`;

  const best = good[0];
  await Promise.allSettled([
    sendOwnerAlert(`${good.length} new bid${good.length === 1 ? "" : "s"}: best is Fit ${best.fit_score}, ${best.title.slice(0, 60)}`, html),
    // No-op until Twilio is live.
    sendSms({
      name: "CSF Bid Alert",
      phone: process.env.OWNER_ALERT_PHONE || "+13468525540",
      message: `${good.length} new bid${good.length === 1 ? "" : "s"} today. Best: Fit ${best.fit_score}, ${best.title.slice(0, 70)}. ${SITE}/admin/bids`,
    }),
  ]);
}

function fmtDate(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

async function fetchSamGov(): Promise<SamOpportunity[]> {
  const apiKey = process.env.SAM_GOV_API_KEY;
  if (!apiKey) return [];

  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 14);

  const seen = new Map<string, SamOpportunity>();
  for (const keyword of SEARCH_KEYWORDS) {
    try {
      const params = new URLSearchParams({
        api_key: apiKey,
        postedFrom: fmtDate(from),
        postedTo: fmtDate(to),
        title: keyword,
        limit: "100",
        ptype: "o,p,k", // solicitations, presolicitations, combined synopsis
      });
      const res = await fetch(`https://api.sam.gov/opportunities/v2/search?${params}`);
      if (!res.ok) continue;
      const data = await res.json();
      for (const opp of data.opportunitiesData || []) {
        if (opp.noticeId && !seen.has(opp.noticeId)) seen.set(opp.noticeId, opp);
      }
    } catch {
      // keep going with other keywords
    }
  }
  return [...seen.values()];
}

interface FitResult {
  external_id: string;
  fit_score: number;
  service_match: string;
  reason: string;
}

const SERVICE_MATCHES = [
  "fire_alarm",
  "fire_sprinkler",
  "fire_extinguisher",
  "emergency_lighting",
  "fire_lane",
  "security",
  "fiber_optics",
  "wireless",
  "multi",
  "other",
];

// Structured output schema — the API guarantees the response parses to this
// shape, so no "looks like JSON" parsing. Numeric range isn't enforceable in
// the schema; the clamp happens in code below.
const FIT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["results"],
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["external_id", "fit_score", "service_match", "reason"],
        properties: {
          external_id: { type: "string" },
          fit_score: { type: "integer", description: "0-100, 100 = exactly our trade and size" },
          service_match: { type: "string", enum: SERVICE_MATCHES },
          reason: { type: "string", description: "one short sentence" },
        },
      },
    },
  },
};

async function scoreFit(
  opps: { external_id: string; title: string; agency: string; state: string }[]
): Promise<Map<string, FitResult>> {
  const results = new Map<string, FitResult>();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || opps.length === 0) return results;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-opus-5",
        max_tokens: 8000,
        // Scoring titles is routine work — low effort keeps it fast and cheap.
        output_config: {
          effort: "low",
          format: { type: "json_schema", schema: FIT_SCHEMA },
        },
        system: `${SERVICE_PROFILE}\n\nScore each opportunity 0-100 for how well it fits what we do (100 = exactly our trade and size).`,
        messages: [{ role: "user", content: JSON.stringify(opps) }],
      }),
    });
    if (!res.ok) {
      console.error("[bids] scoring failed:", res.status, (await res.text()).slice(0, 200));
      return results;
    }
    const data = await res.json();
    // Guard before reading content — a refusal returns 200 with empty content.
    if (data.stop_reason === "refusal") return results;

    const raw: string = (data.content ?? [])
      .filter((b: { type?: string }) => b?.type === "text")
      .map((b: { text?: string }) => b.text ?? "")
      .join("");
    const parsed = JSON.parse(raw || "{}");
    for (const r of parsed.results || []) {
      if (!r.external_id) continue;
      results.set(r.external_id, {
        ...r,
        fit_score: Math.max(0, Math.min(100, Math.round(r.fit_score ?? 0))),
      });
    }
  } catch (e) {
    // scoring is best-effort; opportunities still get saved
    console.error("[bids] scoring error:", e);
  }
  return results;
}

export async function GET(request: NextRequest) {
  const caller = await authorized(request);
  if (!caller) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.SAM_GOV_API_KEY) {
    return NextResponse.json(
      { success: false, error: "SAM_GOV_API_KEY not configured. Get a free key at sam.gov (Account Details > API Key) and add it to the environment." },
      { status: 400 }
    );
  }

  const opps = await fetchSamGov();

  // Which are new?
  const ids = opps.map((o) => o.noticeId);
  const { data: existing } = await supabaseAdmin
    .from("bid_opportunities")
    .select("external_id")
    .eq("source", "sam_gov")
    .in("external_id", ids.length ? ids : ["__none__"]);
  const existingIds = new Set((existing || []).map((e) => e.external_id));
  const fresh = opps
    .filter((o) => !existingIds.has(o.noticeId))
    .sort((a, b) => (b.postedDate || "").localeCompare(a.postedDate || ""))
    .slice(0, MAX_NEW_PER_RUN);

  // AI fit scoring, in parallel chunks
  const chunks: SamOpportunity[][] = [];
  for (let i = 0; i < fresh.length; i += SCORE_CHUNK) chunks.push(fresh.slice(i, i + SCORE_CHUNK));
  const scores = new Map<string, FitResult>();
  const scored = await Promise.all(
    chunks.map((c) =>
      scoreFit(
        c.map((o) => ({
          external_id: o.noticeId,
          title: o.title,
          agency: o.fullParentPathName || "",
          state: o.placeOfPerformance?.state?.code || "",
        }))
      )
    )
  );
  for (const m of scored) for (const [k, v] of m) scores.set(k, v);

  const rows = fresh.map((o) => {
    const s = scores.get(o.noticeId);
    return {
      source: "sam_gov",
      external_id: o.noticeId,
      title: o.title,
      agency: o.fullParentPathName || null,
      naics_code: o.naicsCode || null,
      location: [o.placeOfPerformance?.city?.name, o.placeOfPerformance?.state?.code]
        .filter(Boolean)
        .join(", ") || null,
      posted_date: o.postedDate ? o.postedDate.slice(0, 10) : null,
      due_date: o.responseDeadLine ? o.responseDeadLine.slice(0, 10) : null,
      url: o.uiLink || null,
      fit_score: s?.fit_score ?? null,
      fit_reason: s?.reason ?? null,
      service_match: s?.service_match ?? null,
      status: "new",
    };
  });

  let inserted = 0;
  if (rows.length > 0) {
    const { error, count } = await supabaseAdmin
      .from("bid_opportunities")
      .upsert(rows, { onConflict: "source,external_id", ignoreDuplicates: true, count: "exact" });
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    inserted = count || rows.length;
    if (caller === "cron") {
      try {
        await sendDigest(rows);
      } catch (e) {
        console.error("[bids] digest failed:", e);
      }
    }
  }

  return NextResponse.json({
    success: true,
    checked: opps.length,
    new: inserted,
    message: `Checked ${opps.length} opportunities, ${inserted} new.`,
  });
}
