"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Wrench, MapPin, User, Calendar, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  job_number: string;
  job_type: string;
  status: string;
  customer_name: string;
  customer_phone?: string;
  site_address: string;
  site_city?: string;
  description?: string;
  scheduled_date?: string;
  scheduled_time_start?: string;
  created_at: string;
  assignments?: { user: { full_name: string } }[];
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  on_hold: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
};

const STATUS_FILTERS = ["all", "pending", "scheduled", "in_progress", "completed", "on_hold"];

export default function WorkOrdersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();
      if (data.success) setJobs(data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{jobs.length} work order{jobs.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/jobs" className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Work Order
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${statusFilter === s ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Wrench className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>No work orders found. <Link href="/admin/jobs" className="text-orange-600 font-medium hover:underline">Create one in Jobs</Link></p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-orange-200 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-mono text-xs text-gray-500">{job.job_number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[job.status] || "bg-gray-100 text-gray-600"}`}>
                      {job.status.replace("_", " ")}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                      {job.job_type?.replace("_", " ") || "general"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{job.customer_name}</h3>
                  {job.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{job.description}</p>}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {[job.site_address, job.site_city].filter(Boolean).join(", ") || "No address"}
                    </span>
                    {job.scheduled_date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(job.scheduled_date).toLocaleDateString()}
                        {job.scheduled_time_start && ` · ${job.scheduled_time_start}`}
                      </span>
                    )}
                    {job.assignments && job.assignments.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {job.assignments.map(a => a.user?.full_name).filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                <Link href={`/admin/jobs/${job.id}`} className="flex-shrink-0 p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
