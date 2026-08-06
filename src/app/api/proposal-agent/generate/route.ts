import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";

// Drafts a proposal from a plain-language job description, priced against the
// real catalogue.
//
// Deliberate split of responsibility: the model chooses WHICH items and HOW
// MANY; this route does every calculation. Language models are unreliable at
// arithmetic, and these numbers go to customers as real quotes — so unit prices
// are read from the database by id, line totals and the grand total are
// computed here, and anything the model invents that isn't in the catalogue is
// dropped rather than silently priced.

const MODEL = "claude-sonnet-5";
const TAX_RATE = 0.0825; // Harris County

interface ProposalDraft {
  title?: string;
  scope_summary?: string;
  line_items?: DraftLine[];
  assumptions?: string[];
  exclusions?: string[];
  gaps?: string[];
  code_notes?: string[];
}

interface DraftLine {
  inventory_id?: string;
  name?: string;
  quantity?: number;
  note?: string;
}


/** Pull the outermost JSON object out of a reply that may carry a code fence or
 *  a sentence of preamble. */
function extractJson(raw: string): unknown | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  const candidate = start >= 0 && end > start ? raw.slice(start, end + 1) : raw.trim();
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

/** Concatenate the text blocks. The first block is not necessarily the answer —
 *  this model can emit a thinking block ahead of the text. */
function textFromReply(payload: { content?: { type?: string; text?: string }[] }): string {
  return (payload?.content ?? [])
    .filter((b) => b?.type === "text")
    .map((b) => b.text ?? "")
    .join("");
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !["admin", "manager"].includes(auth.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "ANTHROPIC_API_KEY is not configured on this environment." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const description: string = (body.description || "").trim();
    if (!description) {
      return NextResponse.json(
        { success: false, error: "Describe the job and I'll draft the proposal." },
        { status: 400 }
      );
    }

    const [{ data: inventory }, { data: procedures }, { data: customer }] = await Promise.all([
      supabaseAdmin.from("proposal_inventory").select("id, name, description, category, unit_cost, unit"),
      supabaseAdmin.from("proposal_procedures").select("name, category, steps, notes"),
      body.customer_id
        ? supabaseAdmin.from("customers").select("name, company, address, city, state").eq("id", body.customer_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const catalogue = (inventory || []).map(
      (i) =>
        `${i.id} | ${i.name} | ${i.category} | ${i.unit_cost > 0 ? "$" + i.unit_cost : "PRICED PER JOB"} ${i.unit || ""} | ${i.description || ""}`
    ).join("\n");

    const systemPrompt = `You are writing a commercial fire and life safety proposal for Chatman Security & Fire, a licensed Houston contractor (est. 2009).

Write the way an experienced estimator talks to a building owner or general contractor: direct, specific, no marketing fluff. Reference code by name where it matters (NFPA 72, NFPA 13, IFC, local AHJ) because that is what earns trust with this audience.

PRICE ONLY FROM THIS CATALOGUE. Each line is: id | name | category | price | description
${catalogue}

Rules:
- Choose items by their id. Never invent an item or a price.
- If something the job needs is not in the catalogue, put it in "gaps" — do not guess a price.
- Items marked PRICED PER JOB should still be included where relevant; quantity 1, and explain in the note.
- Be realistic about quantities. A device count should follow from the described square footage, room count or scope.
- Always include labor and a trip charge where the work is on site.

Reply with ONLY a JSON object, no prose and no code fence:
{
  "title": "short proposal title",
  "scope_summary": "2-4 sentences describing the work in plain language",
  "line_items": [{ "inventory_id": "uuid", "quantity": 12, "note": "optional short justification" }],
  "assumptions": ["what you assumed about the building or existing conditions"],
  "exclusions": ["what is explicitly not included"],
  "gaps": ["anything needed that is not in the catalogue and needs pricing"],
  "code_notes": ["relevant code requirements driving this scope"]
}`;

    const userPrompt = [
      customer ? `Customer: ${customer.company || customer.name}${customer.city ? `, ${customer.city}, ${customer.state || ""}` : ""}` : null,
      `Job: ${description}`,
      procedures?.length ? `\nOur standard procedures:\n${procedures.map((p) => `- ${p.name}: ${p.steps}`).join("\n")}` : null,
    ].filter(Boolean).join("\n");

    // The draft is asked for as raw JSON, and roughly one reply in three comes
    // back with something around it that won't parse. Retrying is cheap and
    // invisible; surfacing it made the estimator click the button twice.
    const MAX_ATTEMPTS = 3;
    let draft: ProposalDraft | null = null;
    let lastFailure = "";
    let attemptsUsed = 0;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      attemptsUsed = attempt;

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          // A full proposal with twenty-odd line items plus assumptions and
          // code notes runs well past 2000 tokens; truncating mid-JSON
          // produced an unparseable draft rather than a short one.
          max_tokens: 15000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!resp.ok) {
        const detail = await resp.text();
        console.error("Anthropic error:", resp.status, detail.slice(0, 400));

        let upstream = "";
        try {
          upstream = JSON.parse(detail)?.error?.message || "";
        } catch {
          upstream = detail.slice(0, 200);
        }

        // A bad key or no credit will fail identically every time — retrying
        // just makes the user wait three times as long for the same answer.
        const permanent = resp.status === 401 || resp.status === 403;

        let keyShape = "";
        if (resp.status === 401) {
          const trimmed = apiKey.trim();
          keyShape =
            ` [stored key: ${apiKey.length} chars` +
            (trimmed.length !== apiKey.length
              ? `, HAS SURROUNDING WHITESPACE (${apiKey.length - trimmed.length} chars)`
              : "") +
            `, starts "${trimmed.slice(0, 11)}", ends "${trimmed.slice(-4)}"]`;
        }

        const hint =
          resp.status === 401
            ? `The key reached Anthropic and was rejected, so this is the value itself — not the deployment.${keyShape}`
            : resp.status === 429
              ? "Rate limited or out of credit on the Anthropic account."
              : "";

        if (permanent || attempt === MAX_ATTEMPTS) {
          return NextResponse.json(
            {
              success: false,
              error: `Anthropic returned ${resp.status}${upstream ? `: ${upstream}` : ""}${hint ? ` — ${hint}` : ""}`,
            },
            { status: 502 }
          );
        }
        lastFailure = `${resp.status} ${upstream}`;
        continue;
      }

      const payload = await resp.json();
      const raw = textFromReply(payload);
      const parsed = extractJson(raw);

      if (parsed && typeof parsed === "object") {
        draft = parsed as ProposalDraft;
        break;
      }

      lastFailure =
        payload?.stop_reason === "max_tokens"
          ? "reply hit the length limit"
          : `reply did not parse (${raw.length} chars, blocks: ${(payload?.content ?? []).map((b: { type?: string }) => b?.type).join(",")})`;
      console.error(`Proposal attempt ${attempt}/${MAX_ATTEMPTS} failed: ${lastFailure}`);
    }

    if (!draft) {
      return NextResponse.json(
        {
          success: false,
          error: `Couldn't get a usable draft after ${MAX_ATTEMPTS} attempts. Try again, or describe a smaller scope.`,
          debug: { last_failure: lastFailure },
        },
        { status: 502 }
      );
    }

    // ---- pricing happens here, not in the model ----
    const byId = new Map((inventory || []).map((i) => [i.id, i]));
    const lines: {
      name: string;
      description: string | null;
      unit: string | null;
      quantity: number;
      unit_cost: number;
      total: number;
      note?: string;
      priced_per_job: boolean;
    }[] = [];
    const dropped: string[] = [];

    for (const li of draft.line_items || []) {
      const item = li.inventory_id ? byId.get(li.inventory_id) : undefined;
      if (!item) {
        dropped.push(li.name || li.inventory_id || "unknown item");
        continue;
      }
      const qty = Math.max(1, Math.round(Number(li.quantity) || 1));
      const unitCost = Number(item.unit_cost) || 0;
      lines.push({
        name: item.name,
        description: item.description,
        unit: item.unit,
        quantity: qty,
        unit_cost: unitCost,
        total: Math.round(unitCost * qty * 100) / 100,
        note: li.note,
        priced_per_job: unitCost === 0,
      });
    }

    const subtotal = Math.round(lines.reduce((s, l) => s + l.total, 0) * 100) / 100;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    return NextResponse.json({
      success: true,
      data: {
        title: draft.title || "Fire & Life Safety Proposal",
        scope_summary: draft.scope_summary || "",
        line_items: lines,
        assumptions: draft.assumptions || [],
        exclusions: draft.exclusions || [],
        gaps: draft.gaps || [],
        code_notes: draft.code_notes || [],
        subtotal,
        tax_rate: TAX_RATE,
        tax,
        total,
        // Surfaced so the estimator knows the draft is incomplete rather than
        // discovering a missing line after it has gone out.
        dropped_items: dropped,
        // Visible so a run that needed retries is noticeable without being an error.
        attempts: attemptsUsed,
      },
    });
  } catch (error) {
    console.error("Error generating proposal:", error);
    return NextResponse.json({ success: false, error: "Failed to generate the proposal" }, { status: 500 });
  }
}
