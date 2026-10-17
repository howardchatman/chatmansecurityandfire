"use client";

import { useState } from "react";
import { X, Loader2, Save, AlertTriangle } from "lucide-react";

// Edit an inspection's schedule, type, site contact, and notes. Changing the
// date, time, or type moves the Google Calendar event (handled by the API).

export interface EditableInspection {
  id: string;
  inspection_type: string;
  scheduled_date?: string;
  scheduled_time?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  notes?: string;
  internal_notes?: string;
}

const input = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500";

export default function InspectionEditModal({
  inspection,
  typeLabels,
  onClose,
  onSaved,
}: {
  inspection: EditableInspection;
  typeLabels: Record<string, string>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState({
    inspection_type: inspection.inspection_type || "fire_alarm",
    scheduled_date: (inspection.scheduled_date || "").slice(0, 10),
    scheduled_time: (inspection.scheduled_time || "").slice(0, 5),
    contact_name: inspection.contact_name || "",
    contact_phone: inspection.contact_phone || "",
    contact_email: inspection.contact_email || "",
    notes: inspection.notes || "",
    internal_notes: inspection.internal_notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    // Blank date/time must go to the database as null, not "".
    const body = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim() === "" ? null : v.trim()]));
    try {
      const res = await fetch(`/api/inspections/${inspection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || `Couldn't save (HTTP ${res.status}).`);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50" onClick={onClose}>
      <div className="min-h-full flex items-start sm:items-center justify-center p-4">
        <form
          onSubmit={save}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Edit inspection</h2>
            <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
            </div>
          )}

          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Type</span>
            <select className={input} value={f.inspection_type} onChange={set("inspection_type")}>
              {Object.entries(typeLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Date</span>
              <input type="date" className={input} value={f.scheduled_date} onChange={set("scheduled_date")} />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Time</span>
              <input type="time" className={input} value={f.scheduled_time} onChange={set("scheduled_time")} />
            </label>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Site contact</span>
              <input className={input} value={f.contact_name} onChange={set("contact_name")} />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Contact phone</span>
              <input type="tel" className={input} value={f.contact_phone} onChange={set("contact_phone")} />
            </label>
          </div>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Contact email</span>
            <input type="email" className={input} value={f.contact_email} onChange={set("contact_email")} />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Notes</span>
            <textarea rows={3} className={input} value={f.notes} onChange={set("notes")} />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Internal notes (staff only)</span>
            <textarea rows={2} className={input} value={f.internal_notes} onChange={set("internal_notes")} />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
