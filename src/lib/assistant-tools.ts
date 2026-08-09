import { supabaseAdmin } from "@/lib/supabase";

// What the admin assistant is allowed to look at.
//
// The hard rule, learned the expensive way on the proposal agent: the model
// decides WHICH tool to call and how to phrase the answer. The code does every
// count, sum, and date subtraction. A model asked to add up invoices will
// produce a number that looks right and is wrong, and a wrong revenue figure
// in a chat bubble is indistinguishable from a right one.
//
// So each tool returns rows the model can quote verbatim, plus a `summary`
// block of figures already computed here. The model's job is to choose and
// explain, never to arithmetic.
//
// Everything here is read-only. There is no tool that writes, sends, or
// deletes — an assistant that can text a customer is a different feature with
// a different risk profile, and it isn't this one.

export interface ToolResult {
  [key: string]: unknown;
}

const DAY = 86_400_000;

const daysSince = (iso?: string | null) =>
  iso ? Math.floor((Date.now() - new Date(iso).getTime()) / DAY) : null;

const usd = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents);

/** Today in the Houston timezone — the business runs on local dates, not UTC. */
export function houstonToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// ── tool schemas handed to the model ──────────────────────────────────────

export const ASSISTANT_TOOLS = [
  {
    name: "get_leads",
    description:
      "Leads from the website, phone, and referrals. Use for 'who should I call', 'any new leads', 'follow-ups'. Returns each lead with how many days old it is, plus counts by status and source.",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          description:
            "Filter to one status, e.g. 'new', 'contacted', 'qualified', 'won', 'lost'. Omit for all.",
        },
        max_age_days: {
          type: "number",
          description: "Only leads created within this many days.",
        },
        limit: { type: "number", description: "Max rows to return (default 25)." },
      },
    },
  },
  {
    name: "get_schedule",
    description:
      "Jobs and inspections scheduled in a date window. Use for 'what's on today', 'this week', 'what's coming up'. Dates are YYYY-MM-DD in Houston time.",
    input_schema: {
      type: "object" as const,
      properties: {
        start_date: { type: "string", description: "YYYY-MM-DD. Defaults to today." },
        end_date: { type: "string", description: "YYYY-MM-DD. Defaults to start_date." },
      },
    },
  },
  {
    name: "get_jobs",
    description:
      "Jobs in the field, by status. Use for 'what's in progress', 'what's waiting on a permit', 'what did we finish'.",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          description:
            "One job status, e.g. 'in_progress', 'scheduled', 'permit_approved', 'completed'. Omit for all open work.",
        },
        limit: { type: "number", description: "Max rows (default 25)." },
      },
    },
  },
  {
    name: "get_invoices",
    description:
      "Invoices with money totals. Use for revenue, outstanding balances, overdue accounts, 'how did we do this month'. All totals are computed server-side.",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          description: "e.g. 'paid', 'sent', 'draft', 'overdue'. Omit for all.",
        },
        since: {
          type: "string",
          description: "YYYY-MM-DD — only invoices created on or after this date.",
        },
      },
    },
  },
  {
    name: "get_inspections",
    description:
      "Inspections, including whether the NFPA 72 report has been filled out. Use for 'what inspections are due', 'which reports are missing'.",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          description: "'scheduled', 'in_progress', 'completed', or 'cancelled'.",
        },
        missing_report: {
          type: "boolean",
          description: "True to return only inspections with no NFPA 72 report saved yet.",
        },
      },
    },
  },
  {
    name: "get_customers",
    description:
      "The customer list. Use to look someone up, or to answer 'how many customers do we have'.",
    input_schema: {
      type: "object" as const,
      properties: {
        search: { type: "string", description: "Match against name, company, email, or phone." },
        limit: { type: "number", description: "Max rows (default 25)." },
      },
    },
  },
  {
    name: "get_team",
    description:
      "Employees with logins, their roles, and hours clocked recently. Use for 'who works here', 'who's on the clock', 'who can I assign'. Never returns password data.",
    input_schema: {
      type: "object" as const,
      properties: {
        role: {
          type: "string",
          description: "'admin', 'manager', 'technician', or 'inspector'.",
        },
      },
    },
  },
];

// ── executors ─────────────────────────────────────────────────────────────

type Args = Record<string, unknown>;
const num = (v: unknown, d: number) => (typeof v === "number" && v > 0 ? v : d);
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

async function getLeads(a: Args): Promise<ToolResult> {
  let q = supabaseAdmin
    .from("leads")
    .select("id, name, phone, email, company, property_address, source, status, message, created_at")
    .order("created_at", { ascending: false })
    .limit(num(a.limit, 25));

  const status = str(a.status);
  if (status) q = q.eq("status", status);
  if (typeof a.max_age_days === "number") {
    q = q.gte("created_at", new Date(Date.now() - a.max_age_days * DAY).toISOString());
  }

  const { data, error } = await q;
  if (error) return { error: error.message };

  // Counts come from the whole table, not the page of rows above — otherwise
  // "how many new leads" silently means "how many in the first 25".
  const { data: all } = await supabaseAdmin.from("leads").select("status, source, created_at");
  const byStatus: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  let last7 = 0;
  for (const r of all ?? []) {
    byStatus[r.status ?? "unknown"] = (byStatus[r.status ?? "unknown"] ?? 0) + 1;
    bySource[r.source ?? "unknown"] = (bySource[r.source ?? "unknown"] ?? 0) + 1;
    if ((daysSince(r.created_at) ?? 999) <= 7) last7++;
  }

  return {
    leads: (data ?? []).map((l) => ({
      ...l,
      days_old: daysSince(l.created_at),
      has_phone: !!l.phone,
    })),
    summary: {
      returned: data?.length ?? 0,
      total_leads: all?.length ?? 0,
      by_status: byStatus,
      by_source: bySource,
      created_last_7_days: last7,
    },
  };
}

async function getSchedule(a: Args): Promise<ToolResult> {
  const start = str(a.start_date) ?? houstonToday();
  const end = str(a.end_date) ?? start;

  const [jobs, inspections] = await Promise.all([
    supabaseAdmin
      .from("jobs")
      .select(
        "id, job_number, customer_name, site_address, site_city, job_type, status, priority, scheduled_date, scheduled_time_start, description"
      )
      .gte("scheduled_date", start)
      .lte("scheduled_date", end)
      .order("scheduled_date")
      .order("scheduled_time_start"),
    supabaseAdmin
      .from("inspections")
      .select(
        "id, inspection_number, customer_name, site_address, site_city, inspection_type, status, scheduled_date, scheduled_time"
      )
      .gte("scheduled_date", start)
      .lte("scheduled_date", end)
      .order("scheduled_date"),
  ]);

  return {
    window: { start_date: start, end_date: end, today: houstonToday() },
    jobs: jobs.data ?? [],
    inspections: inspections.data ?? [],
    summary: {
      job_count: jobs.data?.length ?? 0,
      inspection_count: inspections.data?.length ?? 0,
      total_appointments: (jobs.data?.length ?? 0) + (inspections.data?.length ?? 0),
    },
  };
}

async function getJobs(a: Args): Promise<ToolResult> {
  let q = supabaseAdmin
    .from("jobs")
    .select(
      "id, job_number, customer_name, site_address, site_city, job_type, status, priority, scheduled_date, total_amount, invoiced_at, paid_at, created_at"
    )
    .order("scheduled_date", { ascending: true, nullsFirst: false })
    .limit(num(a.limit, 25));

  const status = str(a.status);
  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) return { error: error.message };

  const { data: all } = await supabaseAdmin.from("jobs").select("status");
  const byStatus: Record<string, number> = {};
  for (const r of all ?? []) byStatus[r.status ?? "unknown"] = (byStatus[r.status ?? "unknown"] ?? 0) + 1;

  return {
    jobs: (data ?? []).map((j) => ({ ...j, days_old: daysSince(j.created_at) })),
    summary: { returned: data?.length ?? 0, total_jobs: all?.length ?? 0, by_status: byStatus },
  };
}

async function getInvoices(a: Args): Promise<ToolResult> {
  let q = supabaseAdmin
    .from("invoices")
    .select(
      "id, invoice_number, customer_id, job_id, total, amount_paid, status, due_date, paid_at, sent_at, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const status = str(a.status);
  if (status) q = q.eq("status", status);
  const since = str(a.since);
  if (since) q = q.gte("created_at", `${since}T00:00:00Z`);

  const { data, error } = await q;
  if (error) return { error: error.message };

  // Every figure below is added up here, in code. The model is never asked to
  // total a column — that is precisely where a confident wrong number comes from.
  const rows = data ?? [];
  const today = houstonToday();
  let billed = 0;
  let collected = 0;
  let outstanding = 0;
  let overdueCount = 0;
  let overdueAmount = 0;

  for (const r of rows) {
    const total = Number(r.total ?? 0);
    const paid = Number(r.amount_paid ?? 0);
    billed += total;
    collected += paid;
    const open = Math.max(total - paid, 0);
    if (r.status !== "paid" && r.status !== "void") {
      outstanding += open;
      if (r.due_date && r.due_date < today && open > 0) {
        overdueCount++;
        overdueAmount += open;
      }
    }
  }

  return {
    invoices: rows.map((r) => ({
      ...r,
      balance: Math.max(Number(r.total ?? 0) - Number(r.amount_paid ?? 0), 0),
      is_overdue: !!(r.due_date && r.due_date < today && r.status !== "paid"),
    })),
    summary: {
      invoice_count: rows.length,
      total_billed: billed,
      total_billed_formatted: usd(billed),
      total_collected: collected,
      total_collected_formatted: usd(collected),
      outstanding,
      outstanding_formatted: usd(outstanding),
      overdue_count: overdueCount,
      overdue_amount_formatted: usd(overdueAmount),
      note: "All totals computed from the invoice rows above, not estimated.",
    },
  };
}

async function getInspections(a: Args): Promise<ToolResult> {
  let q = supabaseAdmin
    .from("inspections")
    .select(
      "id, inspection_number, customer_name, site_address, site_city, inspection_type, status, scheduled_date, passed, pass_with_deficiencies, nfpa72_form, created_at"
    )
    .order("scheduled_date", { ascending: false, nullsFirst: false })
    .limit(50);

  const status = str(a.status);
  if (status) q = q.eq("status", status);
  if (a.missing_report === true) q = q.is("nfpa72_form", null);

  const { data, error } = await q;
  if (error) return { error: error.message };

  const rows = data ?? [];
  const today = houstonToday();

  return {
    // nfpa72_form is a large document; the model only needs to know whether
    // one exists, so the body never enters the context window.
    inspections: rows.map(({ nfpa72_form, ...r }) => ({
      ...r,
      has_nfpa72_report: !!nfpa72_form,
      report_url: `/admin/inspections/${r.id}/nfpa72`,
      is_overdue: !!(r.scheduled_date && r.scheduled_date < today && r.status === "scheduled"),
    })),
    summary: {
      returned: rows.length,
      missing_reports: rows.filter((r) => !r.nfpa72_form).length,
      overdue: rows.filter((r) => r.scheduled_date && r.scheduled_date < today && r.status === "scheduled")
        .length,
    },
  };
}

async function getCustomers(a: Args): Promise<ToolResult> {
  let q = supabaseAdmin
    .from("customers")
    .select("id, name, company, email, phone, city, state, status, created_at")
    .order("name")
    .limit(num(a.limit, 25));

  const search = str(a.search);
  if (search) {
    const s = `%${search}%`;
    q = q.or(`name.ilike.${s},company.ilike.${s},email.ilike.${s},phone.ilike.${s}`);
  }

  const { data, error } = await q;
  if (error) return { error: error.message };

  const { count } = await supabaseAdmin
    .from("customers")
    .select("*", { count: "exact", head: true });

  return {
    customers: data ?? [],
    summary: { returned: data?.length ?? 0, total_customers: count ?? 0 },
  };
}

async function getTeam(a: Args): Promise<ToolResult> {
  // Explicit column list — a `select("*")` here would put password_hash and
  // invite tokens into a model prompt.
  let q = supabaseAdmin
    .from("admin_users")
    .select("id, name, email, phone, role, is_active, last_login, invite_accepted_at")
    .order("name");

  const role = str(a.role);
  if (role) q = q.eq("role", role);

  const { data, error } = await q;
  if (error) return { error: error.message };

  // Hours from the last 7 days, summed here rather than by the model.
  const since = new Date(Date.now() - 7 * DAY).toISOString();
  const { data: entries } = await supabaseAdmin
    .from("time_entries")
    .select("employee_id, employee_name, minutes, clock_in, clock_out")
    .gte("clock_in", since);

  const minutesById: Record<string, number> = {};
  const onClock: string[] = [];
  for (const e of entries ?? []) {
    if (e.employee_id) minutesById[e.employee_id] = (minutesById[e.employee_id] ?? 0) + (e.minutes ?? 0);
    if (!e.clock_out && e.employee_name) onClock.push(e.employee_name);
  }

  return {
    team: (data ?? []).map((u) => ({
      ...u,
      hours_last_7_days: Math.round(((minutesById[u.id] ?? 0) / 60) * 10) / 10,
      pending_invite: !u.invite_accepted_at && !u.last_login,
    })),
    summary: {
      total: data?.length ?? 0,
      active: (data ?? []).filter((u) => u.is_active).length,
      currently_clocked_in: onClock,
    },
  };
}

const EXECUTORS: Record<string, (a: Args) => Promise<ToolResult>> = {
  get_leads: getLeads,
  get_schedule: getSchedule,
  get_jobs: getJobs,
  get_invoices: getInvoices,
  get_inspections: getInspections,
  get_customers: getCustomers,
  get_team: getTeam,
};

export async function runAssistantTool(name: string, args: Args): Promise<ToolResult> {
  const fn = EXECUTORS[name];
  if (!fn) return { error: `Unknown tool: ${name}` };
  try {
    return await fn(args ?? {});
  } catch (e) {
    console.error(`[assistant] tool ${name} failed:`, e);
    return { error: e instanceof Error ? e.message : "Tool failed" };
  }
}

export const ASSISTANT_SYSTEM_PROMPT = `You are the admin assistant for Chatman Security & Fire, a commercial fire protection contractor in Houston, Texas. Howard Chatman is the owner. The business does fire alarm, fire sprinkler, underground fire line, and life safety work.

Today is ${"{{TODAY}}"} (America/Chicago).

HOW YOU WORK
- Answer from tool results only. You have read-only access to the real database.
- If you have not called a tool, you do not know the answer. Call one.
- Never invent a customer, lead, job, technician, dollar figure, or date. If a tool returns nothing, say plainly that there is nothing there — an empty result is a real and useful answer.
- Tool results include a "summary" block with counts and totals already computed. Quote those figures. Do not add, subtract, or re-total anything yourself; if you need a number that is not in a summary, say what you can see instead of computing it.
- This business is early in putting its data into the system. Small numbers are expected and are not an error. Do not pad a thin answer to make it look fuller.

STYLE
- Brief and direct. Howard is running a business, not reading a report.
- You are rendering into a narrow chat panel about 400px wide. Use **bold**, bullet lists, and short headings. Never use markdown tables — they do not fit and will render as garbage. A bulleted list with the name in bold and the details after it reads better anyway.
- Lead with the answer, then the detail. No preamble.
- Include phone numbers when the answer is "call these people" — that is the point of asking.
- When something looks like it needs action — a lead going cold, an overdue invoice, an inspection with no report filed — say so in one line.

LINKING
Link to admin pages as markdown links. These are the only paths that exist; do not invent others, and do not guess a plural or a synonym:
/admin/dashboard, /admin/leads, /admin/pipeline, /admin/customers, /admin/quotes, /admin/proposals,
/admin/jobs, /admin/projects, /admin/work-orders, /admin/scheduling, /admin/inspections,
/admin/inspections-due, /admin/invoices, /admin/payments, /admin/tickets, /admin/employees,
/admin/team, /admin/time, /admin/inventory, /admin/reports, /admin/careers, /admin/settings
An individual inspection's NFPA 72 report is at /admin/inspections/{id}/nfpa72 — the tool gives you the id.
If no page fits, leave the link out rather than guessing a URL.

LIMITS
- You cannot send texts or emails, create records, or change anything. You read. If asked to do something, say which page to do it on.`;
