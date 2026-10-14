import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";
import {
  anthropicClient,
  buildPrompts,
  draftParams,
  draftUsage,
  priceDraft,
  readDraft,
  type DraftCustomer,
  type InventoryItem,
  type Procedure,
} from "@/lib/proposal-ai";

// Drafts a proposal from a plain-language job description, priced against the
// real catalogue (see lib/proposal-ai.ts for the model/pricing split).
//
//   POST {description, customer_id?}            standard: Opus, high effort,
//                                                streamed, answer in this response
//   POST {description, customer_id, thorough}   thorough: Opus, extra-high effort,
//                                                submitted as a batch; returns an id
//   GET  ?id=…                                   checks a thorough draft and, once
//                                                it's done, prices and saves it

// A standard draft is one long streamed reply. 300s is the most every Vercel
// plan allows; thorough drafts go through the Batches API so they never need more.
export const maxDuration = 300;

const CUSTOMER_COLS = "name, company, email, phone, address, city, state";

async function loadCatalogue() {
  const [{ data: inventory }, { data: procedures }] = await Promise.all([
    supabaseAdmin.from("proposal_inventory").select("id, name, description, category, unit_cost, unit"),
    supabaseAdmin.from("proposal_procedures").select("name, category, steps, notes"),
  ]);
  return { inventory: (inventory || []) as InventoryItem[], procedures: (procedures || []) as Procedure[] };
}

async function loadCustomer(id: string | null | undefined): Promise<DraftCustomer | null> {
  if (!id) return null;
  const { data } = await supabaseAdmin.from("customers").select(CUSTOMER_COLS).eq("id", id).maybeSingle();
  return (data as DraftCustomer) || null;
}

/** Plain-language message for a failed call to Anthropic. */
function explainApiError(err: unknown): string {
  if (err instanceof Anthropic.APIConnectionTimeoutError) {
    return "The draft took longer than the server allows. Tick Thorough to run it in the background, or split the job into two drafts.";
  }
  if (err instanceof Anthropic.AuthenticationError) {
    return "Anthropic rejected the API key (ANTHROPIC_API_KEY). Check it in Vercel's environment variables.";
  }
  if (err instanceof Anthropic.RateLimitError) {
    return "Anthropic rate limit or out of credit. Check the balance at console.anthropic.com, then try again.";
  }
  if (err instanceof Anthropic.APIError) {
    return `Anthropic returned ${err.status ?? "an error"}: ${err.message}`;
  }
  if (err instanceof Error) return err.message;
  return "Couldn't draft the proposal.";
}

function authorised(auth: Awaited<ReturnType<typeof verifyAuth>>) {
  return !!auth && ["admin", "manager"].includes(auth.role);
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!authorised(auth)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { success: false, error: "ANTHROPIC_API_KEY is not configured on this environment." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const description: string = (body.description || "").trim();
  const customerId: string | null = body.customer_id || null;
  const thorough = body.thorough === true;

  if (!description) {
    return NextResponse.json({ success: false, error: "Describe the job and I'll draft the proposal." }, { status: 400 });
  }
  if (thorough && !customerId) {
    return NextResponse.json(
      {
        success: false,
        error: "Pick a customer first. Thorough drafts finish in the background and are saved to that customer's file.",
      },
      { status: 400 }
    );
  }

  const [{ inventory, procedures }, customer] = await Promise.all([loadCatalogue(), loadCustomer(customerId)]);
  const prompts = buildPrompts({ inventory, procedures, customer, description });
  const client = anthropicClient();

  if (thorough) {
    // Save a placeholder first so the batch's custom_id can be the row id.
    const { data: row, error: insertErr } = await supabaseAdmin
      .from("proposal_history")
      .insert([
        {
          client_name: customer?.company || customer?.name || "Unassigned",
          customer_id: customerId,
          status: "draft",
          proposal_type: "ai_draft",
          filename: "Drafting…",
          proposal_data: { pending: { mode: "thorough", submitted_at: new Date().toISOString() }, customer_id: customerId, description },
        },
      ])
      .select("id, proposal_data")
      .single();
    if (insertErr || !row) {
      return NextResponse.json(
        { success: false, error: `Couldn't save the draft: ${insertErr?.message || "unknown error"}` },
        { status: 500 }
      );
    }

    try {
      const batch = await client.messages.batches.create({
        requests: [{ custom_id: row.id, params: draftParams(prompts, "thorough") }],
      });
      await supabaseAdmin
        .from("proposal_history")
        .update({
          proposal_data: { ...row.proposal_data, pending: { ...row.proposal_data.pending, batch_id: batch.id } },
        })
        .eq("id", row.id);
      return NextResponse.json({ success: true, data: { pending: true, id: row.id } });
    } catch (err) {
      await supabaseAdmin.from("proposal_history").delete().eq("id", row.id);
      console.error("Thorough draft submit failed:", err);
      return NextResponse.json({ success: false, error: explainApiError(err) }, { status: 502 });
    }
  }

  // ---- standard: stream the reply so a long think doesn't hit an HTTP timeout ----
  try {
    const stream = client.beta.messages.stream(
      {
        ...draftParams(prompts, "standard"),
        // If a safety classifier declines, Anthropic re-runs it on its
        // recommended fallback model inside the same call.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      },
      { timeout: 280_000, maxRetries: 1 }
    );
    const message = await stream.finalMessage();
    const draft = readDraft(message);
    const { document, dropped_items } = priceDraft(draft, inventory, customer);

    return NextResponse.json({
      success: true,
      data: { document, dropped_items, attempts: 1, usage: draftUsage(message, "standard") },
    });
  } catch (err) {
    console.error("Standard draft failed:", err);
    return NextResponse.json({ success: false, error: explainApiError(err) }, { status: 502 });
  }
}

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!authorised(auth)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

  const { data: row } = await supabaseAdmin
    .from("proposal_history")
    .select("id, customer_id, proposal_data")
    .eq("id", id)
    .maybeSingle();
  if (!row) return NextResponse.json({ success: false, error: "Draft not found" }, { status: 404 });

  const pd = row.proposal_data || {};
  if (!pd.pending) {
    return NextResponse.json({ success: true, data: { pending: false, draft: pd } });
  }
  if (pd.pending.error) {
    return NextResponse.json({ success: false, error: pd.pending.error }, { status: 422 });
  }
  if (!pd.pending.batch_id) {
    return NextResponse.json({ success: true, data: { pending: true, status: "submitting" } });
  }

  const client = anthropicClient();
  const fail = async (message: string) => {
    await supabaseAdmin
      .from("proposal_history")
      .update({ filename: "Draft failed", proposal_data: { ...pd, pending: { ...pd.pending, error: message } } })
      .eq("id", row.id);
    return NextResponse.json({ success: false, error: message }, { status: 422 });
  };

  try {
    const batch = await client.messages.batches.retrieve(pd.pending.batch_id);
    if (batch.processing_status !== "ended") {
      return NextResponse.json({
        success: true,
        data: { pending: true, status: batch.processing_status, submitted_at: pd.pending.submitted_at },
      });
    }

    for await (const result of await client.messages.batches.results(pd.pending.batch_id)) {
      if (result.custom_id !== row.id) continue;
      if (result.result.type !== "succeeded") {
        return fail(
          result.result.type === "expired"
            ? "The draft expired before Anthropic got to it. Start it again."
            : "Anthropic couldn't finish this draft. Start it again."
        );
      }

      const message = result.result.message;
      let draft;
      try {
        draft = readDraft(message);
      } catch (e) {
        return fail(e instanceof Error ? e.message : "The draft came back unusable.");
      }

      const [{ inventory }, customer] = await Promise.all([loadCatalogue(), loadCustomer(row.customer_id)]);
      const { document, dropped_items } = priceDraft(draft, inventory, customer);
      const usage = draftUsage(message, "thorough");
      const finished = {
        document,
        dropped_items,
        attempts: 1,
        usage,
        customer_id: pd.customer_id ?? row.customer_id,
        description: pd.description,
      };

      await supabaseAdmin
        .from("proposal_history")
        .update({ proposal_data: finished, total: document.total, filename: document.project_name })
        .eq("id", row.id);

      return NextResponse.json({ success: true, data: { pending: false, draft: finished } });
    }
    return fail("Anthropic finished but returned no result for this draft. Start it again.");
  } catch (err) {
    console.error("Thorough draft check failed:", err);
    // Transient: leave it pending so the next check can succeed.
    return NextResponse.json({ success: false, error: explainApiError(err), retry: true }, { status: 502 });
  }
}
