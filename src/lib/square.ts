import { supabaseAdmin } from "@/lib/supabase";

// Square → site sync.
//
// Pulls three things from Square's API and upserts them into the site's own
// tables: the price list (Catalog → proposal_inventory, which the Proposal
// Agent quotes from), Customers → customers, and Invoices → invoices (which
// is what makes the Reports page real). Every imported row keeps its Square id
// so re-running is safe — it updates rather than duplicates.
//
// Read-only against Square. Nothing here writes back to Square.

const SQUARE_VERSION = "2025-01-23";

function baseUrl() {
  return process.env.SQUARE_ENV === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";
}
export function squareConfigured(): boolean {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN);
}

async function sq<T>(path: string): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "Square-Version": SQUARE_VERSION,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Square ${res.status} on ${path.split("?")[0]}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/** Walk a cursor-paginated Square list endpoint to completion. */
async function paginate<T>(path: string, key: string): Promise<T[]> {
  const out: T[] = [];
  let cursor: string | undefined;
  do {
    const sep = path.includes("?") ? "&" : "?";
    const page = await sq<Record<string, unknown>>(cursor ? `${path}${sep}cursor=${cursor}` : path);
    out.push(...((page[key] as T[]) ?? []));
    cursor = page.cursor as string | undefined;
  } while (cursor);
  return out;
}

// ── Customers ──────────────────────────────────────────────────────────────

interface SqCustomer {
  id: string;
  given_name?: string;
  family_name?: string;
  company_name?: string;
  email_address?: string;
  phone_number?: string;
  note?: string;
  address?: {
    address_line_1?: string;
    locality?: string;
    administrative_district_level_1?: string;
    postal_code?: string;
  };
}

export async function syncCustomers(): Promise<{ count: number; errors: string[] }> {
  const rows = await paginate<SqCustomer>("/v2/customers?limit=100", "customers");
  let count = 0;
  const errors: string[] = [];

  for (const c of rows) {
    const name = [c.given_name, c.family_name].filter(Boolean).join(" ") || c.company_name || "Unnamed";
    const email = c.email_address?.trim().toLowerCase() || null;
    const record = {
      name,
      email,
      phone: c.phone_number || null,
      company: c.company_name || null,
      address: c.address?.address_line_1 || null,
      city: c.address?.locality || null,
      state: c.address?.administrative_district_level_1 || null,
      zip: c.address?.postal_code || null,
      square_customer_id: c.id,
      updated_at: new Date().toISOString(),
    };

    try {
      // Already imported? Update in place.
      const { data: bySquare } = await supabaseAdmin
        .from("customers").select("id").eq("square_customer_id", c.id).maybeSingle();
      if (bySquare) {
        await supabaseAdmin.from("customers").update(record).eq("id", bySquare.id);
        count++; continue;
      }
      // Exists from the earlier CSV import / site signup? Attach the Square id
      // to that row rather than creating a twin.
      if (email) {
        const { data: byEmail } = await supabaseAdmin
          .from("customers").select("id").eq("email", email).is("square_customer_id", null).maybeSingle();
        if (byEmail) {
          await supabaseAdmin.from("customers").update(record).eq("id", byEmail.id);
          count++; continue;
        }
      }
      const { error } = await supabaseAdmin.from("customers").insert([{ ...record, status: "active" }]);
      if (error) throw error;
      count++;
    } catch (e) {
      errors.push(`customer ${name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return { count, errors };
}

// ── Catalog (price list) ───────────────────────────────────────────────────

interface SqCatalogObject {
  type: string;
  id: string;
  is_deleted?: boolean;
  category_data?: { name?: string };
  item_data?: {
    name?: string;
    description?: string;
    category_id?: string;
    categories?: { id: string }[];
    reporting_category?: { id: string };
    variations?: {
      id: string;
      item_variation_data?: {
        name?: string;
        pricing_type?: string;
        price_money?: { amount?: number; currency?: string };
      };
    }[];
  };
}

export async function syncCatalog(): Promise<{ count: number; errors: string[] }> {
  const objects = await paginate<SqCatalogObject>("/v2/catalog/list?types=ITEM,CATEGORY", "objects");
  const categoryName = new Map<string, string>();
  for (const o of objects) if (o.type === "CATEGORY" && o.category_data?.name) categoryName.set(o.id, o.category_data.name);

  let count = 0;
  const errors: string[] = [];

  for (const o of objects) {
    if (o.type !== "ITEM" || o.is_deleted || !o.item_data) continue;
    const item = o.item_data;
    const catId = item.category_id || item.categories?.[0]?.id || item.reporting_category?.id;
    const category = (catId && categoryName.get(catId)) || "Square";

    // One inventory row per priced variation — a "Sprinkler Head" item with
    // Pendant / Upright variations becomes two quotable lines.
    for (const v of item.variations ?? []) {
      const vd = v.item_variation_data;
      const vName = vd?.name && !/^(regular|default)$/i.test(vd.name) ? ` — ${vd.name}` : "";
      const name = `${item.name ?? "Item"}${vName}`;
      const cents = vd?.price_money?.amount;
      const unit_cost = typeof cents === "number" ? cents / 100 : 0;

      try {
        const { error } = await supabaseAdmin.from("proposal_inventory").upsert(
          {
            name,
            category,
            unit: "each",
            unit_cost,
            description: item.description || (vd?.pricing_type === "VARIABLE_PRICING" ? "Variable pricing in Square — priced per job" : null),
            square_catalog_id: v.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "square_catalog_id" }
        );
        if (error) throw error;
        count++;
      } catch (e) {
        errors.push(`catalog ${name}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }
  return { count, errors };
}

// ── Invoices ───────────────────────────────────────────────────────────────

interface SqInvoice {
  id: string;
  invoice_number?: string;
  status?: string;
  primary_recipient?: { customer_id?: string };
  payment_requests?: {
    due_date?: string;
    computed_amount_money?: { amount?: number };
    total_completed_amount_money?: { amount?: number };
  }[];
  created_at?: string;
  updated_at?: string;
}

// Square's invoice statuses onto the site's own vocabulary (the CHECK
// constraint on invoices.status). Unknown values fall back to "sent".
function mapStatus(s: string | undefined, total: number, paid: number, due: string | null): string {
  switch (s) {
    case "DRAFT": return "draft";
    case "PAID": return "paid";
    case "PARTIALLY_PAID": return "partial";
    case "REFUNDED": return "refunded";
    case "PARTIALLY_REFUNDED": return paid >= total ? "paid" : "partial";
    case "CANCELED":
    case "FAILED": return "cancelled";
    default: {
      // UNPAID / SCHEDULED / PAYMENT_PENDING
      const today = new Date().toISOString().slice(0, 10);
      return due && due < today ? "overdue" : "sent";
    }
  }
}

export async function syncInvoices(): Promise<{ count: number; errors: string[] }> {
  const { locations } = await sq<{ locations?: { id: string }[] }>("/v2/locations");
  const errors: string[] = [];
  let count = 0;

  // Square customer id → site customer uuid, for the customer_id FK.
  const { data: custRows } = await supabaseAdmin
    .from("customers").select("id, square_customer_id").not("square_customer_id", "is", null);
  const custMap = new Map((custRows ?? []).map((r) => [r.square_customer_id as string, r.id as string]));

  for (const loc of locations ?? []) {
    const invoices = await paginate<SqInvoice>(`/v2/invoices?location_id=${loc.id}&limit=100`, "invoices");
    for (const inv of invoices) {
      const reqs = inv.payment_requests ?? [];
      const total = reqs.reduce((s, r) => s + (r.computed_amount_money?.amount ?? 0), 0) / 100;
      const paid = reqs.reduce((s, r) => s + (r.total_completed_amount_money?.amount ?? 0), 0) / 100;
      const due = reqs.map((r) => r.due_date).filter(Boolean).sort()[0] ?? null;
      const status = mapStatus(inv.status, total, paid, due);

      try {
        const { error } = await supabaseAdmin.from("invoices").upsert(
          {
            invoice_number: inv.invoice_number || `SQ-${inv.id.slice(0, 8)}`,
            customer_id: inv.primary_recipient?.customer_id
              ? custMap.get(inv.primary_recipient.customer_id) ?? null
              : null,
            // Line-item detail lives on the Square order, not the invoice;
            // subtotal/tax would need a second call per invoice. Total is exact.
            subtotal: total,
            tax_amount: 0,
            total,
            amount_paid: paid,
            status,
            due_date: due,
            paid_at: status === "paid" ? inv.updated_at ?? null : null,
            sent_at: inv.status === "DRAFT" ? null : inv.created_at ?? null,
            notes: "Imported from Square",
            square_invoice_id: inv.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "square_invoice_id" }
        );
        if (error) throw error;
        count++;
      } catch (e) {
        errors.push(`invoice ${inv.invoice_number ?? inv.id}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }
  return { count, errors };
}

// ── Orchestration ──────────────────────────────────────────────────────────

export interface SyncResult {
  customers: number;
  catalog: number;
  invoices: number;
  errors: string[];
  synced_at: string;
}

export async function syncAll(): Promise<SyncResult> {
  // Customers first so invoices can link to them.
  const c = await syncCustomers();
  const k = await syncCatalog();
  const i = await syncInvoices();
  const result: SyncResult = {
    customers: c.count,
    catalog: k.count,
    invoices: i.count,
    errors: [...c.errors, ...k.errors, ...i.errors],
    synced_at: new Date().toISOString(),
  };
  await supabaseAdmin.from("square_sync_state").upsert(
    {
      id: "default",
      last_synced_at: result.synced_at,
      customers_synced: result.customers,
      catalog_synced: result.catalog,
      invoices_synced: result.invoices,
      errors: result.errors.slice(0, 50),
    },
    { onConflict: "id" }
  );
  return result;
}

export async function lastSync() {
  const { data } = await supabaseAdmin.from("square_sync_state").select("*").eq("id", "default").maybeSingle();
  return data;
}
