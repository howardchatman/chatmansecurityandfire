"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  DollarSign,
  FileText,
  Camera,
  Plus,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Edit2,
  Trash2,
  MessageSquare,
  History,
  ClipboardList,
  Play,
  Pause,
  CheckSquare,
  Save,
  X,
  Upload,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

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
  assigned_at: string;
  user: Profile;
}

interface JobNote {
  id: string;
  note: string;
  visibility: string;
  created_at: string;
  author?: Profile;
}

interface JobPhoto {
  id: string;
  photo_url: string;
  caption?: string;
  photo_type: string;
  location?: string;
  created_at: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  status: "pending" | "passed" | "failed" | "na";
  note?: string;
  completed_at?: string;
  completed_by?: string;
}

interface JobChecklist {
  id: string;
  checklist_type: string;
  name: string;
  items: ChecklistItem[];
  completed_at?: string;
  created_at: string;
}

interface JobEvent {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
  created_by?: string;
}

interface Job {
  id: string;
  job_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  contact_name?: string;
  site_address: string;
  site_city?: string;
  site_state?: string;
  site_zip?: string;
  job_type: string;
  priority: string;
  status: string;
  description?: string;
  notes?: string;
  scope_summary?: string;
  billing_notes?: string;
  scheduled_date?: string;
  scheduled_time_start?: string;
  scheduled_time_end?: string;
  estimated_duration_hours?: number;
  actual_start_time?: string;
  actual_end_time?: string;
  completed_at?: string;
  total_amount?: number;
  invoiced_at?: string;
  paid_at?: string;
  quote_id?: string;
  team_id?: string;
  created_at: string;
  assignments?: JobAssignment[];
  job_notes?: JobNote[];
  job_photos?: JobPhoto[];
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
  low: "bg-gray-100 text-gray-700 border-gray-300",
  normal: "bg-blue-100 text-blue-700 border-blue-300",
  high: "bg-yellow-100 text-yellow-700 border-yellow-300",
  urgent: "bg-orange-100 text-orange-700 border-orange-300",
  emergency: "bg-red-100 text-red-700 border-red-300",
};

const statusLabels: Record<string, string> = {
  lead: "Lead",
  quoted: "Quoted",
  approved: "Approved",
  pending: "Pending",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  awaiting_inspection: "Awaiting Inspection",
  corrections_required: "Corrections Required",
  passed: "Passed",
  completed: "Completed",
  invoiced: "Invoiced",
  paid: "Paid",
  closed: "Closed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

const allLifecycleStatuses = [
  "lead", "quoted", "approved", "pending", "scheduled",
  "in_progress", "awaiting_inspection", "corrections_required", "passed",
  "on_hold", "completed", "invoiced", "paid", "closed", "cancelled",
];

const photoTypeLabels: Record<string, string> = {
  before: "Before",
  during: "During",
  after: "After",
  deficiency: "Deficiency",
  fire_lane: "Fire Lane",
  panel: "Panel",
  rtu: "RTU",
  device: "Device",
  issue: "Issue",
  general: "General",
  signature: "Signature",
  other: "Other",
};

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [checklists, setChecklists] = useState<JobChecklist[]>([]);
  const [events, setEvents] = useState<JobEvent[]>([]);
  const [technicians, setTechnicians] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "notes" | "photos" | "checklists" | "history">("details");

  // Note form state
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteVisibility, setNoteVisibility] = useState("internal");
  const [noteSaving, setNoteSaving] = useState(false);

  // Assignment state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignSaving, setAssignSaving] = useState(false);

  // Status change
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const fetchData = async () => {
    try {
      const [jobRes, techsRes] = await Promise.all([
        fetch(`/api/jobs/${resolvedParams.id}`),
        fetch("/api/admin/invite?role=technician"),
      ]);

      if (jobRes.ok) {
        const data = await jobRes.json();
        setJob(data.data);
      }

      if (techsRes.ok) {
        const data = await techsRes.json();
        setTechnicians(data.data || []);
      }

      // Also fetch checklists and events if available
      try {
        const [checklistsRes, eventsRes] = await Promise.all([
          fetch(`/api/jobs/${resolvedParams.id}/checklists`),
          fetch(`/api/jobs/${resolvedParams.id}/events`),
        ]);
        if (checklistsRes.ok) {
          const data = await checklistsRes.json();
          setChecklists(data.data || []);
        }
        if (eventsRes.ok) {
          const data = await eventsRes.json();
          setEvents(data.data || []);
        }
      } catch {
        // Checklists/events endpoints may not exist yet
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!job) return;
    setStatusSaving(true);
    try {
      const response = await fetch("/api/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: job.id, status: newStatus }),
      });

      if (response.ok) {
        setJob({ ...job, status: newStatus });
        fetchData(); // Refresh to get updated events
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setStatusSaving(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !noteText.trim()) return;
    setNoteSaving(true);

    try {
      const response = await fetch(`/api/jobs/${job.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: noteText,
          visibility: noteVisibility,
        }),
      });

      if (response.ok) {
        setNoteText("");
        setShowNoteForm(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setNoteSaving(false);
    }
  };

  const handleAssignTech = async (userId: string) => {
    if (!job) return;
    setAssignSaving(true);

    try {
      const response = await fetch(`/api/jobs/${job.id}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          role: "technician",
        }),
      });

      if (response.ok) {
        setShowAssignModal(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error assigning technician:", error);
    } finally {
      setAssignSaving(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!job) return;
    if (!confirm("Remove this technician from the job?")) return;

    try {
      const response = await fetch(`/api/jobs/${job.id}/assignments/${assignmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error removing assignment:", error);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return "—";
    return new Date(dateTimeStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
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

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Job not found</h2>
        <Link href="/admin/jobs" className="text-orange-600 hover:underline mt-2">
          Back to jobs
        </Link>
      </div>
    );
  }

  // Get assigned technicians
  const assignedTechIds = new Set(job.assignments?.map((a) => a.user.id) || []);
  const availableTechs = technicians.filter((t) => !assignedTechIds.has(t.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link
            href="/admin/jobs"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{job.job_number}</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${priorityColors[job.priority]}`}>
              {job.priority}
            </span>
            <StatusBadge status={job.status} />
            {job.quote_id && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                From Quote
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-1">{job.customer_name}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Quick Actions based on status */}
          {job.status === "scheduled" && (
            <button
              onClick={() => handleStatusChange("in_progress")}
              disabled={statusSaving}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              Start Job
            </button>
          )}
          {job.status === "in_progress" && (
            <>
              <button
                onClick={() => handleStatusChange("on_hold")}
                disabled={statusSaving}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <Pause className="w-4 h-4" />
                Put On Hold
              </button>
              <button
                onClick={() => handleStatusChange("completed")}
                disabled={statusSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Complete
              </button>
            </>
          )}
          {job.status === "completed" && (
            <button
              onClick={() => handleStatusChange("invoiced")}
              disabled={statusSaving}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              <DollarSign className="w-4 h-4" />
              Create Invoice
            </button>
          )}

          {/* Status Dropdown */}
          <select
            value={job.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={statusSaving}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-orange-500"
          >
            {allLifecycleStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Job Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex border-b">
              {[
                { id: "details", label: "Details", icon: FileText },
                { id: "notes", label: "Notes", icon: MessageSquare, count: job.job_notes?.length },
                { id: "photos", label: "Photos", icon: Camera, count: job.job_photos?.length },
                { id: "checklists", label: "Checklists", icon: ClipboardList, count: checklists.length },
                { id: "history", label: "History", icon: History, count: events.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-orange-600 text-orange-600 bg-orange-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Details Tab */}
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Customer & Site */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                      <div className="space-y-2">
                        <p className="text-gray-900 font-medium">{job.customer_name}</p>
                        {job.contact_name && (
                          <p className="text-gray-600 text-sm">Contact: {job.contact_name}</p>
                        )}
                        {job.customer_phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <a href={`tel:${job.customer_phone}`} className="hover:text-orange-600">
                              {job.customer_phone}
                            </a>
                          </div>
                        )}
                        {job.customer_email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <a href={`mailto:${job.customer_email}`} className="hover:text-orange-600">
                              {job.customer_email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Job Site</h3>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>{job.site_address}</p>
                          {(job.site_city || job.site_state || job.site_zip) && (
                            <p>
                              {job.site_city}
                              {job.site_state && `, ${job.site_state}`}
                              {job.site_zip && ` ${job.site_zip}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Job Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Job Type</p>
                        <p className="font-medium text-gray-900">
                          {jobTypeLabels[job.job_type] || job.job_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Priority</p>
                        <p className="font-medium text-gray-900 capitalize">{job.priority}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="font-medium text-gray-900">{statusLabels[job.status]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Est. Duration</p>
                        <p className="font-medium text-gray-900">
                          {job.estimated_duration_hours
                            ? `${job.estimated_duration_hours} hours`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Scheduling */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Schedule</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Scheduled Date</p>
                        <p className="font-medium text-gray-900">{formatDate(job.scheduled_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Scheduled Time</p>
                        <p className="font-medium text-gray-900">
                          {job.scheduled_time_start
                            ? `${formatTime(job.scheduled_time_start)}${
                                job.scheduled_time_end ? ` - ${formatTime(job.scheduled_time_end)}` : ""
                              }`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Actual Start</p>
                        <p className="font-medium text-gray-900">
                          {formatDateTime(job.actual_start_time)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Actual End</p>
                        <p className="font-medium text-gray-900">
                          {formatDateTime(job.actual_end_time)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {job.description && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                    </div>
                  )}

                  {/* Scope Summary */}
                  {job.scope_summary && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Scope Summary</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{job.scope_summary}</p>
                    </div>
                  )}

                  {/* Financial */}
                  {(job.total_amount || job.invoiced_at || job.paid_at) && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Financial</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {job.total_amount && (
                          <div>
                            <p className="text-xs text-gray-500">Total Amount</p>
                            <p className="font-medium text-gray-900 text-lg">
                              {job.total_amount.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}
                            </p>
                          </div>
                        )}
                        {job.invoiced_at && (
                          <div>
                            <p className="text-xs text-gray-500">Invoiced</p>
                            <p className="font-medium text-gray-900">{formatDate(job.invoiced_at)}</p>
                          </div>
                        )}
                        {job.paid_at && (
                          <div>
                            <p className="text-xs text-gray-500">Paid</p>
                            <p className="font-medium text-green-600">{formatDate(job.paid_at)}</p>
                          </div>
                        )}
                      </div>
                      {job.billing_notes && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Billing Notes</p>
                          <p className="text-gray-700 text-sm">{job.billing_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === "notes" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Job Notes</h3>
                    <button
                      onClick={() => setShowNoteForm(true)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Note
                    </button>
                  </div>

                  {showNoteForm && (
                    <form onSubmit={handleAddNote} className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Write a note..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                        required
                      />
                      <div className="flex items-center justify-between">
                        <select
                          value={noteVisibility}
                          onChange={(e) => setNoteVisibility(e.target.value)}
                          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg"
                        >
                          <option value="internal">Internal Only</option>
                          <option value="tech">Visible to Techs</option>
                          <option value="customer">Visible to Customer</option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowNoteForm(false)}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={noteSaving}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                          >
                            {noteSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {job.job_notes && job.job_notes.length > 0 ? (
                    <div className="space-y-3">
                      {job.job_notes.map((note) => (
                        <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {note.author?.full_name || "Unknown"}
                              </span>
                              <span className={`px-2 py-0.5 text-xs rounded ${
                                note.visibility === "customer"
                                  ? "bg-blue-100 text-blue-700"
                                  : note.visibility === "tech"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-200 text-gray-600"
                              }`}>
                                {note.visibility === "customer"
                                  ? "Customer Visible"
                                  : note.visibility === "tech"
                                  ? "Tech Visible"
                                  : "Internal"}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(note.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{note.note}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No notes yet</p>
                  )}
                </div>
              )}

              {/* Photos Tab */}
              {activeTab === "photos" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Job Photos</h3>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                      <Upload className="w-4 h-4" />
                      Upload Photos
                    </button>
                  </div>

                  {job.job_photos && job.job_photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {job.job_photos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <img
                            src={photo.photo_url}
                            alt={photo.caption || "Job photo"}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-lg">
                            <span className="text-xs text-white font-medium">
                              {photoTypeLabels[photo.photo_type] || photo.photo_type}
                            </span>
                            {photo.caption && (
                              <p className="text-xs text-white/80 truncate">{photo.caption}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No photos yet</p>
                  )}
                </div>
              )}

              {/* Checklists Tab */}
              {activeTab === "checklists" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Checklists</h3>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                      <Plus className="w-4 h-4" />
                      Add Checklist
                    </button>
                  </div>

                  {checklists.length > 0 ? (
                    <div className="space-y-4">
                      {checklists.map((checklist) => (
                        <div key={checklist.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{checklist.name}</h4>
                              <p className="text-xs text-gray-500 capitalize">
                                {checklist.checklist_type.replace("_", " ")}
                              </p>
                            </div>
                            {checklist.completed_at ? (
                              <span className="flex items-center gap-1 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                Completed
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">
                                {checklist.items.filter((i) => i.status !== "pending").length} /{" "}
                                {checklist.items.length}
                              </span>
                            )}
                          </div>
                          <div className="p-4 space-y-2">
                            {checklist.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                              >
                                <span className="text-sm text-gray-700">{item.label}</span>
                                <span
                                  className={`px-2 py-0.5 text-xs rounded ${
                                    item.status === "passed"
                                      ? "bg-green-100 text-green-700"
                                      : item.status === "failed"
                                      ? "bg-red-100 text-red-700"
                                      : item.status === "na"
                                      ? "bg-gray-100 text-gray-600"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {item.status.toUpperCase()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No checklists attached</p>
                  )}
                </div>
              )}

              {/* History Tab */}
              {activeTab === "history" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Activity History</h3>

                  {events.length > 0 ? (
                    <div className="space-y-3">
                      {events.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <History className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">
                              {event.event_type === "status_change" && (
                                <>
                                  Status changed from{" "}
                                  <span className="font-medium">
                                    {statusLabels[String(event.payload.from)] || String(event.payload.from)}
                                  </span>{" "}
                                  to{" "}
                                  <span className="font-medium">
                                    {statusLabels[String(event.payload.to)] || String(event.payload.to)}
                                  </span>
                                </>
                              )}
                              {event.event_type === "created" && "Job created"}
                              {event.event_type === "note_added" && "Note added"}
                              {event.event_type === "photo_uploaded" && "Photo uploaded"}
                              {event.event_type === "assignment_added" && (
                                <>
                                  {String(event.payload.user_name || "Technician")} assigned to job
                                </>
                              )}
                              {event.event_type === "checklist_completed" && "Checklist completed"}
                            </p>
                            <p className="text-xs text-gray-500">{formatDateTime(event.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No activity recorded yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Assigned Technicians */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Assigned Team</h3>
              <button
                onClick={() => setShowAssignModal(true)}
                className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {job.assignments && job.assignments.length > 0 ? (
              <div className="space-y-3">
                {job.assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-medium">
                          {assignment.user.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{assignment.user.full_name}</p>
                        <p className="text-xs text-gray-500 capitalize">{assignment.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAssignment(assignment.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No technicians assigned</p>
            )}
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">{formatDate(job.created_at)}</span>
              </div>
              {job.scheduled_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Scheduled:</span>
                  <span className="text-gray-900">{formatDate(job.scheduled_date)}</span>
                </div>
              )}
              {job.completed_at && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">Completed:</span>
                  <span className="text-gray-900">{formatDate(job.completed_at)}</span>
                </div>
              )}
              {job.quote_id && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <Link
                    href={`/admin/quotes/${job.quote_id}`}
                    className="text-orange-600 hover:underline"
                  >
                    View Original Quote
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Status Progress */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Job Progress</h3>
            <div className="space-y-2">
              {["scheduled", "in_progress", "completed", "invoiced", "paid"].map((status, index) => {
                const statusIndex = allLifecycleStatuses.indexOf(job.status);
                const thisIndex = allLifecycleStatuses.indexOf(status);
                const isComplete = thisIndex <= statusIndex;
                const isCurrent = status === job.status;

                return (
                  <div key={status} className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isComplete
                          ? "bg-green-500 text-white"
                          : isCurrent
                          ? "bg-orange-500 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        isComplete || isCurrent ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {statusLabels[status]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Technician Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Assign Technician</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {availableTechs.length > 0 ? (
                <div className="space-y-2">
                  {availableTechs.map((tech) => (
                    <button
                      key={tech.id}
                      onClick={() => handleAssignTech(tech.id)}
                      disabled={assignSaving}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {tech.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tech.full_name}</p>
                        <p className="text-sm text-gray-500">{tech.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  All technicians are already assigned to this job.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
