"use client";

import { useCallback, useEffect, useState } from "react";
import { Radar, Loader2, ExternalLink, RefreshCw, CalendarClock, Building2 } from "lucide-react";

interface Bid {
  id: string;
  source: string;
  title: string;
  agency: string | null;
  location: string | null;
  posted_date: string | null;
  due_date: string | null;
  url: string | null;
  fit_score: number | null;
  fit_reason: string | null;
  service_match: string | null;
  status: string;
  notes: string | null;
}

const STATUSES = ["new", "reviewing", "bidding", "submitted", "won", "lost", "skipped"];

const statusColor: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewing: "bg-amber-100 text-amber-700",
  bidding: "bg-orange-100 text-orange-700",
  submitted: "bg-purple-100 text-purple-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-600",
  skipped: "bg-gray-100 text-gray-500",
};

function fitBadge(score: number | null) {
  if (score == null) return "bg-gray-100 text-gray-500";
  if (score >= 75) return "bg-green-100 text-green-700";
  if (score >= 50) return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-500";
}

function daysUntil(date: string | null): number | null {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export default function BidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [running, setRunning] = useState(false);
  const [runMessage, setRunMessage] = useState("");

  const fetchBids = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/bids?${params}`);
      const data = await res.json();
      if (data.success) setBids(data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchBids(); }, [fetchBids]);

  const runAgent = async () => {
    setRunning(true);
    setRunMessage("");
    try {
      const res = await fetch("/api/bids/fetch");
      const data = await res.json();
      setRunMessage(data.success ? data.message : data.error || "Agent run failed");
      if (data.success) fetchBids();
    } catch {
      setRunMessage("Agent run failed. Check your connection.");
    } finally {
      setRunning(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setBids((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    await fetch("/api/bids", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bid Finder</h1>
          <p className="text-gray-500 mt-1">
            RFQs and solicitations found automatically and scored for fit
          </p>
        </div>
        <button
          onClick={runAgent}
          disabled={running}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radar className="w-4 h-4" />}
          {running ? "Searching…" : "Run Agent Now"}
        </button>
      </div>

      {runMessage && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-sm">{runMessage}</div>
      )}

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              statusFilter === s ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : bids.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Radar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities yet</h3>
          <p className="text-gray-500 max-w-md mx-auto text-sm">
            Click &quot;Run Agent Now&quot; to search federal (SAM.gov) solicitations in Texas
            for fire alarm, sprinkler, cabling, and security work. The agent also runs
            automatically every morning.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bids.map((bid) => {
            const days = daysUntil(bid.due_date);
            return (
              <div key={bid.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-orange-200 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[260px]">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {bid.fit_score != null && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${fitBadge(bid.fit_score)}`}>
                          Fit {bid.fit_score}
                        </span>
                      )}
                      {bid.service_match && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                          {bid.service_match.replace(/_/g, " ")}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 uppercase">
                        {bid.source.replace("_", ".")}
                      </span>
                      {days != null && days >= 0 && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          days <= 7 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          <CalendarClock className="w-3 h-3" />
                          due in {days}d
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 leading-snug">{bid.title}</h3>
                    {bid.agency && (
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        {bid.agency} {bid.location ? `· ${bid.location}` : ""}
                      </p>
                    )}
                    {bid.fit_reason && (
                      <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{bid.fit_reason}&rdquo;</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={bid.status}
                      onChange={(e) => updateStatus(bid.id, e.target.value)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium capitalize border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 ${statusColor[bid.status] || "bg-gray-100"}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {bid.url && (
                      <a
                        href={bid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0D1B2A] hover:bg-[#1a2f45] text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 flex items-center gap-1.5">
        <RefreshCw className="w-3.5 h-3.5" />
        The agent checks SAM.gov daily for Texas solicitations matching fire alarm, sprinkler,
        suppression, cabling, fiber, access control, and surveillance work, then AI-scores each for fit.
      </p>
    </div>
  );
}
