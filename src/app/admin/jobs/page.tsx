"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  MoreHorizontal,
  Calendar,
  MapPin,
  Clock,
  User,
  X,
  Loader2,
  AlertCircle,
  Filter,
  Search,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

interface Team {
  id: string;
  name: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
}

interface JobAssignment {
  id: string;
  role: string;
  user: Profile;
}

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
  scheduled_time_end?: string;
  estimated_duration_hours?: number;
  description?: string;
  team?: Team;
  assignments?: JobAssignment[];
  created_at: string;
}

const jobTypeLabels: Record<string, string> = {
  inspection: "Inspection",
  installation: "Installation",
  service: "Service",
  repair: "Repair",
  maintenance: "Maintenance",
  emergency: "Emergency",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-yellow-100 text-yellow-700",
  urgent: "bg-orange-100 text-orange-700",
  emergency: "bg-red-100 text-red-700",
};

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Scheduled", value: "scheduled" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "On Hold", value: "on_hold" },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [technicians, setTechnicians] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Create form state
  const [jobForm, setJobForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    site_address: "",
    site_city: "",
    site_state: "TX",
    site_zip: "",
    job_type: "service",
    priority: "normal",
    description: "",
    scheduled_date: "",
    scheduled_time_start: "",
    scheduled_time_end: "",
    estimated_duration_hours: "",
    team_id: "",
    assigned_users: [] as { user_id: string; role: string }[],
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const [jobsRes, teamsRes, techsRes] = await Promise.all([
        fetch(`/api/jobs?${params}`),
        fetch("/api/admin/teams"),
        fetch("/api/admin/invite?role=technician"),
      ]);

      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data.data || []);
      }

      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setTeams(data.data || []);
      }

      if (techsRes.ok) {
        const data = await techsRes.json();
        setTechnicians(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...jobForm,
          estimated_duration_hours: jobForm.estimated_duration_hours
            ? parseFloat(jobForm.estimated_duration_hours)
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create job");
      }

      setShowCreateModal(false);
      setJobForm({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        site_address: "",
        site_city: "",
        site_state: "TX",
        site_zip: "",
        job_type: "service",
        priority: "normal",
        description: "",
        scheduled_date: "",
        scheduled_time_start: "",
        scheduled_time_end: "",
        estimated_duration_hours: "",
        team_id: "",
        assigned_users: [],
      });
      fetchData();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to create job");
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: jobId, status: newStatus }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.job_number.toLowerCase().includes(query) ||
        job.customer_name.toLowerCase().includes(query) ||
        job.site_address.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not scheduled";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-500 mt-1">
            Create jobs, assign technicians, and track progress
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Job
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Jobs</p>
          <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {jobs.filter((j) => j.status === "pending").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Scheduled</p>
          <p className="text-2xl font-bold text-blue-600">
            {jobs.filter((j) => j.status === "scheduled").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-orange-600">
            {jobs.filter((j) => j.status === "in_progress").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {jobs.filter((j) => j.status === "completed").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === filter.value
                  ? "bg-orange-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No jobs found. Create your first job to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-gray-500">
                        {job.job_number}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          priorityColors[job.priority]
                        }`}
                      >
                        {job.priority}
                      </span>
                      <StatusBadge status={job.status} />
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">
                      {job.customer_name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.site_address}
                      {job.site_city && `, ${job.site_city}`}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1">
                    <span className="text-sm font-medium text-gray-700">
                      {jobTypeLabels[job.job_type] || job.job_type}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(job.scheduled_date)}
                      {job.scheduled_time_start && (
                        <>
                          <Clock className="w-3.5 h-3.5 ml-2" />
                          {formatTime(job.scheduled_time_start)}
                        </>
                      )}
                    </div>
                    {job.assignments && job.assignments.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <User className="w-3.5 h-3.5" />
                        {job.assignments.map((a) => a.user.full_name).join(", ")}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={job.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(job.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-orange-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-lg font-semibold text-gray-900">Create New Job</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateJob} className="p-4 space-y-6">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {formError}
                </div>
              )}

              {/* Customer Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={jobForm.customer_name}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, customer_name: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={jobForm.customer_phone}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, customer_phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Site Address */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Job Site</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={jobForm.site_address}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, site_address: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={jobForm.site_city}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, site_city: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={jobForm.site_state}
                        onChange={(e) =>
                          setJobForm({ ...jobForm, site_state: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP
                      </label>
                      <input
                        type="text"
                        value={jobForm.site_zip}
                        onChange={(e) =>
                          setJobForm({ ...jobForm, site_zip: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Job Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Type *
                    </label>
                    <select
                      value={jobForm.job_type}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, job_type: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    >
                      <option value="inspection">Inspection</option>
                      <option value="installation">Installation</option>
                      <option value="service">Service</option>
                      <option value="repair">Repair</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={jobForm.priority}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, priority: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team
                    </label>
                    <select
                      value={jobForm.team_id}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, team_id: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    >
                      <option value="">No Team</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={jobForm.description}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>
              </div>

              {/* Scheduling */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Scheduling</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={jobForm.scheduled_date}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, scheduled_date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={jobForm.scheduled_time_start}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, scheduled_time_start: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={jobForm.scheduled_time_end}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, scheduled_time_end: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Est. Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={jobForm.estimated_duration_hours}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, estimated_duration_hours: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Assignment */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Assign Technicians</h3>
                <div className="flex flex-wrap gap-2">
                  {technicians.map((tech) => {
                    const isAssigned = jobForm.assigned_users.some(
                      (a) => a.user_id === tech.id
                    );
                    return (
                      <button
                        key={tech.id}
                        type="button"
                        onClick={() => {
                          if (isAssigned) {
                            setJobForm({
                              ...jobForm,
                              assigned_users: jobForm.assigned_users.filter(
                                (a) => a.user_id !== tech.id
                              ),
                            });
                          } else {
                            setJobForm({
                              ...jobForm,
                              assigned_users: [
                                ...jobForm.assigned_users,
                                { user_id: tech.id, role: "technician" },
                              ],
                            });
                          }
                        }}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          isAssigned
                            ? "bg-orange-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {tech.full_name}
                      </button>
                    );
                  })}
                  {technicians.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No technicians available. Invite technicians from the Team page.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Job"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
