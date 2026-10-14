import Anthropic, { toFile } from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";
import type { ProposalDocument, ScopeLineItem } from "@/lib/proposal-doc";

// Everything the proposal drafter shares between its two paths:
//   standard — Opus at high effort, streamed back inside one request;
//   thorough — Opus at extra-high effort through the Message Batches API, so a
//              long think isn't cut off by the hosting time limit (and bills at
//              half price).
//
// Deliberate split of responsibility: the model chooses WHICH catalogue items
// and HOW MANY; priceDraft() does every calculation. These numbers go to
// customers as real quotes, so unit prices are read from the database by id,
// totals are computed here, and anything not in the catalogue is dropped rather
// than silently priced.

export const PROPOSAL_MODEL = "claude-opus-5-5";

export type DraftMode = "standard" | "thorough";

// ---- plans & site photos attached to a draft ----
export const PROPOSAL_FILES_BUCKET = "proposal-files";
/** What Claude can read, and how each type is attached. */
export const PROPOSAL_FILE_TYPES: Record<string, "document" | "image"> = {
  "application/pdf": "document",
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
};
export const PROPOSAL_FILE_MAX_BYTES = 50 * 1024 * 1024;
export const PROPOSAL_MAX_FILES = 10;
// Copies sent to Anthropic expire on their own; thorough batches can take up to a day.
const ANTHROPIC_FILE_TTL_SECONDS = 3 * 24 * 60 * 60;

export interface DraftFile { path: string; name: string; type: string }

/** Keep only well-formed attachments that live in our drafts folder. */
export function cleanDraftFiles(input: unknown): DraftFile[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter(
      (f): f is DraftFile =>
        !!f &&
        typeof f.path === "string" &&
        f.path.startsWith("drafts/") &&
        !f.path.includes("..") &&
        typeof f.type === "string" &&
        f.type in PROPOSAL_FILE_TYPES
    )
    .slice(0, PROPOSAL_MAX_FILES)
    .map((f) => ({ path: f.path, name: String(f.name || f.path.split("/").pop()), type: f.type }));
}

/**
 * Copy each stored file to Anthropic's Files API and return the content blocks
 * that reference them. A plan set sent as a file reference avoids the 32 MB
 * request cap that inlining it as base64 would hit.
 */
export async function attachDraftFiles(client: Anthropic, files: DraftFile[]) {
  return Promise.all(
    files.map(async (f) => {
      const { data, error } = await supabaseAdmin.storage.from(PROPOSAL_FILES_BUCKET).download(f.path);
      if (error || !data) throw new Error(`Couldn't read the uploaded file ${f.name}. Remove it and upload it again.`);
      const uploaded = await client.files.upload({
        file: await toFile(data, f.name, { type: f.type }),
        expires_in_seconds: ANTHROPIC_FILE_TTL_SECONDS,
      });
      return PROPOSAL_FILE_TYPES[f.type] === "document"
        ? { type: "document" as const, source: { type: "file" as const, file_id: uploaded.id }, title: f.name }
        : { type: "image" as const, source: { type: "file" as const, file_id: uploaded.id } };
    })
  );
}

export type DraftAttachment = Awaited<ReturnType<typeof attachDraftFiles>>[number];
export const EFFORT: Record<DraftMode, "high" | "xhigh"> = { standard: "high", thorough: "xhigh" };

// Opus 5.5 list prices, USD per million tokens. Batches bill at half.
const RATES = { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 };

export interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  unit_cost: number;
  unit: string | null;
}
export interface Procedure { name: string; category: string | null; steps: string; notes: string | null }
export interface DraftCustomer {
  name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
}

interface DraftLine { inventory_id: string; quantity: number; note: string }
interface DraftScope {
  title: string;
  narrative: string;
  inclusions: string[];
  notes: string[];
  price_qualifier: string;
  line_items: DraftLine[];
}
export interface ProposalDraft {
  project_name: string;
  jurisdiction: string;
  occupancy: string;
  building_size: string;
  intro: string;
  scopes: DraftScope[];
  exclusions: string[];
  gaps: string[];
}

export interface DraftUsage {
  model: string;
  effort: string;
  mode: DraftMode;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  /** True when part of the reply came from a fallback model, priced here at Opus rates. */
  approximate?: boolean;
}

const str = (description: string) => ({ type: "string", description });
const strList = (description: string) => ({ type: "array", items: { type: "string" }, description });

/** Structured-output schema: the reply is guaranteed to parse into a ProposalDraft. */
export const DRAFT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["project_name", "jurisdiction", "occupancy", "building_size", "intro", "scopes", "exclusions", "gaps"],
  properties: {
    project_name: str("The building or business name"),
    jurisdiction: str("e.g. City of Houston / IFC 2021"),
    occupancy: str("e.g. F-1 (Distillery Addendum — Sprinkler Required)"),
    building_size: str("e.g. ~3,500 SF Office/Warehouse"),
    intro: str("One paragraph: what Contractor will furnish, for whom, under which codes"),
    scopes: {
      type: "array",
      description: "One scope per discipline or system",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "narrative", "inclusions", "notes", "price_qualifier", "line_items"],
        properties: {
          title: str("e.g. Fire Alarm System"),
          narrative: str("2-4 sentences on what is installed and the codes it complies with"),
          inclusions: strList("Specification-style bullets of the work, in plain terms, not priced parts"),
          notes: strList("Code triggers, assumptions, cross-references between scopes"),
          price_qualifier: str("Empty unless the price depends on something outstanding, e.g. ESTIMATED, Pending Flow Test"),
          line_items: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["inventory_id", "quantity", "note"],
              properties: {
                inventory_id: str("The catalogue id, copied exactly"),
                quantity: { type: "integer", description: "How many" },
                note: str("Internal justification for the quantity"),
              },
            },
          },
        },
      },
    },
    exclusions: strList("What is explicitly not included"),
    gaps: strList("Needed but not in the catalogue. Internal only, never priced"),
  },
} as const;

export function buildPrompts(input: {
  inventory: InventoryItem[];
  procedures: Procedure[];
  customer: DraftCustomer | null;
  description: string;
  /** Names of attached plans/photos, if any. */
  attachments?: string[];
}) {
  const catalogue = input.inventory
    .map(
      (i) =>
        `${i.id} | ${i.name} | ${i.category} | ${i.unit_cost > 0 ? "$" + i.unit_cost : "PRICED PER JOB"} ${i.unit || ""} | ${i.description || ""}`
    )
    .join("\n");

  const system = `You are writing a commercial fire and life safety agreement for Chatman Security & Fire, a licensed Houston contractor (est. 2009).

Write the way an experienced estimator writes to a building owner or general contractor: direct, specific, no marketing language. Cite code by name and section where it drives the scope (NFPA 72, NFPA 13, IFC, NFPA 90A, local AHJ amendments). That is what earns trust with this audience.

Organise the work into scopes, one per discipline or system (for example: Fire Alarm System; Fire Sprinkler System — Aboveground Interior; Underground Fire Line). A small job may be a single scope.

Price only from this catalogue. Each line is: id | name | category | price | description
${catalogue}

Rules:
- Choose catalogue items by id. Never invent an item or a price; the totals are calculated from the catalogue after you reply.
- Assign every line item to the scope it belongs to.
- The customer sees one all-inclusive price per scope, so write inclusions as work described in plain terms ("3-inch grooved wet-pipe riser assembly including alarm valve, OS&Y gate valve, check valve"), not as priced parts.
- Inclusions should read like a specification: quantities, sizes, materials, and what is being commissioned.
- Put anything needed that is not in the catalogue into gaps rather than guessing a price.
- Use notes for code triggers, assumptions and cross-references between scopes.
- Set price_qualifier only where the price genuinely depends on something outstanding; otherwise leave it empty.
- Always include labor and a trip charge where work is on site.
- Before finishing, check device quantities against the building size, floors, and occupancy described, and make sure nothing the job needs is missing.`;

  const c = input.customer;
  const user = [
    c ? `Customer: ${c.company || c.name}${c.city ? `, ${c.city}, ${c.state || ""}` : ""}` : null,
    `Job: ${input.description}`,
    input.attachments?.length
      ? `
Attached: ${input.attachments.join(", ")}. Use these drawings and photos to count devices, confirm the building layout, and check the scope. Where the attachments and the description disagree, follow the attachments and say so in notes. If a sheet is unreadable or missing information you need, list what's missing in gaps.`
      : null,
    input.procedures.length
      ? `\nOur standard procedures:\n${input.procedures.map((p) => `- ${p.name}: ${p.steps}`).join("\n")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  return { system, user };
}

/** The request body shared by both paths (model, prompt, structured output). */
export function draftParams(
  prompts: { system: string; user: string },
  mode: DraftMode,
  attachments: DraftAttachment[] = []
) {
  return {
    model: PROPOSAL_MODEL,
    // Streamed (standard) or batched (thorough), so a large ceiling is safe;
    // extra-high effort spends more of it on thinking before the answer.
    max_tokens: mode === "thorough" ? 64000 : 32000,
    system: prompts.system,
    messages: [
      {
        role: "user" as const,
        content: attachments.length
          ? [...attachments, { type: "text" as const, text: prompts.user }]
          : prompts.user,
      },
    ],
    output_config: {
      effort: EFFORT[mode],
      format: { type: "json_schema" as const, schema: DRAFT_SCHEMA as unknown as Record<string, unknown> },
    },
  };
}

/** Pull the structured draft out of a finished reply, or explain why it can't be used. */
export function readDraft(message: {
  stop_reason: string | null;
  content: Array<{ type: string; text?: string }>;
}): ProposalDraft {
  if (message.stop_reason === "refusal") {
    throw new Error("The model declined to draft this job. Rephrase the description and try again.");
  }
  if (message.stop_reason === "max_tokens") {
    throw new Error("The draft ran out of room before it finished. Try a Thorough draft, or split the job into two drafts.");
  }
  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");
  try {
    return JSON.parse(text) as ProposalDraft;
  } catch {
    throw new Error("The draft came back in an unexpected format. Try again.");
  }
}

/** Approximate cost of one draft from the API's usage report. */
export function draftUsage(
  message: {
    model: string;
    usage: {
      input_tokens: number;
      output_tokens: number;
      cache_creation_input_tokens?: number | null;
      cache_read_input_tokens?: number | null;
    };
  },
  mode: DraftMode
): DraftUsage {
  const u = message.usage;
  const cacheWrite = u.cache_creation_input_tokens || 0;
  const cacheRead = u.cache_read_input_tokens || 0;
  const discount = mode === "thorough" ? 0.5 : 1;
  const cost =
    ((u.input_tokens * RATES.input +
      cacheWrite * RATES.cacheWrite +
      cacheRead * RATES.cacheRead +
      u.output_tokens * RATES.output) /
      1_000_000) *
    discount;
  return {
    model: message.model,
    effort: EFFORT[mode],
    mode,
    input_tokens: u.input_tokens + cacheWrite + cacheRead,
    output_tokens: u.output_tokens,
    cost_usd: Math.round(cost * 10000) / 10000,
    ...(message.model !== PROPOSAL_MODEL ? { approximate: true } : {}),
  };
}

/** Turn the model's item picks into a priced agreement. All arithmetic happens here. */
export function priceDraft(draft: ProposalDraft, inventory: InventoryItem[], customer: DraftCustomer | null) {
  const byId = new Map(inventory.map((i) => [i.id, i]));
  const dropped: string[] = [];

  const scopes = (draft.scopes || []).map((sc) => {
    const lines: ScopeLineItem[] = [];
    // Anything in this scope we could not put a number against. A scope with
    // entries here has an incomplete price and must not read as final.
    const unpriced: string[] = [];

    for (const li of sc.line_items || []) {
      const item = li.inventory_id ? byId.get(li.inventory_id) : undefined;
      if (!item) {
        const label = li.inventory_id || "unknown item";
        dropped.push(label);
        unpriced.push(`${label} — not in the catalogue`);
        continue;
      }
      const qty = Math.max(1, Math.round(Number(li.quantity) || 1));
      const unitCost = Number(item.unit_cost) || 0;
      if (unitCost === 0) unpriced.push(`${item.name} — no rate set (priced per job)`);
      lines.push({
        name: item.name,
        quantity: qty,
        unit_cost: unitCost,
        total: Math.round(unitCost * qty * 100) / 100,
      });
    }

    const price = Math.round(lines.reduce((s, l) => s + l.total, 0) * 100) / 100;
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

  const total = Math.round(scopes.reduce((s, sc) => s + sc.price, 0) * 100) / 100;

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
    date: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "America/Chicago",
    }),
    intro: draft.intro || "",
    scopes,
    exclusions: draft.exclusions || [],
    gaps: draft.gaps || [],
    total,
    validity_days: 30,
  };

  return { document, dropped_items: dropped };
}

export function anthropicClient() {
  // Reads ANTHROPIC_API_KEY from the environment.
  return new Anthropic();
}
