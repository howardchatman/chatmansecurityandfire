import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";
import { getCustomerIdForUser } from "@/lib/customer";
import { CUSTOMER_STAGES, stageForQuote, stageForStatus } from "@/lib/job-stages";

// A customer's view of the work we're doing for them — from the quote through
// to the finished job.
//
// Only what they should see: the stage, the schedule, and updates the crew
// explicitly marked customer-visible. Internal notes, cost, margin, who is
// assigned and every raw job_event stay out of this response entirely — the
// filtering is done in the query, not in the UI, so it can't be undone by a
// front-end change.

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== "customer") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const customerId = await getCustomerIdForUser(auth);
    if (!customerId) return NextResponse.json({ success: true, data: [], stages: CUSTOMER_STAGES });

    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("email")
      .eq("id", customerId)
      .maybeSingle();

    const email = customer?.email || auth.email;

    const { data: jobs, error } = await supabaseAdmin
      .from("jobs")
      .select(
        "id, job_number, job_type, status, description, scope_summary, site_address, site_city, scheduled_date, actual_start_time, completed_at, created_at, quote_id"
      )
      .eq("customer_email", email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading customer projects:", error);
      return NextResponse.json({ success: false, error: "Failed to load your projects" }, { status: 500 });
    }

    const jobIds = (jobs || []).map((j) => j.id);
    let notesByJob: Record<string, { id: string; note: string; created_at: string }[]> = {};

    if (jobIds.length) {
      const { data: notes } = await supabaseAdmin
        .from("job_notes")
        .select("id, job_id, note, created_at")
        .in("job_id", jobIds)
        .eq("is_customer_visible", true)
        .order("created_at", { ascending: false });

      notesByJob = (notes || []).reduce((acc, n) => {
        (acc[n.job_id] ||= []).push({ id: n.id, note: n.note, created_at: n.created_at });
        return acc;
      }, {} as Record<string, { id: string; note: string; created_at: string }[]>);
    }

    const jobItems = (jobs || []).map((jb) => {
      const stage = stageForStatus(jb.status);
      return {
        kind: "job" as const,
        id: jb.id,
        job_number: jb.job_number,
        job_type: jb.job_type,
        title: jb.description || jb.job_type || "Service work",
        scope: jb.scope_summary,
        site: [jb.site_address, jb.site_city].filter(Boolean).join(", "),
        scheduled_date: jb.scheduled_date,
        started_at: jb.actual_start_time,
        completed_at: jb.completed_at,
        created_at: jb.created_at,
        stage: stage.key,
        stage_label: stage.label,
        stage_index: stage.index,
        progress: stage.progress,
        is_complete: stage.isComplete,
        is_on_hold: stage.isOnHold,
        note: stage.note,
        is_waiting_on_permit: stage.isWaitingOnPermit,
        updates: notesByJob[jb.id] || [],
        quote: null as null | { number: string; total: number | null; sign_url: string | null; expires_at: string | null },
        needs_signature: false,
        is_closed: false,
      };
    });

    const quoteItems = await loadQuotes(email, new Set((jobs || []).map((j) => j.quote_id).filter(Boolean)));

    // Quotes first while they wait on the customer, then work in flight.
    const data = [...quoteItems, ...jobItems];

    return NextResponse.json({ success: true, data, stages: CUSTOMER_STAGES });
  } catch (error) {
    console.error("Error loading customer projects:", error);
    return NextResponse.json({ success: false, error: "Failed to load your projects" }, { status: 500 });
  }
}

/**
 * The customer's quotes that haven't turned into a job yet. Drafts stay
 * internal. Once a quote is converted, the job carries the story and the quote
 * drops off here so it isn't shown twice.
 *
 * Only the number, total and status leave the server — line-item labor and
 * material splits are ours, not the customer's.
 */
async function loadQuotes(email: string, convertedQuoteIds: Set<string>) {
  const { data: quotes, error } = await supabaseAdmin
    .from("quotes")
    .select("id, quote_number, status, totals, site, quote_type, created_at, expires_at")
    .ilike("customer->>email", email)
    .neq("status", "draft")
    .order("created_at", { ascending: false });

  if (error) {
    // A quotes problem must not hide the customer's jobs.
    console.error("Error loading customer quotes:", error);
    return [];
  }

  const open = (quotes || []).filter((q) => !convertedQuoteIds.has(q.id));
  if (!open.length) return [];

  // The e-sign link we already sent them, if it is still good.
  const { data: links } = await supabaseAdmin
    .from("customer_links")
    .select("quote_id, token, expires_at, status, created_at")
    .in("quote_id", open.map((q) => q.id))
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const now = Date.now();
  const linkFor = new Map<string, string>();
  for (const l of links || []) {
    if (linkFor.has(l.quote_id)) continue;
    if (l.expires_at && new Date(l.expires_at).getTime() < now) continue;
    linkFor.set(l.quote_id, `/c/${l.token}`);
  }

  return open.map((q) => {
    const stage = stageForQuote(q.status);
    const site = (q.site || {}) as { address?: string; city?: string };
    const totals = (q.totals || {}) as { total?: number; grandTotal?: number };
    const total = typeof totals.total === "number" ? totals.total : typeof totals.grandTotal === "number" ? totals.grandTotal : null;
    const typeLabel = (q.quote_type || "").replace(/_/g, " ");
    return {
      kind: "quote" as const,
      id: q.id,
      job_number: q.quote_number,
      job_type: q.quote_type,
      title: typeLabel ? `${typeLabel} quote` : "Quote",
      scope: null as string | null,
      site: [site.address, site.city].filter(Boolean).join(", "),
      scheduled_date: null as string | null,
      started_at: null as string | null,
      completed_at: null as string | null,
      created_at: q.created_at,
      stage: stage.key,
      stage_label: stage.label,
      stage_index: stage.index,
      progress: stage.progress,
      is_complete: false,
      is_on_hold: false,
      note: stage.note,
      is_waiting_on_permit: false,
      updates: [] as { id: string; note: string; created_at: string }[],
      quote: {
        number: q.quote_number,
        total,
        sign_url: stage.needsSignature ? linkFor.get(q.id) || null : null,
        expires_at: q.expires_at,
      },
      needs_signature: stage.needsSignature,
      is_closed: stage.isClosed,
    };
  });
}
