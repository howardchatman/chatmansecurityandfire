import { supabaseAdmin } from "@/lib/supabase";
import { syncProjectDateEvent } from "@/lib/google-calendar";
import { likeExact } from "@/lib/customer";
import { emailHeader, sendEmail } from "@/lib/email";
import { formatJobDates, houstonToday, runsOn, spanOf } from "@/lib/job-dates";

// Project tracking for long jobs (weeks or months): milestones, payment draws,
// a daily crew log, and percent complete. Tables come from
// supabase/migrations/20261014b_project_tracking.sql.

export interface Milestone {
  id: string;
  job_id: string;
  title: string;
  target_date: string | null;
  done: boolean;
  done_at: string | null;
  sort: number;
  google_event_id: string | null;
}

export interface Draw {
  id: string;
  job_id: string;
  label: string;
  amount: number;
  due_date: string | null;
  status: "planned" | "invoiced" | "paid";
  invoice_id: string | null;
  google_event_id: string | null;
  sort: number;
  invoice?: { id: string; invoice_number: string | null; status: string; total: number; amount_paid: number | null } | null;
}

export interface DailyLog {
  id: string;
  job_id: string;
  log_date: string;
  user_id: string | null;
  worker_name: string;
  hours: number;
  notes: string | null;
}

export interface ProjectJob {
  id: string;
  job_number: string | null;
  job_type: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_id: string | null;
  site_address: string | null;
  site_city: string | null;
  site_state: string | null;
  site_zip: string | null;
  description: string | null;
  scheduled_time_start: string | null;
  scheduled_time_end: string | null;
  owner_updates_daily: boolean;
  update_cc: string | null;
  /** Prime contractor when we're the sub (e.g. Alarmmasters). */
  prime_contractor: string | null;
  /** Who receives updates: the owner, or the prime's project manager. */
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  scheduled_date: string | null;
  scheduled_end_date: string | null;
  estimated_duration_hours: number | null;
  percent_complete: number;
  contract_value: number | null;
  status: string;
}

/** Thrown when the tracking tables don't exist yet. */
export class ProjectTrackingNotInstalled extends Error {
  constructor() {
    super(
      "Project tracking needs one database update: run supabase/migrations/20261014b_project_tracking.sql in Supabase (after 20261014_multi_day_jobs.sql)."
    );
  }
}

const MISSING = /project_(milestones|draws|daily_logs|updates)|percent_complete|contract_value|customer_id|scheduled_end_date|owner_updates_daily|update_cc|prime_contractor|contact_(name|email|phone)|does not exist|schema cache/i;

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) {
    if (MISSING.test(res.error.message)) throw new ProjectTrackingNotInstalled();
    throw new Error(res.error.message);
  }
  return res.data;
}

const JOB_COLS =
  "id, job_number, job_type, customer_name, customer_email, customer_phone, customer_id, site_address, site_city, site_state, site_zip, description, scheduled_date, scheduled_end_date, scheduled_time_start, scheduled_time_end, estimated_duration_hours, percent_complete, contract_value, status, owner_updates_daily, update_cc, prime_contractor, contact_name, contact_email, contact_phone";

export async function loadProject(jobId: string) {
  const [job, milestones, draws, logs, updates] = await Promise.all([
    supabaseAdmin.from("jobs").select(JOB_COLS).eq("id", jobId).maybeSingle().then(check),
    supabaseAdmin.from("project_milestones").select("*").eq("job_id", jobId).order("sort").order("target_date").then(check),
    supabaseAdmin
      .from("project_draws")
      .select("*, invoice:invoices(id, invoice_number, status, total, amount_paid)")
      .eq("job_id", jobId)
      .order("sort")
      .order("due_date")
      .then(check),
    supabaseAdmin
      .from("project_daily_logs")
      .select("*")
      .eq("job_id", jobId)
      .order("log_date", { ascending: false })
      .order("worker_name")
      .then(check),
    supabaseAdmin
      .from("project_updates")
      .select("id, sent_at, update_date, recipients, subject, kind")
      .eq("job_id", jobId)
      .order("sent_at", { ascending: false })
      .limit(20)
      .then(check),
  ]);
  if (!job) return null;

  // A draw is paid when its invoice is paid; read it from the invoice so the
  // two can't disagree.
  const drawList = ((draws || []) as Draw[]).map((d) => ({
    ...d,
    amount: Number(d.amount) || 0,
    status: d.invoice?.status === "paid" ? ("paid" as const) : d.invoice_id ? ("invoiced" as const) : d.status,
  }));
  const logList = ((logs || []) as DailyLog[]).map((l) => ({ ...l, hours: Number(l.hours) || 0 }));

  const contract = Number((job as ProjectJob).contract_value) || 0;
  const drawn = drawList.filter((d) => d.status !== "planned").reduce((s, d) => s + d.amount, 0);
  const paid = drawList.filter((d) => d.status === "paid").reduce((s, d) => s + d.amount, 0);
  const hoursLogged = logList.reduce((s, l) => s + l.hours, 0);

  return {
    job: job as ProjectJob,
    milestones: (milestones || []) as Milestone[],
    draws: drawList,
    logs: logList,
    updates: (updates || []) as { id: string; sent_at: string; update_date: string; recipients: string; subject: string; kind: string }[],
    totals: {
      contract,
      scheduled_draws: drawList.reduce((s, d) => s + d.amount, 0),
      invoiced: drawn,
      paid,
      hours_logged: Math.round(hoursLogged * 100) / 100,
      hours_estimated: Number((job as ProjectJob).estimated_duration_hours) || 0,
    },
  };
}

// ---- dates -------------------------------------------------------------

function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
}

/** Standard checkpoints for a fire alarm / life-safety install, as fractions of the project. */
export const MILESTONE_TEMPLATE: { title: string; at: number }[] = [
  { title: "Permit and plans approved", at: 0 },
  { title: "Rough-in / wire pull complete", at: 0.3 },
  { title: "Devices and panel installed", at: 0.6 },
  { title: "Panel programmed and pre-tested", at: 0.75 },
  { title: "Fire marshal acceptance test", at: 0.9 },
  { title: "Closeout: as-builts, O&M manuals, training", at: 1 },
];

/** Template milestones spread across the job's start..end dates. */
export function templateMilestones(start: string | null, end: string | null) {
  const span = start && end ? Math.max(0, daysBetween(start, end)) : 0;
  return MILESTONE_TEMPLATE.map((m, i) => ({
    title: m.title,
    target_date: start ? addDays(start, Math.round(span * m.at)) : null,
    sort: i,
  }));
}

/** Split an amount into `count` draws due every `everyDays` from `start`. */
export function splitDraws(total: number, count: number, start: string, everyDays: number) {
  const cents = Math.round(total * 100);
  const base = Math.floor(cents / count);
  return Array.from({ length: count }, (_, i) => ({
    label: `Draw ${i + 1} of ${count}`,
    // The last draw absorbs the rounding so the draws add up exactly.
    amount: (i === count - 1 ? cents - base * (count - 1) : base) / 100,
    due_date: addDays(start, everyDays * (i + 1)),
    sort: i,
  }));
}

// ---- calendar ----------------------------------------------------------

const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

function projectName(job: ProjectJob) {
  return job.customer_name || job.job_number || "Project";
}

export async function syncMilestoneToCalendar(m: Milestone, job: ProjectJob) {
  const id = await syncProjectDateEvent({
    summary: `${m.done ? "✓ " : ""}Milestone: ${m.title} — ${projectName(job)}`,
    date: m.target_date,
    description: [job.job_number && `Job ${job.job_number}`, m.done ? "Done" : "Target date"].filter(Boolean).join("\n"),
    location: [job.site_address, job.site_city].filter(Boolean).join(", ") || undefined,
    google_event_id: m.google_event_id,
  });
  if (id !== m.google_event_id) {
    await supabaseAdmin.from("project_milestones").update({ google_event_id: id }).eq("id", m.id);
  }
}

export async function syncDrawToCalendar(d: Draw, job: ProjectJob) {
  const state = d.status === "paid" ? "Paid: " : d.status === "invoiced" ? "Invoiced: " : "Invoice ";
  const id = await syncProjectDateEvent({
    summary: `${state}${d.label} (${money(d.amount)}) — ${projectName(job)}`,
    date: d.due_date,
    description: [job.job_number && `Job ${job.job_number}`, "Payment draw"].filter(Boolean).join("\n"),
    google_event_id: d.google_event_id,
  });
  if (id !== d.google_event_id) {
    await supabaseAdmin.from("project_draws").update({ google_event_id: id }).eq("id", d.id);
  }
}

// ---- invoicing a draw ---------------------------------------------------

/** The customer record to bill: the job's link, else an exact email match. */
export async function resolveCustomerId(job: ProjectJob): Promise<string | null> {
  if (job.customer_id) return job.customer_id;
  if (job.customer_email) {
    const { data } = await supabaseAdmin
      .from("customers")
      .select("id")
      .ilike("email", likeExact(job.customer_email))
      .limit(1)
      .maybeSingle();
    if (data?.id) return data.id;
  }
  return null;
}

/** Create a draft invoice for one draw and link it. Returns the invoice id. */
export async function invoiceDraw(draw: Draw, job: ProjectJob, createdBy: string | null): Promise<string> {
  if (draw.invoice_id) return draw.invoice_id;
  const customerId = await resolveCustomerId(job);
  if (!customerId) {
    throw new Error("Pick this project's customer first (Customer, at the top of the tracker), then invoice the draw.");
  }
  const amount = Math.round(draw.amount * 100) / 100;
  const { data: invoice, error } = await supabaseAdmin
    .from("invoices")
    .insert({
      customer_id: customerId,
      job_id: job.id,
      subtotal: amount,
      // Progress draws bill the agreed amount as-is; add tax on the invoice if it applies.
      tax_rate: 0,
      tax_amount: 0,
      total: amount,
      amount_paid: 0,
      status: "draft",
      due_date: draw.due_date,
      notes: `${draw.label} for ${projectName(job)}${job.job_number ? ` (job ${job.job_number})` : ""}`,
      created_by: createdBy,
    })
    .select("id")
    .single();
  if (error || !invoice) throw new Error(error?.message || "Couldn't create the invoice.");

  const { error: itemErr } = await supabaseAdmin.from("invoice_items").insert({
    invoice_id: invoice.id,
    description: `${draw.label} — ${projectName(job)}`,
    quantity: 1,
    unit_price: amount,
    total: amount,
    item_type: "service",
  });
  if (itemErr) console.error("Draw invoice line item failed:", itemErr);

  await supabaseAdmin.from("project_draws").update({ status: "invoiced", invoice_id: invoice.id }).eq("id", draw.id);
  return invoice.id;
}


// ---- owner updates -------------------------------------------------------

const esc = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Who gets project updates: the project contact, plus any CC addresses. On a
 * subcontract (prime_contractor set) the end customer's email is never used —
 * updates go to the prime's contact only.
 */
export function updateRecipients(job: ProjectJob): string[] {
  const primary = job.contact_email || (job.prime_contractor ? null : job.customer_email);
  const all = [primary, ...(job.update_cc || "").split(/[,;\s]+/)]
    .map((e) => (e || "").trim().toLowerCase())
    .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
  return Array.from(new Set(all));
}

const longDay = (day: string) =>
  new Date(`${day}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
const shortDay = (day: string) =>
  new Date(`${day}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/**
 * The daily update email for the project owner, built from the day's crew
 * log, progress, and milestones. Nothing here is invented: a section with no
 * data is left out.
 */
export function buildOwnerUpdate(
  project: NonNullable<Awaited<ReturnType<typeof loadProject>>>,
  opts: { day?: string; message?: string; includePayments?: boolean } = {}
) {
  const { job, milestones, draws, logs } = project;
  const day = opts.day || houstonToday();
  const name = (job.contact_name || (job.prime_contractor ? "" : job.customer_name) || "there").split(" ")[0] || "there";
  const project_name = job.customer_name || job.job_number || "the project";
  const todays = logs.filter((l) => l.log_date === day);
  const crew = todays.length;
  const hours = Math.round(todays.reduce((s, l) => s + l.hours, 0) * 10) / 10;
  const notes = todays.map((l) => (l.notes || "").trim()).filter(Boolean);
  const doneToday = milestones.filter((m) => m.done && m.done_at && m.done_at.slice(0, 10) === day);
  const next = milestones.filter((m) => !m.done).sort((a, b) => (a.target_date || "9999").localeCompare(b.target_date || "9999"))[0];
  const span = spanOf(job.scheduled_date, job.scheduled_end_date);
  const dayN = job.scheduled_date && span && runsOn(job, day) ? (spanOf(job.scheduled_date, day)?.days ?? null) : null;
  const pct = Math.max(0, Math.min(100, job.percent_complete || 0));
  const nextDraw = draws.filter((d) => d.status !== "paid" && d.due_date && d.due_date >= day)
    .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""))[0];

  const subject = `Project update: ${project_name} — ${shortDay(day)}`;

  const section = (title: string, inner: string) =>
    `<h3 style="color:#0D1B2A;font-size:16px;margin:24px 0 8px;">${title}</h3>${inner}`;
  const p = (t: string) => `<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 10px;">${t}</p>`;

  const parts: string[] = [];
  parts.push(p(`Hi ${esc(name)},`));
  if (opts.message?.trim()) {
    parts.push(p(esc(opts.message.trim()).replace(/\n/g, "<br/>")));
  } else {
    parts.push(p(`Here's where things stand on ${esc(project_name)} as of ${esc(longDay(day))}.`));
  }

  parts.push(
    section(
      "Progress",
      `<div style="background:#e5e7eb;border-radius:9999px;height:12px;overflow:hidden;margin:4px 0 6px;">
         <div style="background:#E85D04;height:12px;width:${pct}%;"></div>
       </div>` +
        p(
          `<strong>${pct}% complete</strong>` +
            (job.scheduled_date
              ? ` · Scheduled ${esc(formatJobDates(job.scheduled_date, job.scheduled_end_date))}${
                  dayN && span ? ` (day ${dayN} of ${span.days})` : ""
                }`
              : "")
        )
    )
  );

  if (crew || notes.length) {
    parts.push(
      section(
        "On site today",
        p(`${crew} crew member${crew === 1 ? "" : "s"} on site${hours ? `, ${hours} hours` : ""}.`) +
          (notes.length
            ? `<ul style="color:#374151;font-size:15px;line-height:1.6;padding-left:20px;margin:0 0 10px;">${notes
                .map((n) => `<li>${esc(n)}</li>`)
                .join("")}</ul>`
            : "")
      )
    );
  } else if (runsOn(job, day)) {
    parts.push(section("On site today", p("No crew time was logged for today.")));
  }

  if (doneToday.length || next) {
    parts.push(
      section(
        "Milestones",
        (doneToday.length
          ? `<ul style="color:#374151;font-size:15px;line-height:1.6;padding-left:20px;margin:0 0 10px;">${doneToday
              .map((m) => `<li>&#10003; ${esc(m.title)} — completed today</li>`)
              .join("")}</ul>`
          : "") +
          (next
            ? p(`Next up: <strong>${esc(next.title)}</strong>${next.target_date ? `, targeted for ${esc(longDay(next.target_date))}` : ""}.`)
            : "")
      )
    );
  }

  if (opts.includePayments && nextDraw) {
    parts.push(
      section(
        "Next payment",
        p(`${esc(nextDraw.label)}: ${esc(money(nextDraw.amount))}${nextDraw.due_date ? `, due ${esc(longDay(nextDraw.due_date))}` : ""}.`)
      )
    );
  }

  parts.push(
    p(`<br/>Questions? Reply to this email or call (346) 852-5540.`) +
      p(`Howard Chatman<br/>Chatman Security &amp; Fire`)
  );

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      ${emailHeader("Project Update")}
      <div style="padding: 28px 30px; background-color: #f9fafb;">${parts.join("")}</div>
      <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
        Chatman Security &amp; Fire | Houston, TX<br>(346) 852-5540 | info@chatmansecurityandfire.com
      </div>
    </div>`;

  return { subject, html, day, hasActivity: crew > 0 || notes.length > 0 || doneToday.length > 0 };
}

/** Send the update and record it. */
export async function sendOwnerUpdate(
  project: NonNullable<Awaited<ReturnType<typeof loadProject>>>,
  opts: { message?: string; includePayments?: boolean; kind: "manual" | "auto"; sentBy?: string | null; replyTo?: string | null }
) {
  const to = updateRecipients(project.job);
  if (!to.length) {
    throw new Error(
      project.job.prime_contractor
        ? `Add the ${project.job.prime_contractor} project contact's email first (Project details), then send.`
        : "Add the project contact's email first (Project details), then send."
    );
  }
  const built = buildOwnerUpdate(project, opts);
  const result = await sendEmail({
    to,
    subject: built.subject,
    html: built.html,
    replyTo: opts.replyTo || process.env.ADMIN_EMAIL || "howardchatman@icloud.com",
  });
  if (!result?.success) throw new Error("The email didn't go out. Try again in a minute.");
  await supabaseAdmin.from("project_updates").insert({
    job_id: project.job.id,
    update_date: built.day,
    recipients: to.join(", "),
    subject: built.subject,
    message: opts.message || null,
    body_html: built.html,
    kind: opts.kind,
    sent_by: opts.sentBy || null,
  });
  return { to, subject: built.subject };
}
