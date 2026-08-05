"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Loader2,
  FileText,
  Calendar,
  Ticket,
  Wrench,
  ArrowRight,
  Phone,
} from "lucide-react";

interface Alert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  date: string | null;
  href: string;
}

const severityStyle: Record<string, { box: string; icon: string; label: string }> = {
  high: { box: "border-red-200 bg-red-50", icon: "text-red-600", label: "Action needed" },
  medium: { box: "border-amber-200 bg-amber-50", icon: "text-amber-600", label: "Coming up" },
  info: { box: "border-blue-200 bg-blue-50", icon: "text-blue-600", label: "For your info" },
};

const typeIcon: Record<string, typeof Bell> = {
  invoice: FileText,
  inspection: Calendar,
  request: Ticket,
  job: Wrench,
};

const formatDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "high", label: "Action needed" },
  { value: "medium", label: "Coming up" },
  { value: "info", label: "For your info" },
];

export default function PortalAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/portal/summary");
        const json = await res.json();
        if (json.success) setAlerts(json.data.alerts || []);
        else setError(json.error || "Couldn't load your alerts.");
      } catch {
        setError("Couldn't load your alerts. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const shown = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);
  const countBy = (s: string) => alerts.filter((a) => a.severity === s).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
        <p className="text-gray-600 mt-1">
          Anything on your account that needs attention — billing, inspections, and scheduled work
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const n = f.value === "all" ? alerts.length : countBy(f.value);
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === f.value
                  ? "bg-orange-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f.label} {n > 0 && <span className="opacity-70">({n})</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">{error}</p>
        </div>
      ) : shown.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="font-medium text-gray-900">
            {alerts.length === 0 ? "You're all caught up" : "Nothing in this category"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {alerts.length === 0
              ? "No overdue invoices, no upcoming inspections, and no open requests."
              : "Try a different filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((a) => {
            const s = severityStyle[a.severity] || severityStyle.info;
            const Icon = typeIcon[a.type] || Bell;
            return (
              <Link
                key={a.id}
                href={a.href}
                className={`block rounded-xl border p-5 hover:shadow-sm transition-shadow ${s.box}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/70 rounded-lg flex-shrink-0">
                    <Icon className={`w-5 h-5 ${s.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{a.title}</p>
                      <span className={`text-xs font-medium ${s.icon}`}>{s.label}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{a.message}</p>
                    {a.date && <p className="text-xs text-gray-500 mt-1">{formatDate(a.date)}</p>}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-2" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-600">
          Alerts here cover billing, scheduled work, and inspections. If a fire alarm is actively
          sounding, call us — don&apos;t wait on a notification.
        </p>
        <a
          href="tel:8328597009"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-sm flex-shrink-0"
        >
          <Phone className="w-4 h-4" /> (832) 859-7009
        </a>
      </div>
    </div>
  );
}
