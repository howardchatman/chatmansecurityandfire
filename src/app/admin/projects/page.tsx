"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Search, RefreshCw, DollarSign, Briefcase,
  CheckCircle, Clock, AlertTriangle, MapPin, ArrowRight,
  Building2, TrendingUp,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

interface Job {
  id: string;
  job_number?: string;
  customer_name: string;
  customer_phone?: string;
  site_address?: string;
  site_city?: string;
  site_state?: string;
  job_type?: string;
  priority?: string;
  status: string;
  total_amount?: number;
  notes?: string;
  created_at: string;
}

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-yellow-100 text-yellow-800",
  urgent: "bg-orange-100 text-orange-700",
  emergency: "bg-red-100 text-red-700",
};

function parseContractValue(notes?: string): number | null {
  if (!notes) return null;
  const match = notes.match(/CONTRACT:\s*\$?([\d,]+)/i);
  if (match) return parseInt(match[1].replace(/,/g, ""));
  return null;
}

function parseProjectName(notes?: string, fallback?: string): string {
  if (notes) {
    const firstLine = notes.split("\n")[0].trim();
    if (firstLine && firstLine.length < 80) return firstLine;
  }
  return fallback || "Unnamed Project";
}

function hasCriticalItems(notes?: string): boolean {
  if (!notes) return false;
  return notes.includes("URGENT:") || notes.includes("CRITICAL ITEMS OPEN");
}

export default function ProjectsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs");
      const json = await res.json();
      setJobs(json.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const filtered = jobs.filter((j) => {
    const matchType = typeFilter === "all" || j.job_type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || (
      j.customer_name.toLowerCase().includes(q) ||
      (j.site_address || "").toLowerCase().includes(q) ||
      (j.notes || "").toLowerCase().includes(q)
    );
    return matchType && matchSearch;
  });

  // Financial summary
  const totalContract = filtered.reduce((sum, j) => {
    const v = j.total_amount || parseContractValue(j.notes) || 0;
    return sum + v;
  }, 0);
  const active = filtered.filter((j) => j.status === "in_progress").length;
  const completed = filtered.filter((j) => j.status === "completed").length;
  const needsAttention = filtered.filter((j) => hasCriticalItems(j.notes)).length;

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Manage construction projects, contracts, and draw schedules</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchJobs}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <Link
            href="/admin/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            Total Contract Value
          </div>
          <p className="text-xl font-bold text-gray-900">{fmt(totalContract)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-orange-600 text-sm mb-1">
            <Clock className="w-4 h-4" />
            Active Projects
          </div>
          <p className="text-xl font-bold text-orange-600">{active}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
            <CheckCircle className="w-4 h-4" />
            Completed
          </div>
          <p className="text-xl font-bold text-green-600">{completed}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
            <AlertTriangle className="w-4 h-4" />
            Needs Attention
          </div>
          <p className="text-xl font-bold text-red-600">{needsAttention}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, customers, addresses..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "installation", "inspection", "service", "repair"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                typeFilter === t
                  ? "bg-orange-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t === "all" ? "All Types" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
          Loading projects...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No projects found</p>
          <Link href="/admin/jobs" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((job) => {
            const contractVal = job.total_amount || parseContractValue(job.notes);
            const projectName = parseProjectName(job.notes, job.customer_name);
            const urgent = hasCriticalItems(job.notes);

            return (
              <Link
                key={job.id}
                href={`/admin/projects/${job.id}`}
                className="block bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all p-5"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <StatusBadge status={job.status} size="sm" />
                      {job.job_type && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 capitalize">
                          {job.job_type}
                        </span>
                      )}
                      {job.priority && job.priority !== "normal" && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[job.priority] || ""}`}>
                          {job.priority}
                        </span>
                      )}
                      {urgent && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Action Required
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                      {projectName !== job.customer_name ? (
                        <>
                          <span className="block">{projectName}</span>
                          <span className="text-gray-500 font-normal">{job.customer_name}</span>
                        </>
                      ) : (
                        job.customer_name
                      )}
                    </h3>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1 ml-2" />
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  {job.site_address && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      {job.site_address}{job.site_city ? `, ${job.site_city}` : ""}
                    </div>
                  )}
                  {job.job_number && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                      Job #{job.job_number}
                    </div>
                  )}
                </div>

                {/* Contract Value */}
                {contractVal && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      {fmt(contractVal)}
                    </div>
                    <span className="text-xs text-gray-400">contract value</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
