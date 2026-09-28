"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Link2,
  Unlink,
  RefreshCw,
} from "lucide-react";

interface GoogleStatus {
  configured: boolean;
  connected: boolean;
  email?: string | null;
}

function IntegrationsInner() {
  const params = useSearchParams();
  const [status, setStatus] = useState<GoogleStatus | null>(null);
  const [busy, setBusy] = useState(false);

  const connectedFlag = params.get("connected");
  const errorFlag = params.get("error");

  const load = async () => {
    try {
      const res = await fetch("/api/integrations/google");
      setStatus(await res.json());
    } catch {
      setStatus({ configured: false, connected: false });
    }
  };
  useEffect(() => {
    load();
  }, [connectedFlag]);

  const disconnect = async () => {
    if (!confirm("Disconnect Google Calendar? New jobs and inspections will stop syncing.")) return;
    setBusy(true);
    await fetch("/api/integrations/google", { method: "DELETE" });
    await load();
    setBusy(false);
  };

  const errorText: Record<string, string> = {
    not_configured: "Google isn't set up on the server yet — the app is missing its Google client ID and secret.",
    bad_state: "The connection request expired or didn't match. Please try again.",
    missing_code: "Google didn't return an authorization code. Please try again.",
    exchange_failed: "Couldn't complete the handshake with Google. Check the client secret and redirect URI.",
    access_denied: "You declined the Google permission request.",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" /> Settings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">Integrations</h1>
        <p className="text-gray-500 mt-1">Connect outside services to your site</p>
      </div>

      {connectedFlag && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <CheckCircle2 className="w-4 h-4" /> Google Calendar connected.
        </div>
      )}
      {errorFlag && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorText[errorFlag] || `Something went wrong: ${errorFlag}`}</span>
        </div>
      )}

      {/* Google Calendar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">Google Calendar</h3>
            <p className="text-sm text-gray-500 mt-1">
              Scheduled jobs and inspections appear on your Google Calendar automatically. Rescheduling
              updates the event.
            </p>

            {status === null ? (
              <div className="mt-4 text-gray-300">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : !status.configured ? (
              <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                Not set up on the server yet. Add <code className="font-mono">GOOGLE_CLIENT_ID</code> and{" "}
                <code className="font-mono">GOOGLE_CLIENT_SECRET</code> in Vercel, then reload.
              </div>
            ) : status.connected ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-green-700 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Connected{status.email ? ` — ${status.email}` : ""}
                </span>
                <button
                  onClick={disconnect}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                  Disconnect
                </button>
              </div>
            ) : (
              <a
                href="/api/integrations/google/connect"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium"
              >
                <Link2 className="w-4 h-4" /> Connect Google Calendar
              </a>
            )}
          </div>
        </div>
      </div>

      <SquareCard />

      <p className="text-xs text-gray-400">
        More integrations (Twilio for texting, etc.) will appear here as they&apos;re set up.
      </p>
    </div>
  );
}

interface SquareState {
  configured: boolean;
  last: {
    last_synced_at: string | null;
    customers_synced: number;
    catalog_synced: number;
    invoices_synced: number;
    errors: string[];
  } | null;
}

/** Square: pull the price list, customers, and invoices into the site. */
function SquareCard() {
  const [state, setState] = useState<SquareState | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/integrations/square");
      setState(await res.json());
    } catch {
      setState({ configured: false, last: null });
    }
  };
  useEffect(() => {
    load();
  }, []);

  const sync = async () => {
    setRunning(true);
    setResult(null);
    setErr(null);
    try {
      const res = await fetch("/api/integrations/square", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Sync failed");
      setResult(
        `Synced ${json.customers} customers, ${json.catalog} price-list items, ${json.invoices} invoices` +
          (json.errors?.length ? ` — ${json.errors.length} row(s) had problems (see below)` : "")
      );
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gray-100 rounded-xl">
          <RefreshCw className="w-6 h-6 text-gray-700" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">Square</h3>
          <p className="text-sm text-gray-500 mt-1">
            Pulls your Square price list into the Proposal Agent&apos;s inventory, plus your customers
            and invoices. Safe to run repeatedly — existing records are updated, not duplicated.
          </p>

          {state === null ? (
            <div className="mt-4 text-gray-300">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : !state.configured ? (
            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              Not set up on the server yet. Add <code className="font-mono">SQUARE_ACCESS_TOKEN</code> in
              Vercel, then reload.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={sync}
                  disabled={running}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg text-sm font-medium"
                >
                  {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {running ? "Syncing…" : "Sync now"}
                </button>
                {state.last?.last_synced_at && (
                  <span className="text-xs text-gray-500">
                    Last sync {new Date(state.last.last_synced_at).toLocaleString()} —{" "}
                    {state.last.customers_synced} customers · {state.last.catalog_synced} items ·{" "}
                    {state.last.invoices_synced} invoices
                  </span>
                )}
              </div>
              {result && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {result}
                </div>
              )}
              {err && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{err}</span>
                </div>
              )}
              {!!state.last?.errors?.length && (
                <details className="text-xs text-gray-500">
                  <summary className="cursor-pointer">
                    {state.last.errors.length} row(s) skipped last sync
                  </summary>
                  <ul className="mt-1 ml-4 list-disc space-y-0.5">
                    {state.last.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-300"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
      <IntegrationsInner />
    </Suspense>
  );
}
