"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Phone,
  Mail,
  Loader2,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Building2,
  RefreshCw,
} from "lucide-react";
import {
  SYSTEM_TYPE_LABELS,
  FREQUENCY_LABELS,
  daysUntilDue,
} from "@/lib/customer-systems";

interface DueSystem {
  id: string;
  customer_id: string;
  system_type: string;
  description: string | null;
  location: string | null;
  quantity: number;
  last_inspection_date: string | null;
  inspection_frequency: string;
  next_inspection_due: string | null;
  monitored: boolean;
  monthly_rate: number | null;
  status: string;
  customer: { id: string; name: string; company: string | null; email: string; phone: string | null } | null;
}

const WINDOWS = [
  { value: "overdue", label: "Overdue", days: 0 },
  { value: "30", label: "Next 30 days", days: 30 },
  { value: "60", label: "Next 60 days", days: 60 },
  { value: "90", label: "Next 90 days", days: 90 },
];

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const fmt = (v: string | null) =>
  v ? new Date(v + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export default function InspectionsDuePage() {
  const [rows, setRows] = useState<DueSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [window, setWindow] = useState("90");
  const [marking, setMarking] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Always pull the 90-day set and narrow client-side, so switching the
      // window doesn't re-hit the server.
      const res = await fetch("/api/customer-systems?due_within_days=90");
      const data = await res.json();
      if (data.success) setRows(data.data || []);
    } catch {
      /* leave the list empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const inWindow = (r: DueSystem) => {
    const d = daysUntilDue(r.next_inspection_due);
    if (d === null) return false;
    if (window === "overdue") return d < 0;
    return d <= Number(window);
  };

  const shown = rows.filter(inWindow);
  const overdueCount = rows.filter((r) => (daysUntilDue(r.next_inspection_due) ?? 1) < 0).length;
  const rmr = rows
    .filter((r) => r.monitored && r.status !== "inactive")
    .reduce((s, r) => s + Number(r.monthly_rate || 0), 0);

  const markInspected = async (r: DueSystem) => {
    setMarking(r.id);
    setNotice("");
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch("/api/customer-systems", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id, last_inspection_date: today }),
      });
      const data = await res.json();
      if (data.success) {
        setNotice(
          `${SYSTEM_TYPE_LABELS[r.system_type]} for ${r.customer?.company || r.customer?.name} marked inspected — next due ${fmt(data.data?.next_inspection_due)}.`
        );
        load();
      } else {
        setNotice(data.error || "Couldn't update that system.");
      }
    } catch {
      setNotice("Couldn't update that system.");
    } finally {
      setMarking(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspections Due</h1>
          <p className="text-gray-500 mt-1">
            Every system coming due across all customers — your inspection pipeline
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            <span className="text-sm text-gray-500">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{overdueCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg"><CalendarClock className="w-5 h-5 text-amber-600" /></div>
            <span className="text-sm text-gray-500">Due in 90 days</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{rows.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
            <span className="text-sm text-gray-500">Monitored (of these)</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{money(rmr)}<span className="text-base font-medium text-gray-500">/mo</span></p>
        </div>
      </div>

      {notice && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">{notice}</div>
      )}

      {/* Window filter */}
      <div className="flex flex-wrap gap-2">
        {WINDOWS.map((w) => {
          const n = rows.filter((r) => {
            const d = daysUntilDue(r.next_inspection_due);
            if (d === null) return false;
            return w.value === "overdue" ? d < 0 : d <= w.days;
          }).length;
          return (
            <button
              key={w.value}
              onClick={() => setWindow(w.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                window === w.value ? "bg-orange-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {w.label} {n > 0 && <span className="opacity-70">({n})</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>
      ) : shown.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="font-medium text-gray-900">
            {rows.length === 0 ? "Nothing due in the next 90 days" : "Nothing in this window"}
          </p>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            {rows.length === 0
              ? "Inspection dates come from the Systems tab on each customer. Add their equipment and cycles and this list fills itself."
              : "Try a wider window."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Customer", "System", "Last Inspected", "Due", "Contact", ""].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === "" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shown.map((r) => {
                  const d = daysUntilDue(r.next_inspection_due);
                  const overdue = (d ?? 1) < 0;
                  return (
                    <tr key={r.id} className={`hover:bg-gray-50 ${overdue ? "bg-red-50/40" : ""}`}>
                      <td className="px-4 py-3">
                        <Link href={`/admin/customers/${r.customer_id}`} className="font-medium text-gray-900 hover:text-orange-600 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          {r.customer?.company || r.customer?.name || "Unknown"}
                        </Link>
                        {r.location && <p className="text-xs text-gray-500 mt-0.5">{r.location}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900">
                          {SYSTEM_TYPE_LABELS[r.system_type] || r.system_type}
                          {r.quantity > 1 && <span className="text-gray-500"> ×{r.quantity}</span>}
                        </p>
                        <p className="text-xs text-gray-400">{FREQUENCY_LABELS[r.inspection_frequency]}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{fmt(r.last_inspection_date)}</td>
                      <td className="px-4 py-3">
                        <p className={overdue ? "text-red-700 font-semibold" : "text-gray-900"}>{fmt(r.next_inspection_due)}</p>
                        <p className={`text-xs ${overdue ? "text-red-600" : d !== null && d <= 30 ? "text-amber-600" : "text-gray-400"}`}>
                          {d === null ? "" : overdue ? `${Math.abs(d)} days overdue` : d === 0 ? "Due today" : `in ${d} days`}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {r.customer?.phone && (
                            <a href={`tel:${r.customer.phone}`} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title={r.customer.phone}>
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                          {r.customer?.email && (
                            <a href={`mailto:${r.customer.email}?subject=${encodeURIComponent(`${SYSTEM_TYPE_LABELS[r.system_type]} inspection due`)}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title={r.customer.email}>
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => markInspected(r)}
                          disabled={marking === r.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700 disabled:opacity-50"
                          title="Records today as the inspection date and rolls the next due date forward"
                        >
                          {marking === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Mark inspected
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
