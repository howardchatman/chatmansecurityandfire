"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, MapPin, Loader2, ChevronRight, ClipboardCheck } from "lucide-react";

interface Job {
  id: string;
  job_number: string;
  customer_name: string;
  site_address: string;
  site_city?: string;
  job_type: string;
  status: string;
  scheduled_date?: string;
  completed_at?: string;
  description?: string;
}

// Once a job is invoiced or paid the office has taken it over, but from the
// tech's point of view the work is done — so those count as completed here.
const DONE = ["completed", "invoiced", "paid", "closed"];

const fmt = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export default function TechCompletedPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/portal/jobs");
        const data = await res.json();
        if (data.success) setJobs(data.data || []);
      } catch {
        /* leave the list empty */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const done = jobs
    .filter((j) => DONE.includes(j.status))
    .sort((a, b) => (b.completed_at || b.scheduled_date || "").localeCompare(a.completed_at || a.scheduled_date || ""));

  const thisMonth = done.filter((j) => {
    const d = j.completed_at || j.scheduled_date;
    if (!d) return false;
    const dt = new Date(d);
    const now = new Date();
    return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Completed</h1>
        <p className="text-gray-500 text-sm mt-0.5">Work you&apos;ve finished</p>
      </div>

      {!loading && done.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">This month</p>
            <p className="text-2xl font-bold text-gray-900">{thisMonth}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">All time</p>
            <p className="text-2xl font-bold text-gray-900">{done.length}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : done.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <ClipboardCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-900">Nothing completed yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Jobs you finish will collect here. Current work is under{" "}
            <Link href="/tech" className="text-orange-600 font-medium">My Jobs</Link>.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {done.map((job) => (
            <Link
              key={job.id}
              href={`/tech/job/${job.id}`}
              className="block bg-white rounded-2xl border border-gray-200 p-4 hover:border-gray-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs font-mono text-gray-400">{job.job_number}</span>
                    <span className="text-xs text-gray-400 capitalize">
                      {(job.job_type || "").replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 mt-1">{job.customer_name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {job.site_address}{job.site_city ? `, ${job.site_city}` : ""}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Completed {fmt(job.completed_at || job.scheduled_date)}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
