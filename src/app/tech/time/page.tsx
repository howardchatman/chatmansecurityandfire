"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Clock, Loader2, MapPin, Timer, CalendarDays } from "lucide-react";

interface Entry {
  id: string;
  clock_in: string;
  clock_out: string | null;
  clock_in_address?: string | null;
  clock_out_address?: string | null;
  notes?: string | null;
}

const hoursBetween = (a: string, b: string | null) => {
  const end = b ? new Date(b).getTime() : Date.now();
  return Math.max(0, (end - new Date(a).getTime()) / 3600000);
};

const fmtHours = (h: number) => {
  const whole = Math.floor(h);
  const mins = Math.round((h - whole) * 60);
  return `${whole}h ${String(mins).padStart(2, "0")}m`;
};

const fmtTime = (v: string) =>
  new Date(v).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const dayKey = (v: string) => new Date(v).toISOString().slice(0, 10);

const dayLabel = (k: string) => {
  const d = new Date(k + "T12:00:00");
  const today = new Date().toISOString().slice(0, 10);
  if (k === today) return "Today";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
};

export default function TechTimePage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        // The API scopes to the signed-in user for non-managers, but an admin
        // opening this page would otherwise see the whole crew's hours. This is
        // a personal timesheet, so always ask for our own.
        const res = await fetch(`/api/time?employee_id=${user.id}`);
        const data = await res.json();
        if (data.success) setEntries(data.data || []);
      } catch {
        /* leave the list empty */
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const open = entries.find((e) => !e.clock_out);

  // Group by day so the log reads like a timesheet rather than a flat list.
  const byDay = entries.reduce((acc, e) => {
    (acc[dayKey(e.clock_in)] ||= []).push(e);
    return acc;
  }, {} as Record<string, Entry[]>);
  const days = Object.keys(byDay).sort().reverse();

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekHours = entries
    .filter((e) => new Date(e.clock_in) >= weekStart)
    .reduce((s, e) => s + hoursBetween(e.clock_in, e.clock_out), 0);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Log</h1>
          <p className="text-gray-500 text-sm mt-0.5">Your clocked hours</p>
        </div>
        <Link
          href="/time-clock"
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold flex-shrink-0"
        >
          Clock in / out
        </Link>
      </div>

      {open && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-900">
              Clocked in — {fmtHours(hoursBetween(open.clock_in, null))} so far
            </p>
            <p className="text-sm text-green-700">Since {fmtTime(open.clock_in)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> This week</p>
          <p className="text-2xl font-bold text-gray-900">{fmtHours(weekHours)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> Entries</p>
          <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-900">No hours logged yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Use <Link href="/time-clock" className="text-orange-600 font-medium">Clock in</Link> when you start a shift.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((k) => {
            const dayEntries = byDay[k];
            const total = dayEntries.reduce((s, e) => s + hoursBetween(e.clock_in, e.clock_out), 0);
            return (
              <div key={k}>
                <div className="flex items-baseline justify-between mb-2">
                  <h2 className="font-semibold text-gray-900">{dayLabel(k)}</h2>
                  <span className="text-sm font-medium text-gray-600">{fmtHours(total)}</span>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
                  {dayEntries.map((e) => (
                    <div key={e.id} className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-gray-900">
                          {fmtTime(e.clock_in)} — {e.clock_out ? fmtTime(e.clock_out) : <span className="text-green-600 font-medium">still clocked in</span>}
                        </p>
                        <span className="text-sm font-semibold text-gray-900">
                          {fmtHours(hoursBetween(e.clock_in, e.clock_out))}
                        </span>
                      </div>
                      {(e.clock_in_address || e.clock_out_address) && (
                        <p className="text-xs text-gray-500 flex items-start gap-1 mt-1">
                          <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          <span>{e.clock_in_address || e.clock_out_address}</span>
                        </p>
                      )}
                      {e.notes && <p className="text-xs text-gray-500 mt-1">{e.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
