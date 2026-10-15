"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Save,
  Plus,
  Trash2,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  Flag,
  DollarSign,
  ClipboardList,
  Pencil,
  X,
  FileText,
  Building2,
} from "lucide-react";
import { formatJobDates, houstonToday, runsOn, spanOf } from "@/lib/job-dates";

// Project tracker for long jobs: profile, progress, owner updates, milestones,
// payment draws, and the daily crew log. Backed by /api/jobs/[id]/project.

interface Job {
  id: string;
  job_number: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_id: string | null;
  site_address: string | null;
  site_city: string | null;
  site_state: string | null;
  site_zip: string | null;
  description: string | null;
  scheduled_date: string | null;
  scheduled_end_date: string | null;
  scheduled_time_start: string | null;
  scheduled_time_end: string | null;
  estimated_duration_hours: number | null;
  percent_complete: number;
  contract_value: number | null;
  owner_updates_daily: boolean;
  update_cc: string | null;
  prime_contractor: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}
interface Milestone { id: string; title: string; target_date: string | null; done: boolean; done_at: string | null }
interface Draw {
  id: string;
  label: string;
  amount: number;
  due_date: string | null;
  status: "planned" | "invoiced" | "paid";
  invoice_id: string | null;
  invoice?: { invoice_number: string | null; status: string } | null;
}
interface Log { id: string; log_date: string; user_id: string | null; worker_name: string; hours: number; notes: string | null }
interface Update { id: string; sent_at: string; recipients: string; subject: string; kind: string }
interface Project {
  job: Job;
  milestones: Milestone[];
  draws: Draw[];
  logs: Log[];
  updates: Update[];
  totals: { contract: number; scheduled_draws: number; invoiced: number; paid: number; hours_logged: number; hours_estimated: number };
}
interface Option { id: string; label: string }

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
const shortDay = (d: string) =>
  new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const input = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500";
const card = "bg-white rounded-xl border border-gray-200 p-5";

export default function ProjectTracker({ jobId }: { jobId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notInstalled, setNotInstalled] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const [customers, setCustomers] = useState<Option[]>([]);
  const [staff, setStaff] = useState<Option[]>([]);

  const load = useCallback(async () => {
    if (!jobId || jobId === "undefined") {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/jobs/${jobId}/project`);
      const json = await res.json().catch(() => null);
      if (res.status === 409) {
        setNotInstalled(json?.error || "Project tracking isn't installed yet.");
        return;
      }
      if (!json?.success) throw new Error(json?.error || "Couldn't load the project.");
      setProject(json.data);
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Couldn't load the project." });
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    load();
    fetch("/api/customers")
      .then((r) => r.json())
      .then((d) =>
        setCustomers(
          ((d?.data || []) as { id: string; name: string; company?: string | null }[]).map((c) => ({
            id: c.id,
            label: c.company ? `${c.company} (${c.name})` : c.name,
          }))
        )
      )
      .catch(() => {});
    fetch("/api/admin/invite")
      .then((r) => r.json())
      .then((d) =>
        setStaff(
          ((d?.data || []) as { id: string; full_name: string; role: string; is_active: boolean }[])
            .filter((p) => p.role !== "customer" && p.is_active)
            .map((p) => ({ id: p.id, label: p.full_name }))
        )
      )
      .catch(() => {});
  }, [load]);

  /** POST an action; on success the fresh project replaces the old one. */
  const act = async (payload: Record<string, unknown>, okText?: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error || "That didn't work.");
      if (json.data?.job) setProject(json.data);
      if (okText) setMessage({ ok: true, text: okText });
      return json;
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "That didn't work." });
      return null;
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader2 className="w-6 h-6 animate-spin text-gray-300" />;
  if (notInstalled) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-900">
        <p className="font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> One setup step left
        </p>
        <p className="mt-1">{notInstalled}</p>
      </div>
    );
  }
  if (!project) return <p className="text-sm text-red-600">{message?.text || "Couldn't load the project."}</p>;

  return (
    <div className="space-y-5">
      {message && (
        <div
          className={`flex items-start gap-2 text-sm rounded-lg px-3 py-2 ${
            message.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          {message.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <AlertTriangle className="w-4 h-4 mt-0.5" />}
          <span className="flex-1">{message.text}</span>
          <button onClick={() => setMessage(null)} aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <Progress project={project} busy={busy} act={act} />
      <Profile project={project} customers={customers} busy={busy} act={act} />
      <OwnerUpdates project={project} jobId={jobId} busy={busy} act={act} />
      <Milestones project={project} busy={busy} act={act} />
      <Draws project={project} busy={busy} act={act} />
      <CrewLog project={project} staff={staff} busy={busy} act={act} />
    </div>
  );
}

type Act = (payload: Record<string, unknown>, okText?: string) => Promise<{ invoice_id?: string } | null>;

// ---------------------------------------------------------------- progress
function Progress({ project, busy, act }: { project: Project; busy: boolean; act: Act }) {
  const { job, totals } = project;
  const [pct, setPct] = useState(job.percent_complete || 0);
  useEffect(() => setPct(job.percent_complete || 0), [job.percent_complete]);
  const today = houstonToday();
  const span = spanOf(job.scheduled_date, job.scheduled_end_date);
  const dayN = job.scheduled_date && runsOn(job, today) ? spanOf(job.scheduled_date, today)?.days : null;

  return (
    <div className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="font-semibold text-gray-900">Progress</h3>
        <p className="text-sm text-gray-600">
          {formatJobDates(job.scheduled_date, job.scheduled_end_date)}
          {dayN && span ? ` · day ${dayN} of ${span.days}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          className="flex-1 accent-orange-600"
        />
        <span className="w-12 text-right font-semibold text-gray-900">{pct}%</span>
        <button
          onClick={() => act({ action: "update_job", updates: { percent_complete: pct } }, `Progress set to ${pct}%.`)}
          disabled={busy || pct === job.percent_complete}
          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm disabled:opacity-40"
        >
          Save
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">Shown to the customer in their portal and in owner updates.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
        <Stat label="Contract" value={totals.contract ? usd(totals.contract) : "—"} />
        <Stat label="Invoiced" value={usd(totals.invoiced)} />
        <Stat label="Paid" value={usd(totals.paid)} />
        <Stat
          label="Crew hours"
          value={`${totals.hours_logged}${totals.hours_estimated ? ` / ${totals.hours_estimated}` : ""}`}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------- profile
function Profile({ project, customers, busy, act }: { project: Project; customers: Option[]; busy: boolean; act: Act }) {
  const { job } = project;
  const blank = useMemo(
    () => ({
      customer_name: job.customer_name || "",
      site_address: job.site_address || "",
      site_city: job.site_city || "",
      site_state: job.site_state || "TX",
      site_zip: job.site_zip || "",
      prime_contractor: job.prime_contractor || "",
      customer_id: job.customer_id || "",
      contact_name: job.contact_name || "",
      contact_email: job.contact_email || "",
      contact_phone: job.contact_phone || "",
      customer_email: job.customer_email || "",
      customer_phone: job.customer_phone || "",
      update_cc: job.update_cc || "",
      scheduled_date: job.scheduled_date || "",
      scheduled_end_date: job.scheduled_end_date || "",
      scheduled_time_start: (job.scheduled_time_start || "").slice(0, 5),
      scheduled_time_end: (job.scheduled_time_end || "").slice(0, 5),
      estimated_duration_hours: job.estimated_duration_hours != null ? String(job.estimated_duration_hours) : "",
      contract_value: job.contract_value != null ? String(job.contract_value) : "",
      description: job.description || "",
    }),
    [job]
  );
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState(blank);
  useEffect(() => setF(blank), [blank]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });
  const billTo = customers.find((c) => c.id === job.customer_id)?.label;

  if (!editing) {
    return (
      <div className={card}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-600" /> Project details
          </h3>
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1 text-sm text-orange-600 hover:underline">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Row label="Site / end customer" value={job.customer_name} />
          <Row label="Address" value={[job.site_address, job.site_city, job.site_state, job.site_zip].filter(Boolean).join(", ")} />
          <Row label="Subcontracted through" value={job.prime_contractor || "Direct (we're the prime)"} />
          <Row label="Bill to" value={billTo || (job.customer_id ? "Linked customer" : "Not set")} warn={!job.customer_id} />
          <Row
            label="Project contact (gets updates)"
            value={[job.contact_name, job.contact_email, job.contact_phone].filter(Boolean).join(" · ")}
            warn={!job.contact_email && !(job.customer_email && !job.prime_contractor)}
          />
          <Row label="CC on updates" value={job.update_cc} />
          {!job.prime_contractor && <Row label="Owner email / phone" value={[job.customer_email, job.customer_phone].filter(Boolean).join(" · ")} />}
          <Row label="Contract value" value={job.contract_value != null ? usd(job.contract_value) : null} />
          <Row label="Est. total hours" value={job.estimated_duration_hours != null ? String(job.estimated_duration_hours) : null} />
          <Row
            label="Daily hours"
            value={job.scheduled_time_start ? `${job.scheduled_time_start.slice(0, 5)}–${(job.scheduled_time_end || "").slice(0, 5)}` : null}
          />
        </dl>
        {job.description && <p className="text-sm text-gray-600 mt-3 whitespace-pre-line">{job.description}</p>}
      </div>
    );
  }

  const save = async () => {
    const res = await act({ action: "update_job", updates: f }, "Project details saved.");
    if (res) setEditing(false);
  };

  return (
    <div className={card}>
      <h3 className="font-semibold text-gray-900 mb-4">Edit project details</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Site / end customer">
          <input className={input} value={f.customer_name} onChange={set("customer_name")} />
        </Field>
        <Field label="Subcontracted through (prime contractor)">
          <input className={input} value={f.prime_contractor} onChange={set("prime_contractor")} placeholder="Leave empty if we're the prime" />
        </Field>
        <Field label="Site address">
          <input className={input} value={f.site_address} onChange={set("site_address")} />
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="City"><input className={input} value={f.site_city} onChange={set("site_city")} /></Field>
          <Field label="State"><input className={input} value={f.site_state} onChange={set("site_state")} /></Field>
          <Field label="ZIP"><input className={input} value={f.site_zip} onChange={set("site_zip")} /></Field>
        </div>
        <Field label="Bill to (customer record for draw invoices)">
          <select className={input} value={f.customer_id} onChange={set("customer_id")}>
            <option value="">Not set</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Not listed? <Link href="/admin/customers" className="text-orange-600 hover:underline">Add the company</Link> first.
          </p>
        </Field>
        <Field label="Contract value ($)">
          <input className={input} type="number" min="0" step="0.01" value={f.contract_value} onChange={set("contract_value")} />
        </Field>
        <Field label="Project contact name (gets updates)">
          <input className={input} value={f.contact_name} onChange={set("contact_name")} placeholder="e.g. their project manager" />
        </Field>
        <Field label="Project contact email">
          <input className={input} type="email" value={f.contact_email} onChange={set("contact_email")} />
        </Field>
        <Field label="Project contact phone">
          <input className={input} value={f.contact_phone} onChange={set("contact_phone")} />
        </Field>
        <Field label="CC on updates (comma-separated emails)">
          <input className={input} value={f.update_cc} onChange={set("update_cc")} placeholder="e.g. install manager" />
        </Field>
        {!f.prime_contractor && (
          <>
            <Field label="Owner email"><input className={input} type="email" value={f.customer_email} onChange={set("customer_email")} /></Field>
            <Field label="Owner phone"><input className={input} value={f.customer_phone} onChange={set("customer_phone")} /></Field>
          </>
        )}
        <Field label="Start date"><input className={input} type="date" value={f.scheduled_date} onChange={set("scheduled_date")} /></Field>
        <Field label="End date"><input className={input} type="date" value={f.scheduled_end_date} min={f.scheduled_date || undefined} onChange={set("scheduled_end_date")} /></Field>
        <Field label="Daily start"><input className={input} type="time" value={f.scheduled_time_start} onChange={set("scheduled_time_start")} /></Field>
        <Field label="Daily end"><input className={input} type="time" value={f.scheduled_time_end} onChange={set("scheduled_time_end")} /></Field>
        <Field label="Est. total hours"><input className={input} type="number" min="0" step="0.5" value={f.estimated_duration_hours} onChange={set("estimated_duration_hours")} /></Field>
      </div>
      <Field label="Description / scope">
        <textarea className={input} rows={3} value={f.description} onChange={set("description")} />
      </Field>
      <div className="flex gap-2 mt-4">
        <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm disabled:opacity-50">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save details
        </button>
        <button onClick={() => { setF(blank); setEditing(false); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mt-1">
      <span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value, warn }: { label: string; value?: string | null; warn?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className={warn ? "text-amber-700" : "text-gray-900"}>{value || (warn ? "Not set" : "—")}</dd>
    </div>
  );
}

// ---------------------------------------------------------------- owner updates
function OwnerUpdates({ project, jobId, busy, act }: { project: Project; jobId: string; busy: boolean; act: Act }) {
  const { job, updates } = project;
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [includePayments, setIncludePayments] = useState(false);
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);
  const recipients = [job.contact_email || (job.prime_contractor ? null : job.customer_email), ...(job.update_cc || "").split(/[,;\s]+/)]
    .filter((e): e is string => !!e && e.includes("@"));

  const refreshPreview = useCallback(async () => {
    const res = await fetch(`/api/jobs/${jobId}/project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "preview_update", message: note, include_payments: includePayments }),
    });
    const json = await res.json().catch(() => null);
    if (json?.success) setPreview(json.data);
  }, [jobId, note, includePayments]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(refreshPreview, 400);
    return () => clearTimeout(t);
  }, [open, refreshPreview]);

  const send = async () => {
    const res = await act(
      { action: "send_update", message: note, include_payments: includePayments },
      `Update emailed to ${recipients.join(", ")}.`
    );
    if (res) {
      setOpen(false);
      setNote("");
    }
  };

  return (
    <div className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Mail className="w-4 h-4 text-orange-600" /> Updates to {job.prime_contractor || "the owner"}
        </h3>
        <button
          onClick={() => setOpen(true)}
          disabled={!recipients.length}
          title={recipients.length ? undefined : "Add the project contact's email in Project details"}
          className="inline-flex items-center gap-2 px-3 py-2 bg-[#0D1B2A] hover:bg-[#16293d] text-white rounded-lg text-sm disabled:opacity-40"
        >
          <Send className="w-4 h-4" /> Send today&apos;s update
        </button>
      </div>
      <p className="text-sm text-gray-600">
        {recipients.length ? (
          <>Goes to {recipients.join(", ")}.</>
        ) : (
          <span className="text-amber-700">Add the project contact&apos;s email in Project details to send updates.</span>
        )}
      </p>
      <label className="flex items-start gap-2 mt-3 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={job.owner_updates_daily}
          disabled={busy || !recipients.length}
          onChange={(e) =>
            act(
              { action: "update_job", updates: { owner_updates_daily: e.target.checked } },
              e.target.checked ? "Daily updates on: weekdays at 6 PM when the crew logs work." : "Daily updates off."
            )
          }
          className="mt-0.5 h-4 w-4 accent-orange-600"
        />
        <span>
          <strong>Send automatically every weekday at 6 PM</strong>, on days the crew logs work (skipped if you already sent
          one that day).
        </span>
      </label>
      {updates.length > 0 && (
        <ul className="mt-4 divide-y divide-gray-100 text-sm">
          {updates.slice(0, 8).map((u) => (
            <li key={u.id} className="py-2 flex flex-wrap justify-between gap-2">
              <span className="text-gray-800">{u.subject}</span>
              <span className="text-xs text-gray-500">
                {new Date(u.sent_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" })}
                {u.kind === "auto" ? " · automatic" : ""}
              </span>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="my-auto bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold text-gray-900">Send today&apos;s update</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 grid md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <p className="text-sm text-gray-600">To: {recipients.join(", ")}</p>
                <Field label="Your note (optional, shown at the top)">
                  <textarea
                    className={input}
                    rows={6}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Rough-in on the 2nd floor wrapped up early. We start devices Monday."
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={includePayments} onChange={(e) => setIncludePayments(e.target.checked)} className="h-4 w-4 accent-orange-600" />
                  Include the next payment draw
                </label>
                <p className="text-xs text-gray-500">
                  The progress bar, today&apos;s crew log, and milestones fill in automatically from this project.
                </p>
                <button onClick={send} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm disabled:opacity-50">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send update
                </button>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Preview{preview ? `: ${preview.subject}` : ""}</p>
                <iframe title="Update preview" className="w-full h-[460px] border border-gray-200 rounded-lg bg-white" srcDoc={preview?.html || ""} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- milestones
function Milestones({ project, busy, act }: { project: Project; busy: boolean; act: Act }) {
  const { milestones } = project;
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const done = milestones.filter((m) => m.done).length;

  return (
    <div className={card}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Flag className="w-4 h-4 text-orange-600" /> Milestones
          {milestones.length > 0 && <span className="text-xs font-normal text-gray-500">{done} of {milestones.length} done</span>}
        </h3>
        {milestones.length === 0 && (
          <button onClick={() => act({ action: "seed_milestones" }, "Added the standard milestones, spread across the project dates.")} disabled={busy} className="text-sm text-orange-600 hover:underline">
            Add standard install milestones
          </button>
        )}
      </div>
      <ul className="space-y-1.5">
        {milestones.map((m) => (
          <li key={m.id} className="flex items-center gap-3 text-sm border border-gray-100 rounded-lg px-3 py-2">
            <input
              type="checkbox"
              checked={m.done}
              disabled={busy}
              onChange={(e) => act({ action: "update_milestone", id: m.id, done: e.target.checked })}
              className="h-4 w-4 accent-orange-600"
            />
            <span className={`flex-1 ${m.done ? "line-through text-gray-400" : "text-gray-900"}`}>{m.title}</span>
            <input
              type="date"
              value={m.target_date || ""}
              disabled={busy}
              onChange={(e) => act({ action: "update_milestone", id: m.id, target_date: e.target.value })}
              className="px-2 py-1 border border-gray-200 rounded text-xs"
            />
            <button onClick={() => act({ action: "delete_milestone", id: m.id })} disabled={busy} aria-label="Delete milestone" className="text-gray-400 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2 mt-3">
        <input className={`${input} flex-1 min-w-[180px]`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a milestone" />
        <input className="px-3 py-2 border border-gray-300 rounded-lg text-sm" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button
          onClick={async () => {
            if (await act({ action: "add_milestone", title, target_date: date })) {
              setTitle("");
              setDate("");
            }
          }}
          disabled={busy || !title.trim()}
          className="inline-flex items-center gap-1 px-3 py-2 bg-[#0D1B2A] text-white rounded-lg text-sm disabled:opacity-40"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">Each dated milestone is on your Google Calendar.</p>
    </div>
  );
}

// ---------------------------------------------------------------- draws
function Draws({ project, busy, act }: { project: Project; busy: boolean; act: Act }) {
  const { draws, totals, job } = project;
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState("");
  const [count, setCount] = useState("8");
  const [every, setEvery] = useState("7");

  const badge = (s: Draw["status"]) =>
    s === "paid" ? "bg-green-100 text-green-700" : s === "invoiced" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600";

  return (
    <div className={card}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-orange-600" /> Payment draws
        </h3>
        {draws.length > 0 && (
          <p className="text-xs text-gray-500">
            Scheduled {usd(totals.scheduled_draws)}
            {totals.contract ? ` of ${usd(totals.contract)} contract` : ""}
            {totals.contract && Math.abs(totals.scheduled_draws - totals.contract) > 0.009 ? " (doesn't match)" : ""}
          </p>
        )}
      </div>

      {draws.length === 0 && (
        <div className="rounded-lg bg-gray-50 p-3 mb-3 text-sm">
          <p className="text-gray-700 mb-2">
            Split the {totals.contract ? usd(totals.contract) : "contract"} into equal draws starting {job.scheduled_date ? shortDay(job.scheduled_date) : "today"}:
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm" type="number" min="1" max="52" value={count} onChange={(e) => setCount(e.target.value)} />
            <span>draws, every</span>
            <select className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm" value={every} onChange={(e) => setEvery(e.target.value)}>
              <option value="7">week</option>
              <option value="14">2 weeks</option>
              <option value="30">month</option>
            </select>
            <button
              onClick={() => act({ action: "split_draws", count: Number(count), every_days: Number(every) }, "Draw schedule created.")}
              disabled={busy || !totals.contract}
              title={totals.contract ? undefined : "Set the contract value in Project details first"}
              className="px-3 py-1.5 bg-[#0D1B2A] text-white rounded-lg text-sm disabled:opacity-40"
            >
              Create draws
            </button>
          </div>
          {!totals.contract && <p className="text-xs text-amber-700 mt-2">Set the contract value in Project details first, or add draws one at a time below.</p>}
        </div>
      )}

      <ul className="space-y-1.5">
        {draws.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center gap-3 text-sm border border-gray-100 rounded-lg px-3 py-2">
            <span className="flex-1 min-w-[140px] text-gray-900">{d.label}</span>
            <span className="font-medium text-gray-900">{usd(d.amount)}</span>
            <span className="text-gray-500 text-xs w-24">{d.due_date ? shortDay(d.due_date) : "no date"}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${badge(d.status)}`}>{d.status}</span>
            {d.invoice_id ? (
              <Link href={`/admin/invoices/${d.invoice_id}`} className="inline-flex items-center gap-1 text-xs text-orange-600 hover:underline">
                <FileText className="w-3.5 h-3.5" /> {d.invoice?.invoice_number || "Invoice"}
              </Link>
            ) : (
              <>
                <button
                  onClick={async () => {
                    const res = await act({ action: "invoice_draw", id: d.id }, "Draft invoice created. Open it to review and send.");
                    if (res?.invoice_id) window.open(`/admin/invoices/${res.invoice_id}`, "_self");
                  }}
                  disabled={busy}
                  className="text-xs text-orange-600 hover:underline"
                >
                  Create invoice
                </button>
                <button onClick={() => act({ action: "delete_draw", id: d.id })} disabled={busy} aria-label="Delete draw" className="text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2 mt-3">
        <input className={`${input} flex-1 min-w-[140px]`} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Draw name, e.g. Mobilization" />
        <input className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
        <input className="px-3 py-2 border border-gray-300 rounded-lg text-sm" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        <button
          onClick={async () => {
            if (await act({ action: "add_draw", label, amount: Number(amount), due_date: due })) {
              setLabel("");
              setAmount("");
              setDue("");
            }
          }}
          disabled={busy || !label.trim() || !(Number(amount) > 0)}
          className="inline-flex items-center gap-1 px-3 py-2 bg-[#0D1B2A] text-white rounded-lg text-sm disabled:opacity-40"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Invoices bill the &quot;Bill to&quot; customer in Project details. A draw shows Paid once its invoice is paid. Due dates are on your Google Calendar.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- crew log
function CrewLog({ project, staff, busy, act }: { project: Project; staff: Option[]; busy: boolean; act: Act }) {
  const { logs } = project;
  const [day, setDay] = useState(houstonToday());
  const [who, setWho] = useState("");
  const [hours, setHours] = useState("8");
  const [notes, setNotes] = useState("");

  const byDay = useMemo(() => {
    const map = new Map<string, Log[]>();
    for (const l of logs) map.set(l.log_date, [...(map.get(l.log_date) || []), l]);
    return Array.from(map.entries());
  }, [logs]);

  return (
    <div className={card}>
      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
        <ClipboardList className="w-4 h-4 text-orange-600" /> Daily crew log
      </h3>
      <div className="grid sm:grid-cols-4 gap-2">
        <input className={input} type="date" value={day} onChange={(e) => setDay(e.target.value)} />
        <select className={input} value={who} onChange={(e) => setWho(e.target.value)}>
          <option value="">Who worked…</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <input className={input} type="number" min="0" max="24" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Hours" />
        <button
          onClick={async () => {
            if (await act({ action: "save_log", log_date: day, user_id: who, hours: Number(hours), notes }, "Logged.")) setNotes("");
          }}
          disabled={busy || !who}
          className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#0D1B2A] text-white rounded-lg text-sm disabled:opacity-40"
        >
          <Plus className="w-4 h-4" /> Log
        </button>
      </div>
      <textarea className={`${input} mt-2`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What got done (this goes into the daily update)" />
      <p className="text-xs text-gray-500 mt-1">Techs can log their own day from the job on their phone.</p>

      {byDay.length > 0 && (
        <div className="mt-4 space-y-3">
          {byDay.map(([d, entries]) => (
            <div key={d}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {shortDay(d)} · {Math.round(entries.reduce((s, l) => s + l.hours, 0) * 10) / 10} hrs
              </p>
              <ul className="mt-1 space-y-1">
                {entries.map((l) => (
                  <li key={l.id} className="flex items-start gap-3 text-sm">
                    <span className="w-36 flex-shrink-0 text-gray-900">{l.worker_name}</span>
                    <span className="w-12 flex-shrink-0 text-gray-600">{l.hours}h</span>
                    <span className="flex-1 text-gray-600">{l.notes || "—"}</span>
                    <button onClick={() => act({ action: "delete_log", id: l.id })} disabled={busy} aria-label="Delete entry" className="text-gray-400 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
