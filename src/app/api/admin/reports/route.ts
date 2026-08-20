import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";

// Numbers for the Reports page, computed here in code — the page renders what
// this returns and does no arithmetic of its own. The page this replaces
// displayed $48,250 of invented revenue with a +12% trend; every figure below
// comes from a table, and when a table is thin the answer is a small number,
// not a flattering one.

const DAY = 86_400_000;

function houstonToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** "2026-08" for a timestamp, in Houston time. */
function monthKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
  }).format(new Date(iso));
}

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || !["admin", "manager"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [invoices, jobs, leads, customers, inspections, timeEntries] = await Promise.all([
    supabaseAdmin
      .from("invoices")
      .select("invoice_number, total, amount_paid, status, due_date, paid_at, created_at"),
    supabaseAdmin.from("jobs").select("status, total_amount, scheduled_date, created_at"),
    supabaseAdmin.from("leads").select("status, source, created_at"),
    supabaseAdmin.from("customers").select("status, created_at"),
    supabaseAdmin.from("inspections").select("status, scheduled_date, nfpa72_form"),
    supabaseAdmin
      .from("time_entries")
      .select("employee_name, minutes, clock_in, clock_out")
      .gte("clock_in", new Date(Date.now() - 30 * DAY).toISOString()),
  ]);

  const today = houstonToday();
  const thisMonth = today.slice(0, 7);

  // ── money ──────────────────────────────────────────────────────────────
  let billed = 0,
    collected = 0,
    collectedThisMonth = 0,
    outstanding = 0,
    overdueCount = 0,
    overdueAmount = 0;
  const monthlyBilled: Record<string, number> = {};

  for (const r of invoices.data ?? []) {
    const total = Number(r.total ?? 0);
    const paid = Number(r.amount_paid ?? 0);
    billed += total;
    collected += paid;
    if (r.paid_at && monthKey(r.paid_at) === thisMonth) collectedThisMonth += paid;
    if (r.created_at) {
      const k = monthKey(r.created_at);
      monthlyBilled[k] = (monthlyBilled[k] ?? 0) + total;
    }
    const open = Math.max(total - paid, 0);
    if (r.status !== "paid" && r.status !== "void") {
      outstanding += open;
      if (r.due_date && r.due_date < today && open > 0) {
        overdueCount++;
        overdueAmount += open;
      }
    }
  }

  // Last 6 calendar months, oldest first, zero-filled so the chart shows the
  // quiet months instead of skipping them.
  const months: { key: string; label: string; billed: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 15));
    const key = d.toISOString().slice(0, 7);
    months.push({
      key,
      label: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      billed: monthlyBilled[key] ?? 0,
    });
  }

  // ── jobs ───────────────────────────────────────────────────────────────
  const jobsByStatus: Record<string, number> = {};
  for (const j of jobs.data ?? []) {
    jobsByStatus[j.status ?? "unknown"] = (jobsByStatus[j.status ?? "unknown"] ?? 0) + 1;
  }
  const doneStatuses = ["completed", "invoiced", "paid", "cancelled"];
  const openJobs = (jobs.data ?? []).filter((j) => !doneStatuses.includes(j.status)).length;

  // ── leads ──────────────────────────────────────────────────────────────
  const leadsByStatus: Record<string, number> = {};
  const leadsBySource: Record<string, number> = {};
  const weeklyIntake: { label: string; count: number }[] = [];
  for (const l of leads.data ?? []) {
    leadsByStatus[l.status ?? "unknown"] = (leadsByStatus[l.status ?? "unknown"] ?? 0) + 1;
    leadsBySource[l.source ?? "unknown"] = (leadsBySource[l.source ?? "unknown"] ?? 0) + 1;
  }
  for (let w = 7; w >= 0; w--) {
    const start = Date.now() - (w + 1) * 7 * DAY;
    const end = Date.now() - w * 7 * DAY;
    const count = (leads.data ?? []).filter((l) => {
      const t = new Date(l.created_at).getTime();
      return t >= start && t < end;
    }).length;
    const d = new Date(end);
    weeklyIntake.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      count,
    });
  }

  // ── inspections ────────────────────────────────────────────────────────
  const insp = inspections.data ?? [];
  const inspectionsMissingReport = insp.filter(
    (i) => i.status !== "cancelled" && !i.nfpa72_form
  ).length;
  const inspectionsOverdue = insp.filter(
    (i) => i.status === "scheduled" && i.scheduled_date && i.scheduled_date < today
  ).length;

  // ── crew hours, last 30 days ───────────────────────────────────────────
  const hoursByEmployee: Record<string, number> = {};
  for (const t of timeEntries.data ?? []) {
    if (!t.employee_name) continue;
    hoursByEmployee[t.employee_name] =
      (hoursByEmployee[t.employee_name] ?? 0) + (t.minutes ?? 0) / 60;
  }
  const crewHours = Object.entries(hoursByEmployee)
    .map(([name, hours]) => ({ name, hours: Math.round(hours * 10) / 10 }))
    .sort((a, b) => b.hours - a.hours);

  return NextResponse.json({
    data: {
      generated_at: new Date().toISOString(),
      money: {
        billed,
        collected,
        collected_this_month: collectedThisMonth,
        outstanding,
        overdue_count: overdueCount,
        overdue_amount: overdueAmount,
        invoice_count: invoices.data?.length ?? 0,
        monthly: months,
      },
      jobs: { total: jobs.data?.length ?? 0, open: openJobs, by_status: jobsByStatus },
      leads: {
        total: leads.data?.length ?? 0,
        by_status: leadsByStatus,
        by_source: leadsBySource,
        weekly_intake: weeklyIntake,
      },
      customers: { total: customers.data?.length ?? 0 },
      inspections: {
        total: insp.length,
        missing_report: inspectionsMissingReport,
        overdue: inspectionsOverdue,
      },
      crew_hours_30d: crewHours,
    },
  });
}
