"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X, Pencil, Loader2, ShieldCheck, CalendarClock, DollarSign } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";
import {
  SYSTEM_TYPES,
  SYSTEM_TYPE_LABELS,
  INSPECTION_FREQUENCIES,
  FREQUENCY_LABELS,
  SYSTEM_STATUSES,
  STATUS_LABELS,
  daysUntilDue,
} from "@/lib/customer-systems";

interface SystemRow {
  id: string;
  system_type: string;
  description: string | null;
  location: string | null;
  quantity: number;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  install_date: string | null;
  last_inspection_date: string | null;
  inspection_frequency: string;
  next_inspection_due: string | null;
  monitored: boolean;
  monthly_rate: number | null;
  status: string;
  notes: string | null;
}

const blank = {
  system_type: "fire_alarm",
  description: "",
  location: "",
  quantity: "1",
  manufacturer: "",
  model: "",
  serial_number: "",
  install_date: "",
  last_inspection_date: "",
  inspection_frequency: "annual",
  monitored: false,
  monthly_rate: "",
  status: "active",
  notes: "",
};

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const fmt = (v: string | null) =>
  v ? new Date(v + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

function DueBadge({ due }: { due: string | null }) {
  const d = daysUntilDue(due);
  if (d === null) return <span className="text-gray-400 text-sm">Not scheduled</span>;
  const cls =
    d < 0 ? "bg-red-100 text-red-700" : d <= 30 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600";
  const text = d < 0 ? `Overdue ${Math.abs(d)}d` : d === 0 ? "Due today" : `Due in ${d}d`;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{text}</span>;
}

export default function CustomerSystems({ customerId }: { customerId: string }) {
  const [rows, setRows] = useState<SystemRow[]>([]);
  const [rmr, setRmr] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SystemRow | null>(null);
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customer-systems?customer_id=${customerId}`);
      const data = await res.json();
      if (data.success) {
        setRows(data.data || []);
        setRmr(data.summary?.monthlyRecurringRevenue || 0);
      } else setError(data.error || "");
    } catch {
      setError("Couldn't load systems.");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ ...blank }); setError(""); setShowForm(true); };
  const openEdit = (r: SystemRow) => {
    setEditing(r);
    setForm({
      system_type: r.system_type,
      description: r.description || "",
      location: r.location || "",
      quantity: String(r.quantity ?? 1),
      manufacturer: r.manufacturer || "",
      model: r.model || "",
      serial_number: r.serial_number || "",
      install_date: r.install_date || "",
      last_inspection_date: r.last_inspection_date || "",
      inspection_frequency: r.inspection_frequency,
      monitored: r.monitored,
      monthly_rate: r.monthly_rate != null ? String(r.monthly_rate) : "",
      status: r.status,
      notes: r.notes || "",
    });
    setError("");
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/customer-systems", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, customer_id: customerId, id: editing?.id }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Couldn't save."); return; }
      setShowForm(false);
      load();
    } catch {
      setError("Couldn't save.");
    } finally {
      setSaving(false);
    }
  };

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{rows.length} system{rows.length === 1 ? "" : "s"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">
              <strong className="text-gray-900">{money(rmr)}</strong>/mo recurring
            </span>
          </div>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> Add System
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-orange-600" /></div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-900">No systems recorded</p>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Add what this customer has on site. It drives their portal, inspection reminders, and your
            recurring revenue tracking.
          </p>
          <button onClick={openAdd} className="mt-4 text-orange-600 font-medium hover:underline">Add the first one</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["System", "Location", "Qty", "Last Inspected", "Next Due", "Monitoring", "Status", ""].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === "" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{SYSTEM_TYPE_LABELS[r.system_type] || r.system_type}</p>
                      {(r.description || r.manufacturer || r.model) && (
                        <p className="text-xs text-gray-500">
                          {[r.manufacturer, r.model].filter(Boolean).join(" ")}
                          {r.description ? (r.manufacturer || r.model ? ` · ${r.description}` : r.description) : ""}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.location || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{r.quantity}</td>
                    <td className="px-4 py-3 text-gray-600">{fmt(r.last_inspection_date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <DueBadge due={r.next_inspection_due} />
                        <span className="text-xs text-gray-400">{FREQUENCY_LABELS[r.inspection_frequency]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {r.monitored ? (
                        <span className="text-green-700 font-medium">{money(Number(r.monthly_rate || 0))}/mo</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.status === "active" ? "bg-green-100 text-green-700"
                        : r.status === "needs_service" ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-500"}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <DeleteButton
                          endpoint={`/api/customer-systems?id=${r.id}`}
                          label={SYSTEM_TYPE_LABELS[r.system_type] || r.system_type}
                          entity="system"
                          onDeleted={load}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? "Edit System" : "Add System"}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System type *</label>
                  <select value={form.system_type} onChange={f("system_type")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm">
                    {SYSTEM_TYPES.map((t) => <option key={t} value={t}>{SYSTEM_TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input type="number" min="1" value={form.quantity} onChange={f("quantity")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input value={form.description} onChange={f("description")} placeholder="e.g. Addressable panel serving the whole building" className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input value={form.location} onChange={f("location")} placeholder="Main electrical room" className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <input value={form.manufacturer} onChange={f("manufacturer")} placeholder="Silent Knight" className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input value={form.model} onChange={f("model")} placeholder="5820XL" className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Installed</label>
                  <input type="date" value={form.install_date} onChange={f("install_date")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last inspected</label>
                  <input type="date" value={form.last_inspection_date} onChange={f("last_inspection_date")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inspection cycle</label>
                  <select value={form.inspection_frequency} onChange={f("inspection_frequency")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm">
                    {INSPECTION_FREQUENCIES.map((x) => <option key={x} value={x}>{FREQUENCY_LABELS[x]}</option>)}
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-500 -mt-2 flex items-center gap-1">
                <CalendarClock className="w-3.5 h-3.5" />
                The next inspection date is worked out from the last inspection plus the cycle.
              </p>

              <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.monitored} onChange={(e) => setForm((p) => ({ ...p, monitored: e.target.checked }))} className="accent-orange-600 w-4 h-4" />
                  <span className="text-sm font-medium text-gray-900">Monitored / billed monthly</span>
                </label>
                {form.monitored && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly rate</label>
                    <div className="relative max-w-[180px]">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input type="number" step="0.01" min="0" value={form.monthly_rate} onChange={f("monthly_rate")} placeholder="79.00" className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-xl text-sm" />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={f("status")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm">
                    {SYSTEM_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial number</label>
                  <input value={form.serial_number} onChange={f("serial_number")} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal notes</label>
                <textarea rows={2} value={form.notes} onChange={f("notes")} placeholder="Not shown to the customer" className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Save changes" : "Add system"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
