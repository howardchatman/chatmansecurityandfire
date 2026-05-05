"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, RefreshCw, Phone,
} from "lucide-react";
import Link from "next/link";
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
  status: string;
  scheduled_date?: string;
  scheduled_time?: string;
  estimated_duration?: number;
  assignments?: { profile?: { full_name?: string } }[];
}

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

const typeColors: Record<string, string> = {
  service: "border-l-amber-500",
  installation: "border-l-blue-500",
  inspection: "border-l-green-500",
  repair: "border-l-red-400",
  default: "border-l-gray-400",
};

export default function SchedulingPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const dateStr = (d: Date) => d.toISOString().split("T")[0];

  const fetchData = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const [jobsRes, profilesRes] = await Promise.all([
        fetch(`/api/jobs?scheduled_date=${dateStr(date)}`).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch("/api/admin/teams").then((r) => r.json()).catch(() => ({ data: [] })),
      ]);
      setJobs(jobsRes.data || []);
      setProfiles(profilesRes.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentDate);
  }, [currentDate, fetchData]);

  const navigate = (delta: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + delta);
    setCurrentDate(d);
  };

  const formatDateLabel = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const isToday = dateStr(currentDate) === dateStr(new Date());

  const getTechJobCount = (name: string) =>
    jobs.filter((j) =>
      j.assignments?.some((a) => a.profile?.full_name === name)
    ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scheduling</h1>
          <p className="text-gray-500 mt-1">Jobs scheduled for this day</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchData(currentDate)}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/admin/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            New Job
          </Link>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => navigate(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
          <h2 className="text-base font-semibold text-gray-900 ml-2">{formatDateLabel(currentDate)}</h2>
        </div>
        {!isToday && (
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            Today
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-semibold text-gray-900">
            {loading ? "Loading..." : `${jobs.length} Job${jobs.length !== 1 ? "s" : ""} Scheduled`}
          </h3>

          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
              Loading jobs...
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500 mb-3">No jobs scheduled for this day</p>
              <Link
                href="/admin/jobs"
                className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Schedule a job
              </Link>
            </div>
          ) : (
            jobs.map((job) => {
              const colorClass = typeColors[job.job_type || ""] || typeColors.default;
              const tech = job.assignments?.[0]?.profile?.full_name;
              return (
                <Link
                  key={job.id}
                  href={`/admin/jobs/${job.id}`}
                  className={`block bg-white rounded-xl border border-gray-200 border-l-4 ${colorClass} p-4 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{job.customer_name}</h4>
                        <StatusBadge status={job.status} size="sm" />
                      </div>
                      {job.job_number && (
                        <p className="text-xs text-gray-400">#{job.job_number}</p>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded capitalize">
                      {job.job_type || "service"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {job.scheduled_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.scheduled_time}
                        {job.estimated_duration ? ` (${job.estimated_duration}h)` : ""}
                      </div>
                    )}
                    {job.site_address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.site_address}{job.site_city ? `, ${job.site_city}` : ""}
                      </div>
                    )}
                    {tech && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {tech}
                      </div>
                    )}
                    {job.customer_phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {job.customer_phone}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Today's Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Day Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Jobs</span>
                <span className="font-medium text-gray-900">{jobs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">In Progress</span>
                <span className="font-medium text-amber-600">
                  {jobs.filter((j) => j.status === "in_progress").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Completed</span>
                <span className="font-medium text-green-600">
                  {jobs.filter((j) => j.status === "completed").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Scheduled</span>
                <span className="font-medium text-blue-600">
                  {jobs.filter((j) => j.status === "scheduled").length}
                </span>
              </div>
            </div>
          </div>

          {/* Team */}
          {profiles.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900 text-sm">Team</h4>
              </div>
              <div className="divide-y divide-gray-100">
                {profiles.slice(0, 8).map((p) => {
                  const jobCount = getTechJobCount(p.full_name);
                  return (
                    <div key={p.id} className="p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-orange-600">
                          {p.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.full_name}</p>
                        <p className="text-xs text-gray-400 capitalize">{p.role}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${jobCount > 0 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>
                        {jobCount} jobs
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
