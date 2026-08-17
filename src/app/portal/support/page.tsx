"use client";

import { useEffect, useState } from "react";
import {
  TICKET_SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from "@/lib/service-tickets";
import {
  Ticket,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Send,
  Loader2,
  X,
} from "lucide-react";

interface ServiceRequest {
  id: string;
  ticket_number: string;
  title: string;
  description: string | null;
  service_type: string;
  priority: string;
  status: string;
  created_at: string;
  scheduled_date: string | null;
}

// Emergencies aren't offered as a priority here on purpose — the banner tells
// them to call instead of filing a ticket that might sit unread.
const PRIORITY_CHOICES = [
  { value: "low", label: "Low — general question" },
  { value: "normal", label: "Normal — needs attention soon" },
  { value: "urgent", label: "Urgent — system is down or impaired" },
];

const statusColors: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-700",
  assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-blue-100 text-blue-700",
  on_hold: "bg-gray-100 text-gray-600",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

const priorityColors: Record<string, string> = {
  low: "text-gray-600",
  normal: "text-yellow-600",
  urgent: "text-orange-600",
  emergency: "text-red-600",
};

const formatDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const blank = { title: "", service_type: "fire_alarm", priority: "normal", description: "" };

export default function PortalSupportPage() {
  const [tickets, setTickets] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ ...blank });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/portal/service-requests");
      const data = await res.json();
      if (data.success) setTickets(data.data || []);
    } catch {
      /* the list just stays empty; the form still works */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) {
      setError("Please tell us what you need help with.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Couldn't submit your request.");
        return;
      }
      setSuccess(data.message || "Request submitted.");
      setForm({ ...blank });
      setShowNew(false);
      load();
    } catch {
      setError("Couldn't submit your request. Please call us at (832) 859-7009.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support</h1>
          <p className="text-gray-600 mt-1">Request service and track your open requests</p>
        </div>
        <button
          onClick={() => { setShowNew(true); setSuccess(""); setError(""); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Request Service
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 text-sm">{success}</p>
          </div>
          <button onClick={() => setSuccess("")} className="text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emergency / contact strip */}
      <div className="bg-[#0E2148] rounded-xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Alarm sounding or system down?</p>
              <p className="text-white/70 text-sm">Don&apos;t wait on a ticket — call us directly.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="tel:8328597009" className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium text-sm">
              <Phone className="w-4 h-4" /> (832) 859-7009
            </a>
            <a href="mailto:info@chatmansecurityandfire.com" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium text-sm">
              <Mail className="w-4 h-4" /> Email us
            </a>
          </div>
        </div>
      </div>

      {/* New request form */}
      {showNew && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">New service request</h2>
            <button onClick={() => setShowNew(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                What do you need? *
              </label>
              <input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Fire alarm panel showing trouble light"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="service_type"
                  value={form.service_type}
                  onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {TICKET_SERVICE_TYPES.map((t) => (
                    <option key={t} value={t}>{SERVICE_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  How urgent?
                </label>
                <select
                  id="priority"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {PRIORITY_CHOICES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Details
              </label>
              <textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Anything that helps us come prepared — which building or area, when it started, what you're seeing."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? "Sending…" : "Submit request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests list */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Your requests</h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Ticket className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-900">No requests yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Need something looked at? Use <strong>Request Service</strong> above.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {tickets.map((t) => {
              const statusLabel = STATUS_LABELS[t.status] || t.status;
              const statusColor = statusColors[t.status] || "bg-gray-100 text-gray-600";
              const priorityLabel = PRIORITY_LABELS[t.priority] || t.priority;
              const priorityColor = priorityColors[t.priority] || "text-gray-600";
              return (
                <div key={t.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-gray-500">{t.ticket_number}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                          {statusLabel}
                        </span>
                        <span className={`text-xs font-medium ${priorityColor}`}>
                          {priorityLabel} priority
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mt-1">{t.title}</p>
                      {t.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{t.description}</p>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 sm:text-right flex-shrink-0">
                      <p className="flex items-center gap-1 sm:justify-end">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(t.created_at)}
                      </p>
                      {t.scheduled_date && (
                        <p className="text-xs text-blue-600 mt-1">
                          Scheduled {formatDate(t.scheduled_date)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
