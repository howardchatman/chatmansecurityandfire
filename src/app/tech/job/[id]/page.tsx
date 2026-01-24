"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Phone,
  User,
  Camera,
  MessageSquare,
  CheckCircle,
  Play,
  Pause,
  Navigation,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Send,
  Image,
} from "lucide-react";

interface JobPhoto {
  id: string;
  photo_url: string;
  caption?: string;
  photo_type: string;
  taken_at: string;
  uploader?: { full_name: string };
}

interface JobNote {
  id: string;
  note: string;
  note_type: string;
  created_at: string;
  user?: { full_name: string };
}

interface Job {
  id: string;
  job_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  site_address: string;
  site_city?: string;
  site_state?: string;
  site_zip?: string;
  job_type: string;
  priority: string;
  status: string;
  description?: string;
  notes?: string;
  scheduled_date?: string;
  scheduled_time_start?: string;
  scheduled_time_end?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  completion_notes?: string;
  photos: JobPhoto[];
  notes_list: JobNote[];
  assignments?: { user: { full_name: string }; role: string }[];
}

const jobTypeLabels: Record<string, string> = {
  inspection: "Inspection",
  installation: "Installation",
  service: "Service",
  repair: "Repair",
  maintenance: "Maintenance",
  emergency: "Emergency",
};

const statusColors: Record<string, string> = {
  lead: "bg-slate-100 text-slate-700",
  quoted: "bg-indigo-100 text-indigo-700",
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-gray-100 text-gray-700",
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-orange-100 text-orange-700",
  awaiting_inspection: "bg-cyan-100 text-cyan-700",
  corrections_required: "bg-rose-100 text-rose-700",
  passed: "bg-teal-100 text-teal-700",
  completed: "bg-green-100 text-green-700",
  invoiced: "bg-violet-100 text-violet-700",
  paid: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
  on_hold: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-gray-100 text-gray-500",
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

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [completionNotes, setCompletionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch job");
      }
      const data = await response.json();
      setJob({
        ...data.data,
        photos: data.data.photos || [],
        notes_list: data.data.notes || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load job");
    } finally {
      setLoading(false);
    }
  };

  const handleStartJob = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      fetchJob();
    } catch (err) {
      console.error("Error starting job:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePauseJob = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "on_hold" }),
      });
      fetchJob();
    } catch (err) {
      console.error("Error pausing job:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_note",
          note: noteText,
          note_type: noteType,
        }),
      });
      setNoteText("");
      setShowNoteModal(false);
      fetchJob();
    } catch (err) {
      console.error("Error adding note:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteJob = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          completion_notes: completionNotes,
        }),
      });
      setShowCompleteModal(false);
      router.push("/tech");
    } catch (err) {
      console.error("Error completing job:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const openMaps = () => {
    if (!job) return;
    const fullAddress = `${job.site_address}${job.site_city ? `, ${job.site_city}` : ""}${job.site_state ? `, ${job.site_state}` : ""}`;
    const encoded = encodeURIComponent(fullAddress);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, "_blank");
  };

  const callCustomer = () => {
    if (job?.customer_phone) {
      window.location.href = `tel:${job.customer_phone}`;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
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

  const formatDateTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return "";
    return new Date(dateTimeStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700">{error || "Job not found"}</p>
        <button
          onClick={() => router.push("/tech")}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/tech")}
          className="p-2 hover:bg-gray-200 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-gray-500">{job.job_number}</span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[job.status] || "bg-gray-100 text-gray-700"}`}>
              {statusLabels[job.status] || job.status.replace("_", " ")}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{job.customer_name}</h1>
        </div>
      </div>

      {/* Job Type Badge */}
      <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-center font-semibold">
        {jobTypeLabels[job.job_type] || job.job_type}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={openMaps}
          className="flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
        >
          <Navigation className="w-5 h-5" />
          Navigate
        </button>
        {job.customer_phone && (
          <button
            onClick={callCustomer}
            className="flex items-center justify-center gap-2 p-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
          >
            <Phone className="w-5 h-5" />
            Call Customer
          </button>
        )}
      </div>

      {/* Site Address */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Site Location</h3>
        <div className="flex items-start gap-2 text-gray-600">
          <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p>{job.site_address}</p>
            {(job.site_city || job.site_state || job.site_zip) && (
              <p className="text-gray-500">
                {job.site_city}{job.site_city && job.site_state && ", "}{job.site_state} {job.site_zip}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Schedule</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-5 h-5" />
            {formatDate(job.scheduled_date)}
          </div>
          {job.scheduled_time_start && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              {formatTime(job.scheduled_time_start)}
              {job.scheduled_time_end && ` - ${formatTime(job.scheduled_time_end)}`}
            </div>
          )}
          {job.actual_start_time && (
            <p className="text-sm text-green-600 mt-2">
              Started: {formatDateTime(job.actual_start_time)}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      {job.description && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Job Description</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
        </div>
      )}

      {/* Notes */}
      {job.notes && (
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Important Notes</h3>
          <p className="text-yellow-700 whitespace-pre-wrap">{job.notes}</p>
        </div>
      )}

      {/* Job Notes (from tech) */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Activity Notes</h3>
          <button
            onClick={() => setShowNoteModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
        </div>
        {job.notes_list.length > 0 ? (
          <div className="space-y-3">
            {job.notes_list.map((note) => (
              <div key={note.id} className="border-l-2 border-gray-200 pl-3">
                <p className="text-gray-700">{note.note}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {note.user?.full_name} • {formatDateTime(note.created_at)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No notes yet</p>
        )}
      </div>

      {/* Photos */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Photos</h3>
          <button
            onClick={() => {/* TODO: Photo upload */}}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
          >
            <Camera className="w-4 h-4" />
            Add Photo
          </button>
        </div>
        {job.photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {job.photos.map((photo) => (
              <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={photo.photo_url}
                  alt={photo.caption || "Job photo"}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <Image className="w-12 h-12 mb-2" />
            <p className="text-sm">No photos yet</p>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
        <div className="max-w-7xl mx-auto flex gap-3">
          {job.status === "scheduled" && (
            <button
              onClick={handleStartJob}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 disabled:bg-orange-400"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              Start Job
            </button>
          )}

          {job.status === "in_progress" && (
            <>
              <button
                onClick={handlePauseJob}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-yellow-500 text-white font-semibold rounded-xl hover:bg-yellow-600 disabled:bg-yellow-400"
              >
                <Pause className="w-5 h-5" />
                Pause
              </button>
              <button
                onClick={() => setShowCompleteModal(true)}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:bg-green-400"
              >
                <CheckCircle className="w-5 h-5" />
                Complete
              </button>
            </>
          )}

          {job.status === "on_hold" && (
            <button
              onClick={handleStartJob}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 disabled:bg-orange-400"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              Resume Job
            </button>
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Add Note</h3>
              <button onClick={() => setShowNoteModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:border-orange-500"
            >
              <option value="general">General Note</option>
              <option value="issue">Issue/Problem</option>
              <option value="customer">Customer Request</option>
              <option value="internal">Internal Note</option>
            </select>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter your note..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:border-orange-500 resize-none"
            />
            <button
              onClick={handleAddNote}
              disabled={!noteText.trim() || submitting}
              className="w-full py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 disabled:bg-orange-400 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Add Note
            </button>
          </div>
        </div>
      )}

      {/* Complete Job Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Complete Job</h3>
              <button onClick={() => setShowCompleteModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Add any completion notes before marking this job as complete.
            </p>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Completion notes (optional)..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:border-orange-500 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteJob}
                disabled={submitting}
                className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:bg-green-400 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
