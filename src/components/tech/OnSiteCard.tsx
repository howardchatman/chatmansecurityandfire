"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MapPin, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { houstonToday } from "@/lib/job-dates";

// "I'm on site" for one job: clocks the signed-in person in on the time clock
// (with GPS when the phone allows it) tied to this job, and out again. On the
// way out, the hours go onto that day's crew log for the job.

interface Entry { id: string; job_id: string | null; clock_in: string; clock_out: string | null }

function position(): Promise<{ lat?: number; lng?: number; accuracy?: number }> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve({});
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      () => resolve({}), // denied or unavailable: clock in without a location
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    );
  });
}

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

export default function OnSiteCard({ jobId }: { jobId: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/time?open=true");
      const json = await res.json().catch(() => null);
      setOpen(json?.success ? json.data || null : null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const clockIn = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const pos = await position();
      const res = await fetch("/api/time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pos, job_id: jobId }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error || "Couldn't check in.");
      setOpen(json.data);
      setMessage({ ok: true, text: pos.lat ? "Checked in on site." : "Checked in (location wasn't available)." });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Couldn't check in." });
    } finally {
      setBusy(false);
    }
  };

  const clockOut = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const pos = await position();
      const res = await fetch("/api/time", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pos),
      });
      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error || "Couldn't check out.");
      const entry: Entry = json.data;
      setOpen(null);

      // Add this visit's hours to today's crew log for the job.
      const hours = Math.round(((Date.parse(entry.clock_out!) - Date.parse(entry.clock_in)) / 3_600_000) * 4) / 4;
      let logged = "";
      if (entry.job_id === jobId && hours > 0) {
        const day = houstonToday();
        const proj = await fetch(`/api/jobs/${jobId}/project`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
        if (proj?.success) {
          const mine = (proj.data.logs || []).find(
            (l: { log_date: string; user_id: string | null }) => l.log_date === day && l.user_id === user?.id
          );
          const total = Math.min(24, (Number(mine?.hours) || 0) + hours);
          const saved = await fetch(`/api/jobs/${jobId}/project`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "save_log", log_date: day, hours: total, notes: mine?.notes || "" }),
          }).then((r) => r.json()).catch(() => null);
          if (saved?.success) logged = ` ${hours} hrs added to today's log; add what you got done below.`;
        }
      }
      setMessage({ ok: true, text: `Checked out.${logged}` });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Couldn't check out." });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;

  const hereNow = open && open.job_id === jobId;
  const elsewhere = open && open.job_id !== jobId;

  return (
    <div className={`rounded-xl border p-4 ${hereNow ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
      <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <MapPin className={`w-5 h-5 ${hereNow ? "text-green-600" : "text-orange-600"}`} />
        {hereNow ? `On site since ${time(open!.clock_in)}` : "On site"}
      </h3>
      {elsewhere ? (
        <p className="text-sm text-gray-600">
          You&apos;re checked in {open!.job_id ? (
            <Link href={`/tech/job/${open!.job_id}`} className="text-orange-600 underline">on another job</Link>
          ) : (
            "on the time clock"
          )}{" "}
          since {time(open!.clock_in)}. Check out there first.
        </p>
      ) : hereNow ? (
        <button
          onClick={clockOut}
          disabled={busy}
          className="w-full mt-2 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
          Leaving site: check out
        </button>
      ) : (
        <>
          <p className="text-sm text-gray-500">Check in when you arrive. It records the time and your location.</p>
          <button
            onClick={clockIn}
            disabled={busy}
            className="w-full mt-3 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            I&apos;m on site: check in
          </button>
        </>
      )}
      {message && <p className={`text-sm mt-2 ${message.ok ? "text-green-700" : "text-red-600"}`}>{message.text}</p>}
    </div>
  );
}
