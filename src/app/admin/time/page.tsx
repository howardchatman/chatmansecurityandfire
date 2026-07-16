"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, MapPin, Loader2, Smartphone, ExternalLink } from "lucide-react";

interface TimeEntry {
  id: string;
  employee_id: string;
  employee_name: string | null;
  clock_in: string;
  clock_out: string | null;
  clock_in_lat: number | null;
  clock_in_lng: number | null;
  clock_out_lat: number | null;
  clock_out_lng: number | null;
  minutes: number | null;
}

interface Employee {
  id: string;
  name: string;
}

function startOfWeek(offsetWeeks = 0) {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + offsetWeeks * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function mapsLink(lat: number, lng: number) {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

export default function TimePage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const from = startOfWeek(weekOffset);
      const to = startOfWeek(weekOffset + 1);
      const params = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
      });
      if (employeeFilter !== "all") params.set("employee_id", employeeFilter);
      const res = await fetch(`/api/time?${params}`);
      const data = await res.json();
      if (data.success) setEntries(data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [employeeFilter, weekOffset]);

  useEffect(() => {
    fetch("/api/admin/invite")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setEmployees((d.data || []).map((u: { id: string; name: string }) => ({ id: u.id, name: u.name })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // Totals per employee for the visible range
  const totals = entries.reduce<Record<string, { name: string; minutes: number }>>((acc, e) => {
    const key = e.employee_id;
    if (!acc[key]) acc[key] = { name: e.employee_name || "Unknown", minutes: 0 };
    acc[key].minutes += e.minutes || 0;
    return acc;
  }, {});

  const weekLabel =
    weekOffset === 0
      ? "This Week"
      : weekOffset === -1
        ? "Last Week"
        : `Week of ${startOfWeek(weekOffset).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-500 mt-1">Employee punches with GPS stamps</p>
        </div>
        <a
          href="/time-clock"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D1B2A] hover:bg-[#1a2f45] text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Smartphone className="w-4 h-4" />
          Employee Time Clock
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
          {[0, -1, -2].map((off) => (
            <button
              key={off}
              onClick={() => setWeekOffset(off)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                weekOffset === off ? "bg-orange-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {off === 0 ? "This Week" : off === -1 ? "Last Week" : "2 Weeks Ago"}
            </button>
          ))}
        </div>
        <select
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
        >
          <option value="all">All employees</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
      </div>

      {/* Per-employee totals */}
      {Object.keys(totals).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(totals).map(([id, t]) => (
            <div key={id} className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 truncate">{t.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{fmtDuration(t.minutes)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{weekLabel}</p>
            </div>
          ))}
        </div>
      )}

      {/* Entries table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No punches {weekLabel.toLowerCase()}</h3>
          <p className="text-gray-500 max-w-md mx-auto text-sm">
            Employees clock in and out from their phones at{" "}
            <a href="/time-clock" className="text-orange-600 font-medium hover:underline">/time-clock</a>.
            Have them bookmark it — each punch records a GPS location stamp.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Employee", "Date", "In", "Out", "Duration", "GPS"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{e.employee_name || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(e.clock_in).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(e.clock_in).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {e.clock_out
                        ? new Date(e.clock_out).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                        : <span className="inline-flex items-center gap-1.5 text-green-600 font-medium"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />on the clock</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {e.minutes != null ? fmtDuration(e.minutes) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {e.clock_in_lat != null && e.clock_in_lng != null ? (
                          <a
                            href={mapsLink(e.clock_in_lat, e.clock_in_lng)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100"
                            title="Clock-in location"
                          >
                            <MapPin className="w-3 h-3" /> In
                          </a>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-400 rounded-lg text-xs">In: n/a</span>
                        )}
                        {e.clock_out && (e.clock_out_lat != null && e.clock_out_lng != null ? (
                          <a
                            href={mapsLink(e.clock_out_lat, e.clock_out_lng)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100"
                            title="Clock-out location"
                          >
                            <MapPin className="w-3 h-3" /> Out
                          </a>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-400 rounded-lg text-xs">Out: n/a</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
