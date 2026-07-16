"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, LogIn, MapPin, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

interface TimeEntry {
  id: string;
  clock_in: string;
  clock_out: string | null;
  clock_in_lat: number | null;
  clock_in_lng: number | null;
  minutes: number | null;
}

interface Me {
  id: string;
  name: string;
  role: string;
}

type Coords = { lat: number; lng: number; accuracy: number } | null;

function getPosition(): Promise<Coords> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function fmtDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function TimeClockPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [checking, setChecking] = useState(true);
  const [openEntry, setOpenEntry] = useState<TimeEntry | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [punching, setPunching] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "warn" | "error"; text: string } | null>(null);
  const [now, setNow] = useState(new Date());

  // Sign-in form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadData = useCallback(async () => {
    const [openRes, listRes] = await Promise.all([
      fetch("/api/time?open=true").then((r) => r.json()).catch(() => ({})),
      (() => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return fetch(`/api/time?from=${weekStart.toISOString()}`)
          .then((r) => r.json())
          .catch(() => ({}));
      })(),
    ]);
    if (openRes?.success !== undefined) setOpenEntry(openRes.data || null);
    if (listRes?.success) setEntries(listRes.data || []);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setMe(d.user);
        }
      })
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (me) loadData();
  }, [me, loadData]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setLoginError(data.error || "Sign in failed");
        return;
      }
      setMe(data.user);
    } catch {
      setLoginError("Sign in failed. Try again.");
    } finally {
      setSigningIn(false);
    }
  };

  const punch = async () => {
    setPunching(true);
    setMessage(null);
    const coords = await getPosition();
    try {
      const res = await fetch("/api/time", {
        method: openEntry ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coords ? coords : {}),
      });
      const data = await res.json();
      if (!data.success) {
        setMessage({ type: "error", text: data.error || "Punch failed" });
        return;
      }
      setMessage({
        type: coords ? "ok" : "warn",
        text: openEntry
          ? coords
            ? "Clocked out — location recorded."
            : "Clocked out — location unavailable."
          : coords
            ? "Clocked in — location recorded."
            : "Clocked in — location unavailable. Enable location for GPS stamps.",
      });
      await loadData();
    } catch {
      setMessage({ type: "error", text: "Punch failed. Check your connection." });
    } finally {
      setPunching(false);
    }
  };

  const weekMinutes = entries.reduce((sum, e) => sum + (e.minutes || 0), 0);
  const openSince = openEntry ? new Date(openEntry.clock_in) : null;
  const openElapsed = openSince ? Math.floor((now.getTime() - openSince.getTime()) / 60000) : 0;

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Signed out: compact mobile sign-in
  if (!me) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex flex-col items-center justify-center p-6">
        <img src="/csf_wide_logo.png" alt="Chatman Security & Fire" className="h-12 w-auto mb-8 brightness-0 invert" />
        <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Time Clock</h1>
          <p className="text-sm text-gray-500 mb-5">Sign in with your employee account.</p>
          <form onSubmit={handleSignIn} className="space-y-4">
            {loginError && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{loginError}</div>}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
            >
              {signingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex flex-col items-center p-6 pt-10">
      <img src="/csf_wide_logo.png" alt="Chatman Security & Fire" className="h-10 w-auto mb-6 brightness-0 invert" />

      {/* Live clock + status */}
      <p className="text-gray-400 text-sm">{now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      <p className="text-5xl font-bold text-white tabular-nums tracking-tight mt-1">
        {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
      </p>

      <div className="mt-3 mb-6 text-center">
        {openEntry ? (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/15 text-green-400 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Clocked in since {fmtTime(openEntry.clock_in)} · {fmtDuration(openElapsed)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 text-gray-300 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Clocked out
          </span>
        )}
      </div>

      {/* Punch button */}
      <button
        onClick={punch}
        disabled={punching}
        className={`w-52 h-52 rounded-full font-bold text-2xl text-white shadow-2xl transition-all active:scale-95 disabled:opacity-60 flex flex-col items-center justify-center gap-2 ${
          openEntry
            ? "bg-gradient-to-b from-red-500 to-red-700 shadow-red-900/40"
            : "bg-gradient-to-b from-green-500 to-green-700 shadow-green-900/40"
        }`}
      >
        {punching ? (
          <Loader2 className="w-10 h-10 animate-spin" />
        ) : (
          <>
            <Clock className="w-10 h-10" />
            {openEntry ? "Clock Out" : "Clock In"}
          </>
        )}
      </button>

      <p className="mt-4 flex items-center gap-1.5 text-gray-400 text-xs">
        <MapPin className="w-3.5 h-3.5" />
        GPS location is recorded with each punch
      </p>

      {message && (
        <div
          className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === "ok"
              ? "bg-green-500/15 text-green-400"
              : message.type === "warn"
                ? "bg-amber-500/15 text-amber-400"
                : "bg-red-500/15 text-red-400"
          }`}
        >
          {message.type === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* This week */}
      <div className="w-full max-w-sm mt-8 bg-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm">This Week</h2>
          <span className="text-orange-400 font-bold">{fmtDuration(weekMinutes)}</span>
        </div>
        {entries.length === 0 ? (
          <p className="text-gray-500 text-sm">No punches yet this week.</p>
        ) : (
          <div className="space-y-2">
            {entries.slice(0, 7).map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {new Date(e.clock_in).toLocaleDateString("en-US", { weekday: "short" })} {fmtTime(e.clock_in)}
                  {" – "}
                  {e.clock_out ? fmtTime(e.clock_out) : "…"}
                </span>
                <span className="text-gray-300 font-medium">
                  {e.minutes != null ? fmtDuration(e.minutes) : "open"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-gray-500 text-xs">
        Signed in as {me.name} · <a href="/time-clock" className="underline">refresh</a>
      </p>
    </div>
  );
}
