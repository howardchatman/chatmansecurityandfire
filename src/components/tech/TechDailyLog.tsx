"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, CheckCircle2, ClipboardList } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { houstonToday } from "@/lib/job-dates";

// A tech's own daily log for a job: hours and what got done. It feeds the
// project's crew log and the owner's daily update. Hidden when project
// tracking isn't installed.

interface Log { id: string; log_date: string; user_id: string | null; hours: number; notes: string | null }

export default function TechDailyLog({ jobId }: { jobId: string }) {
  const { user } = useAuth();
  const [available, setAvailable] = useState(false);
  const [mine, setMine] = useState<Log[]>([]);
  const [day, setDay] = useState(houstonToday());
  const [hours, setHours] = useState("8");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const apply = useCallback(
    (logs: Log[]) => {
      const own = logs.filter((l) => l.user_id === user?.id);
      setMine(own);
      const existing = own.find((l) => l.log_date === day);
      if (existing) {
        setHours(String(existing.hours));
        setNotes(existing.notes || "");
      }
    },
    [user?.id, day]
  );

  useEffect(() => {
    fetch(`/api/jobs/${jobId}/project`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json?.success) return;
        setAvailable(true);
        apply(json.data.logs || []);
      })
      .catch(() => {});
  }, [jobId, apply]);

  if (!available) return null;

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_log", log_date: day, hours: Number(hours), notes }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error || "Couldn't save.");
      apply(json.data.logs || []);
      setMessage({ ok: true, text: "Saved. Thanks!" });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Couldn't save." });
    } finally {
      setSaving(false);
    }
  };

  const totalHours = Math.round(mine.reduce((s, l) => s + (Number(l.hours) || 0), 0) * 10) / 10;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-orange-600" /> Log my day
      </h3>
      <p className="text-sm text-gray-500 mb-3">
        Hours and what you got done. It goes into the project&apos;s daily update.
        {totalHours ? ` You've logged ${totalHours} hrs on this job.` : ""}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="w-full px-3 py-3 border border-gray-300 rounded-xl text-base"
        />
        <input
          type="number"
          min="0"
          max="24"
          step="0.5"
          inputMode="decimal"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="w-full px-3 py-3 border border-gray-300 rounded-xl text-base"
          aria-label="Hours"
        />
      </div>
      <textarea
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="e.g. Pulled wire on 2nd floor east wing, mounted 14 smoke detectors."
        className="w-full mt-3 px-3 py-3 border border-gray-300 rounded-xl text-base"
      />
      <button
        onClick={save}
        disabled={saving}
        className="w-full mt-3 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl disabled:opacity-50 inline-flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
        {mine.some((l) => l.log_date === day) ? "Update my log" : "Save my log"}
      </button>
      {message && <p className={`text-sm mt-2 ${message.ok ? "text-green-700" : "text-red-600"}`}>{message.text}</p>}
    </div>
  );
}
