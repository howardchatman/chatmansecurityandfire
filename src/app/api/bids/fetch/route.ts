import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export const maxDuration = 120;

// What we bid on — used for both source queries and AI fit scoring
const SERVICE_PROFILE = `Chatman Security & Fire (Houston, TX) is a licensed low-voltage
and life-safety contractor. We bid on: commercial fire alarm systems (design, install,
inspection), fire sprinkler systems, fire extinguishers, emergency lighting, fire lane
striping, security/burglar alarm and camera systems, access control, structured cabling,
fiber optic cabling, and commercial WiFi/wireless networks. We serve Texas (primarily
Greater Houston). We are a small business.`;

const SEARCH_KEYWORDS = [
  "fire alarm",
  "fire sprinkler",
  "fire suppression",
  "fire protection",
  "structured cabling",
  "fiber optic",
  "access control",
  "video surveillance",
];

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

async function authorized(request: NextRequest): Promise<boolean> {
  // Vercel cron (Authorization: Bearer CRON_SECRET) or a signed-in admin
  const header = request.headers.get("authorization");
  if (process.env.CRON_SECRET && header === `Bearer ${process.env.CRON_SECRET}`) return true;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return !!payload && ["admin", "manager"].includes((payload as { role: string }).role);
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
        state: "TX",
        limit: "25",
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
  opps: { external_id: string; title: string; agency: string }[]
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
  if (!(await authorized(request))) {
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
  const fresh = opps.filter((o) => !existingIds.has(o.noticeId));

  // AI fit scoring (batch, capped)
  const scores = await scoreFit(
    fresh.slice(0, 40).map((o) => ({
      external_id: o.noticeId,
      title: o.title,
      agency: o.fullParentPathName || "",
    }))
  );

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
        .join(", ") || "TX",
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
  }

  return NextResponse.json({
    success: true,
    checked: opps.length,
    new: inserted,
    message: `Checked ${opps.length} opportunities, ${inserted} new.`,
  });
}
