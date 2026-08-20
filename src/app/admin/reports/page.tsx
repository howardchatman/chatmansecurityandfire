"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Users,
  Briefcase,
  ClipboardCheck,
  Loader2,
  AlertTriangle,
  Clock,
} from "lucide-react";

// Reports, from the database. The page this replaces rendered $48,250 of
// monthly revenue, +12% growth, and technician leaderboards — all hardcoded,
// none of it true. Every number here arrives computed from /api/admin/reports;
// this file only lays them out. When the business is small the numbers are
// small, and that is the report.

interface ReportData {
  money: {
    billed: number;
    collected: number;
    collected_this_month: number;
    outstanding: number;
    overdue_count: number;
    overdue_amount: number;
    invoice_count: number;
    monthly: { key: string; label: string; billed: number }[];
  };
  jobs: { total: number; open: number; by_status: Record<string, number> };
  leads: {
    total: number;
    by_status: Record<string, number>;
    by_source: Record<string, number>;
    weekly_intake: { label: string; count: number }[];
  };
  customers: { total: number };
  inspections: { total: number; missing_report: number; overdue: number };
  crew_hours_30d: { name: string; hours: number }[];
}

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);

/** KPI tile — a number with its name, no invented trend arrows. */
function Stat({
  label,
  value,
  sub,
  icon: Icon,
  alert,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  alert?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
        <Icon className={`w-4 h-4 ${alert ? "text-orange-600" : "text-gray-300"}`} />
      </div>
      <p className={`mt-2 text-2xl font-bold ${alert ? "text-orange-700" : "text-gray-900"}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

/**
 * Single-series column chart in plain CSS. One hue per chart (sequential —
 * magnitude is the job), every bar value-labeled, 4px rounded top, bars grown
 * from a shared baseline. A same-height table lives in the DOM for screen
 * readers.
 */
function Columns({
  data,
  color,
  format,
  title,
}: {
  data: { label: string; value: number }[];
  color: string;
  format: (n: number) => string;
  title: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const allZero = data.every((d) => d.value === 0);
  return (
    <div>
      {allZero ? (
        <p className="text-sm text-gray-400 text-center py-10">Nothing in this window yet</p>
      ) : (
        <div className="flex items-end gap-2 h-40" role="img" aria-label={title}>
          {data.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center justify-end min-w-0 h-full">
              <span className="text-[10px] text-gray-600 font-medium mb-1">
                {d.value > 0 ? format(d.value) : ""}
              </span>
              <div
                className="w-full max-w-[24px] rounded-t-[4px]"
                style={{
                  background: color,
                  height: `${Math.max((d.value / max) * 100, d.value > 0 ? 4 : 0)}%`,
                  minHeight: d.value > 0 ? 4 : 0,
                }}
              />
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 mt-1.5 border-t border-gray-100 pt-1.5">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-[10px] text-gray-400 truncate">
            {d.label}
          </span>
        ))}
      </div>
      {/* screen-reader table */}
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <td>{d.label}</td>
              <td>{format(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Horizontal count list — for status/source breakdowns. */
function Breakdown({ counts, linkBase }: { counts: Record<string, number>; linkBase?: string }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, n]) => n), 1);
  if (!entries.length) return <p className="text-sm text-gray-400 py-4 text-center">None yet</p>;
  return (
    <ul className="space-y-2">
      {entries.map(([label, n]) => (
        <li key={label} className="flex items-center gap-3 text-sm">
          <span className="w-32 shrink-0 text-gray-600 capitalize truncate">
            {label.replace(/_/g, " ")}
          </span>
          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(n / max) * 100}%`, background: "#3F82C2" }}
            />
          </div>
          <span className="w-8 text-right font-semibold text-gray-900">{n}</span>
        </li>
      ))}
      {linkBase && (
        <li className="pt-1">
          <Link href={linkBase} className="text-xs text-orange-600 font-medium hover:underline">
            Open list →
          </Link>
        </li>
      )}
    </ul>
  );
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/reports");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not load reports");
        setData(json.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load reports");
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <AlertTriangle className="w-4 h-4 mt-0.5" /> {error}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex justify-center py-24 text-gray-300">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const m = data.money;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">
          Live from the database — every figure is computed, none are projections
        </p>
      </div>

      {/* money */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Collected"
          value={usd(m.collected)}
          sub={`${usd(m.collected_this_month)} this month · ${m.invoice_count} invoice${m.invoice_count === 1 ? "" : "s"}`}
          icon={DollarSign}
        />
        <Stat
          label="Outstanding"
          value={usd(m.outstanding)}
          sub={
            m.overdue_count > 0
              ? `${m.overdue_count} overdue totaling ${usd(m.overdue_amount)}`
              : "Nothing overdue"
          }
          icon={DollarSign}
          alert={m.overdue_count > 0}
        />
        <Stat
          label="Open Jobs"
          value={String(data.jobs.open)}
          sub={`${data.jobs.total} total on record`}
          icon={Briefcase}
        />
        <Stat
          label="Inspections"
          value={String(data.inspections.total)}
          sub={
            data.inspections.missing_report > 0
              ? `${data.inspections.missing_report} still need an NFPA 72 report`
              : "All reports filed"
          }
          icon={ClipboardCheck}
          alert={data.inspections.missing_report > 0 || data.inspections.overdue > 0}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Billed by month</h3>
          <Columns
            title="Invoices billed by month, last six months"
            data={m.monthly.map((x) => ({ label: x.label, value: x.billed }))}
            color="#C42332"
            format={usd}
          />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Lead intake by week</h3>
          <Columns
            title="New leads per week, last eight weeks"
            data={data.leads.weekly_intake.map((x) => ({ label: x.label, value: x.count }))}
            color="#3F82C2"
            format={(n) => String(n)}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">
            Leads by status <span className="text-gray-400 font-normal">({data.leads.total})</span>
          </h3>
          <Breakdown counts={data.leads.by_status} linkBase="/admin/leads" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Leads by source</h3>
          <Breakdown counts={data.leads.by_source} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">
            Jobs by status <span className="text-gray-400 font-normal">({data.jobs.total})</span>
          </h3>
          <Breakdown counts={data.jobs.by_status} linkBase="/admin/jobs" />
        </div>
      </div>

      {/* crew hours */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Crew hours — last 30 days</h3>
        </div>
        {data.crew_hours_30d.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No time clocked in the last 30 days
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.crew_hours_30d.map((c) => (
              <li key={c.name} className="py-2 flex justify-between text-sm">
                <span className="text-gray-700">{c.name}</span>
                <span className="font-semibold text-gray-900">{c.hours} hrs</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/admin/time" className="inline-block mt-3 text-xs text-orange-600 font-medium hover:underline">
          Time entries →
        </Link>
      </div>

      <p className="text-xs text-gray-400 flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5" />
        {data.customers.total} customers on record · figures computed server-side from invoices,
        jobs, leads, and time entries
      </p>
    </div>
  );
}
