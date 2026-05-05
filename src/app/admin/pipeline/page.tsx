"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Phone, Mail, MoreVertical,
  DollarSign, ArrowRight, RefreshCw, User,
} from "lucide-react";
import Link from "next/link";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source?: string;
  status: string;
  created_at: string;
}

const stages = [
  { id: "new",       name: "New Leads",     color: "bg-blue-500",   border: "border-t-blue-500" },
  { id: "contacted", name: "Contacted",     color: "bg-yellow-500", border: "border-t-yellow-500" },
  { id: "qualified", name: "Qualified",     color: "bg-purple-500", border: "border-t-purple-500" },
  { id: "proposal",  name: "Proposal Sent", color: "bg-orange-500", border: "border-t-orange-500" },
  { id: "won",       name: "Won",           color: "bg-green-500",  border: "border-t-green-500" },
  { id: "lost",      name: "Lost",          color: "bg-red-400",    border: "border-t-red-400" },
];

const stageOrder = stages.map((s) => s.id);

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [movingId, setMovingId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      const json = await res.json();
      setLeads(json.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const moveToStage = async (lead: Lead, newStage: string) => {
    setMovingId(lead.id);
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStage }),
      });
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, status: newStage } : l))
      );
    } catch {
      // ignore
    } finally {
      setMovingId(null);
    }
  };

  const getNextStage = (currentStage: string) => {
    const idx = stageOrder.indexOf(currentStage);
    if (idx === -1 || idx >= stageOrder.length - 2) return null; // don't auto-advance to lost
    return stageOrder[idx + 1];
  };

  const getLeadsByStage = (stageId: string) =>
    leads.filter(
      (l) =>
        l.status === stageId &&
        (l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (l.email || "").toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-500 mt-1">{leads.length} total leads</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLeads}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </Link>
        </div>
      </div>

      {/* Stage Summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {stages.map((stage) => (
          <div key={stage.id} className={`bg-white rounded-xl border border-gray-200 border-t-4 ${stage.border} p-3`}>
            <div className="text-xl font-bold text-gray-900">{getLeadsByStage(stage.id).length}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stage.name}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search leads..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Board */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">Loading pipeline...</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageLeads = getLeadsByStage(stage.id);
            return (
              <div key={stage.id} className="flex-shrink-0 w-72 bg-gray-50 rounded-xl p-3">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                    <span className="font-semibold text-gray-800 text-sm">{stage.name}</span>
                    <span className="bg-gray-200 text-gray-600 text-xs font-medium px-1.5 py-0.5 rounded-full">
                      {stageLeads.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {stageLeads.map((lead) => {
                    const nextStage = getNextStage(lead.status);
                    return (
                      <div
                        key={lead.id}
                        className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-3.5 h-3.5 text-orange-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{lead.name}</p>
                              <p className="text-xs text-gray-400 truncate">{lead.email}</p>
                            </div>
                          </div>
                          <button className="p-1 hover:bg-gray-100 rounded flex-shrink-0">
                            <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                        </div>

                        {lead.message && (
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{lead.message}</p>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {lead.source || "website"}
                          </span>
                          <span>{formatDate(lead.created_at)}</span>
                        </div>

                        <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              title="Call"
                            >
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                            </a>
                          )}
                          <a
                            href={`mailto:${lead.email}`}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Email"
                          >
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                          </a>
                          <div className="flex-1" />
                          {nextStage && (
                            <button
                              onClick={() => moveToStage(lead, nextStage)}
                              disabled={movingId === lead.id}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
                              title={`Move to ${stages.find((s) => s.id === nextStage)?.name}`}
                            >
                              {movingId === lead.id ? "..." : (
                                <>Advance <ArrowRight className="w-3 h-3" /></>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {stageLeads.length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-xs">No leads here</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
