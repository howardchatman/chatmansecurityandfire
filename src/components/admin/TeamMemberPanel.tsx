"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Loader2,
  Save,
  Briefcase,
  Ticket as TicketIcon,
  Plus,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

// Side panel for one team member: edit their details, see the work assigned to
// them, and assign more. "Jobs" covers work orders and projects too — all three
// screens read the same jobs list; tickets are service requests that haven't
// necessarily become a job yet.

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: "admin" | "manager" | "technician" | "inspector" | "customer";
  team_id?: string | null;
  is_active: boolean;
}

interface Team { id: string; name: string }

interface Job {
  id: string;
  job_number: string;
  customer_name: string;
  job_type: string;
  status: string;
  scheduled_date?: string | null;
  site_city?: string | null;
  assignments?: { user_id?: string; user?: { id: string; full_name: string } | null }[];
}

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  customer_name: string;
  status: string;
  priority: string;
  assigned_to?: string | null;
  [key: string]: unknown;
}

const CLOSED_JOB = ["completed", "invoiced", "paid", "closed", "cancelled"];
const CLOSED_TICKET = ["resolved", "closed"];
const ROLES: TeamMember["role"][] = ["admin", "manager", "technician", "inspector", "customer"];

const label = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const day = (d?: string | null) =>
  d ? new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "unscheduled";

export default function TeamMemberPanel({
  member,
  teams,
  onClose,
  onSaved,
}: {
  member: TeamMember;
  teams: Team[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: member.full_name || "",
    phone: member.phone || "",
    role: member.role,
    team_id: member.team_id || "",
    is_active: member.is_active,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingWork, setLoadingWork] = useState(true);
  const [jobPick, setJobPick] = useState("");
  const [ticketPick, setTicketPick] = useState("");
  const [busy, setBusy] = useState(false);

  const canTakeWork = member.role !== "customer";

  const loadWork = useCallback(async () => {
    if (!canTakeWork) return setLoadingWork(false);
    setLoadingWork(true);
    try {
      const [j, t] = await Promise.all([
        fetch("/api/jobs").then((r) => r.json()).catch(() => null),
        fetch("/api/tickets?status=all").then((r) => r.json()).catch(() => null),
      ]);
      setJobs(j?.data || []);
      setTickets(t?.data || []);
    } finally {
      setLoadingWork(false);
    }
  }, [canTakeWork]);

  useEffect(() => {
    loadWork();
  }, [loadWork]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isMine = (j: Job) => (j.assignments || []).some((a) => a.user_id === member.id || a.user?.id === member.id);
  const myJobs = jobs.filter((j) => isMine(j) && !CLOSED_JOB.includes(j.status));
  const openJobs = jobs.filter((j) => !isMine(j) && !CLOSED_JOB.includes(j.status));
  const myTickets = tickets.filter((t) => t.assigned_to === member.id && !CLOSED_TICKET.includes(t.status));
  const openTickets = tickets.filter((t) => t.assigned_to !== member.id && !CLOSED_TICKET.includes(t.status));

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: member.id,
          name: form.name.trim(),
          phone: form.phone.trim(),
          role: form.role,
          team_id: form.team_id || null,
          is_active: form.is_active,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error || "Couldn't save.");
      setMessage({ ok: true, text: "Saved." });
      onSaved();
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Couldn't save." });
    } finally {
      setSaving(false);
    }
  };

  const run = async (fn: () => Promise<Response>, okText: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fn();
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.success === false) throw new Error(json?.error || "That didn't work.");
      setMessage({ ok: true, text: okText });
      await loadWork();
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "That didn't work." });
    } finally {
      setBusy(false);
    }
  };

  const assignJob = () => {
    const job = jobs.find((j) => j.id === jobPick);
    if (!job) return;
    run(
      () =>
        fetch(`/api/jobs/${job.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "assign_user",
            user_id: member.id,
            role: member.role === "inspector" ? "inspector" : "technician",
          }),
        }),
      `Assigned ${job.job_number} to ${form.name || member.email}.`
    ).then(() => setJobPick(""));
  };

  const unassignJob = (job: Job) =>
    run(
      () =>
        fetch(`/api/jobs/${job.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "remove_assignment", user_id: member.id }),
        }),
      `Removed from ${job.job_number}.`
    );

  // The ticket update replaces every field, so send the whole ticket back.
  const putTicket = (t: Ticket, assigned_to: string | null, status: string) => {
    const { assignee: _a, ...rest } = t as Ticket & { assignee?: unknown };
    return fetch(`/api/tickets/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...rest, assigned_to, status }),
    });
  };

  const assignTicket = () => {
    const t = tickets.find((x) => x.id === ticketPick);
    if (!t) return;
    run(
      () => putTicket(t, member.id, t.status === "open" ? "assigned" : t.status),
      `Assigned ticket ${t.ticket_number} to ${form.name || member.email}.`
    ).then(() => setTicketPick(""));
  };

  const unassignTicket = (t: Ticket) =>
    run(() => putTicket(t, null, t.status === "assigned" ? "open" : t.status), `Unassigned ticket ${t.ticket_number}.`);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{member.full_name || member.email}</h2>
            <p className="text-xs text-gray-500 truncate">{member.email}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {message && (
            <div
              className={`flex items-start gap-2 text-sm rounded-lg px-3 py-2 ${
                message.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
              }`}
            >
              {message.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <AlertTriangle className="w-4 h-4 mt-0.5" />}
              {message.text}
            </div>
          )}

          {/* Details */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Details</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(346) 555-0100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as TeamMember["role"] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {label(r)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Team</label>
                <select
                  value={form.team_id}
                  onChange={(e) => setForm({ ...form, team_id: e.target.value })}
                  disabled={!canTakeWork}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                >
                  <option value="">Unassigned</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 accent-orange-600"
              />
              Active (can sign in)
            </label>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save details
            </button>
          </section>

          {canTakeWork && (
            <>
              {/* Jobs (work orders & projects) */}
              <section className="space-y-3 border-t border-gray-100 pt-5">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-orange-600" />
                  Jobs, work orders &amp; projects
                </h3>
                {loadingWork ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                ) : (
                  <>
                    {myJobs.length === 0 ? (
                      <p className="text-sm text-gray-500">Nothing assigned.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {myJobs.map((j) => (
                          <li key={j.id} className="flex items-center justify-between gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2">
                            <Link href={`/admin/jobs/${j.id}`} className="min-w-0 hover:text-orange-600">
                              <span className="font-medium">{j.job_number}</span>{" "}
                              <span className="text-gray-600">
                                · {j.customer_name} · {label(j.job_type)} · {day(j.scheduled_date)}
                              </span>
                            </Link>
                            <button
                              onClick={() => unassignJob(j)}
                              disabled={busy}
                              className="text-xs text-red-600 hover:underline flex-shrink-0"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex gap-2">
                      <select
                        value={jobPick}
                        onChange={(e) => setJobPick(e.target.value)}
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">Assign a job…</option>
                        {openJobs.map((j) => (
                          <option key={j.id} value={j.id}>
                            {j.job_number} · {j.customer_name} · {label(j.job_type)} · {day(j.scheduled_date)}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={assignJob}
                        disabled={!jobPick || busy}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-[#0D1B2A] text-white rounded-lg text-sm disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" /> Assign
                      </button>
                    </div>
                    {openJobs.length === 0 && (
                      <p className="text-xs text-gray-500">
                        No open jobs to assign.{" "}
                        <Link href="/admin/jobs" className="text-orange-600 hover:underline">
                          Create a job
                        </Link>
                      </p>
                    )}
                  </>
                )}
              </section>

              {/* Tickets */}
              <section className="space-y-3 border-t border-gray-100 pt-5">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <TicketIcon className="w-4 h-4 text-orange-600" />
                  Service tickets
                </h3>
                {loadingWork ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                ) : (
                  <>
                    {myTickets.length === 0 ? (
                      <p className="text-sm text-gray-500">Nothing assigned.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {myTickets.map((t) => (
                          <li key={t.id} className="flex items-center justify-between gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2">
                            <Link href={`/admin/tickets?id=${t.id}`} className="min-w-0 hover:text-orange-600">
                              <span className="font-medium">{t.ticket_number}</span>{" "}
                              <span className="text-gray-600">
                                · {t.title} · {t.customer_name}
                              </span>
                            </Link>
                            <button
                              onClick={() => unassignTicket(t)}
                              disabled={busy}
                              className="text-xs text-red-600 hover:underline flex-shrink-0"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex gap-2">
                      <select
                        value={ticketPick}
                        onChange={(e) => setTicketPick(e.target.value)}
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">Assign a ticket…</option>
                        {openTickets.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.ticket_number} · {t.title} · {t.customer_name}
                            {t.assigned_to ? " (reassign)" : ""}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={assignTicket}
                        disabled={!ticketPick || busy}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-[#0D1B2A] text-white rounded-lg text-sm disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" /> Assign
                      </button>
                    </div>
                    {openTickets.length === 0 && (
                      <p className="text-xs text-gray-500">
                        No open tickets.{" "}
                        <Link href="/admin/tickets" className="text-orange-600 hover:underline inline-flex items-center gap-0.5">
                          Tickets <ExternalLink className="w-3 h-3" />
                        </Link>
                      </p>
                    )}
                  </>
                )}
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
