"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, AlertTriangle, Clock, User, X, Loader2, Pencil, Trash2, Phone } from "lucide-react";

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description?: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  site_address?: string;
  site_city?: string;
  service_type: string;
  priority: string;
  status: string;
  assigned_to?: string;
  scheduled_date?: string;
  notes?: string;
  created_at: string;
}

const PRIORITIES = ["emergency", "urgent", "normal", "low"];
const STATUSES = ["open", "assigned", "in_progress", "on_hold", "resolved", "closed"];
const SERVICE_TYPES = ["fire_alarm", "sprinkler", "extinguisher", "emergency_lights", "fire_lane", "security", "other"];

const priorityColor: Record<string, string> = {
  emergency: "bg-red-100 text-red-700",
  urgent: "bg-orange-100 text-orange-700",
  normal: "bg-blue-100 text-blue-700",
  low: "bg-gray-100 text-gray-600",
};

const statusColor: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-700",
  assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-orange-100 text-orange-700",
  on_hold: "bg-gray-100 text-gray-600",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-500",
};

const blank = {
  title: "", customer_name: "", customer_phone: "", customer_email: "",
  site_address: "", site_city: "", service_type: "fire_alarm",
  priority: "normal", status: "open", description: "", notes: "", scheduled_date: "",
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Ticket | null>(null);
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets?status=${statusFilter}`);
      const data = await res.json();
      if (data.success) setTickets(data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const openCreate = () => { setEditing(null); setForm({ ...blank }); setError(""); setShowModal(true); };
  const openEdit = (t: Ticket) => {
    setEditing(t);
    setForm({
      title: t.title, customer_name: t.customer_name, customer_phone: t.customer_phone || "",
      customer_email: t.customer_email || "", site_address: t.site_address || "",
      site_city: t.site_city || "", service_type: t.service_type, priority: t.priority,
      status: t.status, description: t.description || "", notes: t.notes || "",
      scheduled_date: t.scheduled_date || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.customer_name) { setError("Title and customer name are required."); return; }
    setSaving(true); setError("");
    try {
      const url = editing ? `/api/tickets/${editing.id}` : "/api/tickets";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to save"); return; }
      setShowModal(false);
      fetchTickets();
    } catch { setError("Failed to save ticket."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ticket?")) return;
    await fetch(`/api/tickets/${id}`, { method: "DELETE" });
    fetchTickets();
  };

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", ...STATUSES].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>No tickets yet. <button onClick={openCreate} className="text-orange-600 font-medium hover:underline">Create one</button></p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Ticket #", "Title", "Customer", "Service", "Priority", "Status", "Scheduled", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.ticket_number}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{t.title}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{t.customer_name}</div>
                    {t.customer_phone && <div className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{t.customer_phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{t.service_type.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${priorityColor[t.priority] || "bg-gray-100 text-gray-600"}`}>{t.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[t.status] || "bg-gray-100 text-gray-600"}`}>{t.status.replace("_", " ")}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {t.scheduled_date ? new Date(t.scheduled_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? "Edit Ticket" : "New Ticket"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input value={form.title} onChange={f("title")} placeholder="e.g. Fire alarm panel trouble" className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input value={form.customer_name} onChange={f("customer_name")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={form.customer_phone} onChange={f("customer_phone")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input value={form.site_address} onChange={f("site_address")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input value={form.site_city} onChange={f("site_city")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <select value={form.service_type} onChange={f("service_type")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    {SERVICE_TYPES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={f("priority")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={f("status")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                <input type="date" value={form.scheduled_date} onChange={f("scheduled_date")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={f("description")} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={f("notes")} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Save Changes" : "Create Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
