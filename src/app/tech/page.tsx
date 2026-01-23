"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  Calendar,
  Phone,
  Play,
  CheckCircle,
  AlertCircle,
  Loader2,
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
  site_state?: string;
  job_type: string;
  priority: string;
  status: string;
  scheduled_date?: string;
  scheduled_time_start?: string;
  description?: string;
  assignment?: {
    id: string;
    role: string;
    acknowledged_at?: string;
  };
}

const priorityColors: Record<string, string> = {
  low: "border-gray-300 bg-gray-50",
  normal: "border-blue-300 bg-blue-50",
  high: "border-yellow-300 bg-yellow-50",
  urgent: "border-orange-300 bg-orange-50",
  emergency: "border-red-300 bg-red-50",
};

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  on_hold: "bg-yellow-100 text-yellow-700",
};

const jobTypeLabels: Record<string, string> = {
  inspection: "Inspection",
  installation: "Installation",
  service: "Service",
  repair: "Repair",
  maintenance: "Maintenance",
  emergency: "Emergency",
};

export default function TechPortalPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/portal/jobs");
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const data = await response.json();
      setJobs(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (jobId: string) => {
    try {
      await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "acknowledge" }),
      });
      fetchJobs();
    } catch (err) {
      console.error("Error acknowledging job:", err);
    }
  };

  const handleStartJob = async (jobId: string) => {
    try {
      await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      fetchJobs();
    } catch (err) {
      console.error("Error starting job:", err);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const openMaps = (address: string, city?: string, state?: string) => {
    const fullAddress = `${address}${city ? `, ${city}` : ""}${state ? `, ${state}` : ""}`;
    const encoded = encodeURIComponent(fullAddress);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, "_blank");
  };

  const callCustomer = (phone?: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  // Separate jobs by status
  const activeJobs = jobs.filter((j) => j.status === "in_progress");
  const scheduledJobs = jobs.filter((j) => ["pending", "scheduled"].includes(j.status));
  const onHoldJobs = jobs.filter((j) => j.status === "on_hold");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        <p className="text-gray-500">View and manage your assigned jobs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-orange-600 text-white rounded-xl p-4 text-center">
          <p className="text-3xl font-bold">{activeJobs.length}</p>
          <p className="text-sm text-orange-100">In Progress</p>
        </div>
        <div className="bg-blue-600 text-white rounded-xl p-4 text-center">
          <p className="text-3xl font-bold">{scheduledJobs.length}</p>
          <p className="text-sm text-blue-100">Scheduled</p>
        </div>
        <div className="bg-yellow-500 text-white rounded-xl p-4 text-center">
          <p className="text-3xl font-bold">{onHoldJobs.length}</p>
          <p className="text-sm text-yellow-100">On Hold</p>
        </div>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            In Progress
          </h2>
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={() => router.push(`/tech/job/${job.id}`)}
                onNavigate={() => openMaps(job.site_address, job.site_city, job.site_state)}
                onCall={() => callCustomer(job.customer_phone)}
                isActive
              />
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Jobs */}
      {scheduledJobs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming</h2>
          <div className="space-y-3">
            {scheduledJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={() => router.push(`/tech/job/${job.id}`)}
                onNavigate={() => openMaps(job.site_address, job.site_city, job.site_state)}
                onCall={() => callCustomer(job.customer_phone)}
                onAcknowledge={
                  !job.assignment?.acknowledged_at
                    ? () => handleAcknowledge(job.id)
                    : undefined
                }
                onStart={
                  job.assignment?.acknowledged_at && job.status === "scheduled"
                    ? () => handleStartJob(job.id)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* On Hold Jobs */}
      {onHoldJobs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">On Hold</h2>
          <div className="space-y-3">
            {onHoldJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={() => router.push(`/tech/job/${job.id}`)}
                onNavigate={() => openMaps(job.site_address, job.site_city, job.site_state)}
                onCall={() => callCustomer(job.customer_phone)}
              />
            ))}
          </div>
        </div>
      )}

      {jobs.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">No Jobs Assigned</h3>
          <p className="text-gray-500 mt-1">
            You don't have any jobs assigned at the moment.
          </p>
        </div>
      )}
    </div>
  );
}

interface JobCardProps {
  job: Job;
  onViewDetails: () => void;
  onNavigate: () => void;
  onCall: () => void;
  onAcknowledge?: () => void;
  onStart?: () => void;
  isActive?: boolean;
}

function JobCard({
  job,
  onViewDetails,
  onNavigate,
  onCall,
  onAcknowledge,
  onStart,
  isActive,
}: JobCardProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  return (
    <div
      className={`bg-white rounded-xl border-2 overflow-hidden ${
        isActive ? "border-orange-500 shadow-lg" : priorityColors[job.priority] || "border-gray-200"
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-500">{job.job_number}</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[job.status]}`}>
                {job.status.replace("_", " ")}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">{job.customer_name}</h3>
            <p className="text-sm text-orange-600 font-medium">
              {jobTypeLabels[job.job_type] || job.job_type}
            </p>
          </div>
          <button
            onClick={onViewDetails}
            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            {job.site_address}
            {job.site_city && `, ${job.site_city}`}
          </span>
        </div>

        {/* Schedule */}
        {job.scheduled_date && (
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(job.scheduled_date)}
            </div>
            {job.scheduled_time_start && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(job.scheduled_time_start)}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onNavigate}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Navigation className="w-4 h-4" />
            Navigate
          </button>

          {job.customer_phone && (
            <button
              onClick={onCall}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
            >
              <Phone className="w-4 h-4" />
              Call
            </button>
          )}

          {onAcknowledge && (
            <button
              onClick={onAcknowledge}
              className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700"
            >
              <CheckCircle className="w-4 h-4" />
              Acknowledge
            </button>
          )}

          {onStart && (
            <button
              onClick={onStart}
              className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700"
            >
              <Play className="w-4 h-4" />
              Start Job
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
