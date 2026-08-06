"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  Phone,
  Loader2,
  CheckCircle,
  ChevronRight,
  Navigation,
} from "lucide-react";

interface Job {
  id: string;
  job_number: string;
  customer_name: string;
  customer_phone?: string;
  site_address: string;
  site_city?: string;
  job_type: string;
  priority: string;
  status: string;
  scheduled_date?: string;
  scheduled_time_start?: string;
  description?: string;
}

const priorityRing: Record<string, string> = {
  emergency: "border-l-red-500",
  urgent: "border-l-orange-500",
  high: "border-l-yellow-500",
  normal: "border-l-blue-400",
  low: "border-l-gray-300",
};

const isToday = (d?: string) => {
  if (!d) return false;
  const today = new Date().toISOString().slice(0, 10);
  return d.slice(0, 10) === today;
};

export default function TechTodayPage() {
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

  const todays = jobs
    .filter((j) => isToday(j.scheduled_date) && !["completed", "cancelled", "closed"].includes(j.status))
    .sort((a, b) => (a.scheduled_time_start || "").localeCompare(b.scheduled_time_start || ""));

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Today</h1>
        <p className="text-gray-500 text-sm mt-0.5">{dateLabel}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : todays.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="font-semibold text-gray-900">Nothing scheduled today</p>
          <p className="text-sm text-gray-500 mt-1">
            Anything assigned to you shows under{" "}
            <Link href="/tech" className="text-orange-600 font-medium">My Jobs</Link>.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            {todays.length} stop{todays.length === 1 ? "" : "s"} today
          </p>
          <div className="space-y-3">
            {todays.map((job) => (
              <div
                key={job.id}
                className={`bg-white rounded-2xl border border-gray-200 border-l-4 ${priorityRing[job.priority] || priorityRing.normal} overflow-hidden`}
              >
                <Link href={`/tech/job/${job.id}`} className="block p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {job.scheduled_time_start && (
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {job.scheduled_time_start.slice(0, 5)}
                          </span>
                        )}
                        <span className="text-xs font-mono text-gray-400">{job.job_number}</span>
                      </div>
                      <p className="font-semibold text-gray-900 mt-1">{job.customer_name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">
                          {job.site_address}{job.site_city ? `, ${job.site_city}` : ""}
                        </span>
                      </p>
                      {job.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{job.description}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" />
                  </div>
                </Link>

                {/* Big touch targets — this gets used one-handed in a truck. */}
                <div className="flex border-t border-gray-100 divide-x divide-gray-100">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${job.site_address} ${job.site_city || ""}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Navigation className="w-4 h-4" /> Directions
                  </a>
                  {job.customer_phone && (
                    <a
                      href={`tel:${job.customer_phone}`}
                      className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Phone className="w-4 h-4" /> Call
                    </a>
                  )}
                  <Link
                    href={`/tech/job/${job.id}`}
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
                  >
                    <Calendar className="w-4 h-4" /> Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
