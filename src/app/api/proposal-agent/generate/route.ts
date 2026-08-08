import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";
import type { ProposalDocument, ScopeLineItem } from "@/lib/proposal-doc";

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

interface DraftScope {
  title?: string;
  narrative?: string;
  inclusions?: string[];
  notes?: string[];
  price_qualifier?: string;
  line_items?: DraftLine[];
}

interface ProposalDraft {
  project_name?: string;
  jurisdiction?: string;
  occupancy?: string;
  building_size?: string;
  intro?: string;
  scopes?: DraftScope[];
  exclusions?: string[];
  gaps?: string[];
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
        ? supabaseAdmin.from("customers").select("name, company, email, phone, address, city, state").eq("id", body.customer_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const catalogue = (inventory || []).map(
      (i) =>
        `${i.id} | ${i.name} | ${i.category} | ${i.unit_cost > 0 ? "$" + i.unit_cost : "PRICED PER JOB"} ${i.unit || ""} | ${i.description || ""}`
    ).join("\n");

    const systemPrompt = `You are writing a commercial fire and life safety agreement for Chatman Security & Fire, a licensed Houston contractor (est. 2009).

Write the way an experienced estimator writes to a building owner or general contractor: direct, specific, no marketing language. Cite code by name and section where it drives the scope (NFPA 72, NFPA 13, IFC, NFPA 90A, local AHJ amendments) — that is what earns trust with this audience.

Organise the work into SCOPES, one per discipline or system (for example: Fire Alarm System; Fire Sprinkler System — Aboveground Interior; Underground Fire Line). A small job may be a single scope.

PRICE ONLY FROM THIS CATALOGUE. Each line is: id | name | category | price | description
${catalogue}

Rules:
- Choose catalogue items by id. Never invent an item or a price.
- Assign every line item to the scope it belongs to.
- The customer sees one all-inclusive price per scope, so write inclusions as work described in plain terms ("3-inch grooved wet-pipe riser assembly including alarm valve, OS&Y gate valve, check valve"), NOT as priced parts.
- Inclusions should read like a specification: quantities, sizes, materials, and what is being commissioned.
- Put anything needed that is not in the catalogue into "gaps" — never guess a price.
- Use notes for code triggers, assumptions and cross-references between scopes.
- Set price_qualifier only where the price genuinely depends on something outstanding, e.g. "ESTIMATED, Pending Flow Test".
- Always include labor and a trip charge where work is on site.

Reply with ONLY a JSON object, no prose and no code fence:
{
  "project_name": "the building or business name",
  "jurisdiction": "e.g. City of Houston / IFC 2021",
  "occupancy": "e.g. F-1 (Distillery Addendum — Sprinkler Required)",
  "building_size": "e.g. ~3,500 SF Office/Warehouse",
  "intro": "one paragraph: what Contractor will furnish, for whom, under which codes",
  "scopes": [
    {
      "title": "Fire Alarm System",
      "narrative": "2-4 sentences on what is installed and the codes it complies with",
      "inclusions": ["specification-style bullets of the work"],
      "notes": ["code triggers, assumptions, cross-references"],
      "price_qualifier": "",
      "line_items": [{ "inventory_id": "uuid", "quantity": 8, "note": "internal justification" }]
    }
  ],
  "exclusions": ["what is explicitly not included"],
  "gaps": ["needed but not in the catalogue — internal only"]
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
    // Each scope's price is the sum of its catalogue lines. The customer sees
    // only that total; the itemisation stays on the record so the number can be
    // defended and adjusted later.
    const byId = new Map((inventory || []).map((i) => [i.id, i]));
    const dropped: string[] = [];

    const scopes = (draft.scopes || []).map((sc) => {
      const lines: ScopeLineItem[] = [];
      // Anything in this scope we could not put a number against. A scope with
      // entries here has an incomplete price and must not read as final.
      const unpriced: string[] = [];

      for (const li of sc.line_items || []) {
        const item = li.inventory_id ? byId.get(li.inventory_id) : undefined;
        if (!item) {
          const label = li.name || li.inventory_id || "unknown item";
          dropped.push(label);
          unpriced.push(`${label} — not in the catalogue`);
          continue;
        }
        const qty = Math.max(1, Math.round(Number(li.quantity) || 1));
        const unitCost = Number(item.unit_cost) || 0;
        if (unitCost === 0) {
          unpriced.push(`${item.name} — no rate set (priced per job)`);
        }
        lines.push({
          name: item.name,
          quantity: qty,
          unit_cost: unitCost,
          total: Math.round(unitCost * qty * 100) / 100,
        });
      }

      const price = Math.round(lines.reduce((s2, l) => s2 + l.total, 0) * 100) / 100;

      return {
        title: sc.title || "Scope of Work",
        narrative: sc.narrative || "",
        inclusions: sc.inclusions || [],
        notes: sc.notes || [],
        price,
        line_items: lines,
        price_qualifier: sc.price_qualifier || undefined,
        unpriced,
      };
    });

    const total = Math.round(scopes.reduce((s2, sc) => s2 + sc.price, 0) * 100) / 100;

    const document: ProposalDocument = {
      project_name: draft.project_name || customer?.company || customer?.name || "Project",
      project_address: [customer?.address, customer?.city, customer?.state].filter(Boolean).join(", ") || "To be confirmed",
      jurisdiction: draft.jurisdiction || "City of Houston / IFC 2021",
      occupancy: draft.occupancy || "To be confirmed",
      building_size: draft.building_size || "To be confirmed",
      client_name: customer?.name || draft.project_name || "Owner",
      client_email: customer?.email || undefined,
      client_phone: customer?.phone || undefined,
      prepared_by: "Howard Chatman, Chatman Security & Fire",
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      intro: draft.intro || "",
      scopes,
      exclusions: draft.exclusions || [],
      gaps: draft.gaps || [],
      total,
      validity_days: 30,
    };

    return NextResponse.json({
      success: true,
      data: {
        document,
        // Surfaced so the estimator knows the draft is incomplete rather than
        // discovering a missing line after it has gone out.
        dropped_items: dropped,
        attempts: attemptsUsed,
      },
    });
  } catch (error) {
    console.error("Error generating proposal:", error);
    return NextResponse.json({ success: false, error: "Failed to generate the proposal" }, { status: 500 });
  }
}
