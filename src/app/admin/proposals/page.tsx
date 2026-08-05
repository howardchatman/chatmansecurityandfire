"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  FileText,
  Save,
  Building2,
  Trash2,
  Plus,
} from "lucide-react";

interface Customer { id: string; name: string; company: string | null; city: string | null }

interface Line {
  name: string;
  description: string | null;
  unit: string | null;
  quantity: number;
  unit_cost: number;
  total: number;
  note?: string;
  priced_per_job: boolean;
}

interface Draft {
  title: string;
  scope_summary: string;
  line_items: Line[];
  assumptions: string[];
  exclusions: string[];
  gaps: string[];
  code_notes: string[];
  subtotal: number;
  tax_rate: number;
  tax: number;
  total: number;
  dropped_items: string[];
}

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

export default function ProposalsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [description, setDescription] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        if (data.success) setCustomers(data.data || []);
      } catch { /* the picker just stays empty */ }
    })();
  }, []);

  // Totals are recomputed here whenever a quantity is edited, so the figure on
  // screen always matches the lines above it.
  const recalc = (lines: Line[]): Draft => {
    const subtotal = Math.round(lines.reduce((s, l) => s + l.total, 0) * 100) / 100;
    const tax = Math.round(subtotal * (draft?.tax_rate ?? 0.0825) * 100) / 100;
    return { ...(draft as Draft), line_items: lines, subtotal, tax, total: Math.round((subtotal + tax) * 100) / 100 };
  };

  const setQty = (i: number, qty: number) => {
    if (!draft) return;
    const lines = draft.line_items.map((l, idx) =>
      idx === i ? { ...l, quantity: qty, total: Math.round(l.unit_cost * qty * 100) / 100 } : l
    );
    setDraft(recalc(lines));
  };

  const setPrice = (i: number, price: number) => {
    if (!draft) return;
    const lines = draft.line_items.map((l, idx) =>
      idx === i ? { ...l, unit_cost: price, total: Math.round(price * l.quantity * 100) / 100 } : l
    );
    setDraft(recalc(lines));
  };

  const removeLine = (i: number) => {
    if (!draft) return;
    setDraft(recalc(draft.line_items.filter((_, idx) => idx !== i)));
  };

  const generate = async () => {
    setError(""); setNotice(""); setGenerating(true); setDraft(null);
    try {
      const res = await fetch("/api/proposal-agent/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: customerId || undefined, description }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Couldn't draft the proposal."); return; }
      setDraft(data.data);
    } catch {
      setError("Couldn't reach the proposal service.");
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true); setError("");
    try {
      const cust = customers.find((c) => c.id === customerId);
      const res = await fetch("/api/proposal-agent/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: cust ? cust.company || cust.name : "Unassigned",
          status: "draft",
          proposal_data: { ...draft, customer_id: customerId || null, description },
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setNotice("Saved as a draft proposal.");
    } catch {
      setError("Couldn't save the proposal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
        <p className="text-gray-500 mt-1">
          Describe the job in plain language. It drafts the scope and prices it from your catalogue.
        </p>
      </div>

      {/* Composer */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
            >
              <option value="">— not linked to a customer —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company || c.name}{c.city ? ` · ${c.city}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">What&apos;s the job?</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. 12,000 sq ft daycare in Spring, two floors. Needs a new addressable fire alarm system — panel, smoke detectors throughout, pull stations at each exit, horn/strobes in corridors. Existing system failed inspection. They need permits pulled and the fire marshal walked through."
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            The more you give it — square footage, floors, occupancy, what failed — the closer the device counts land.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={generate}
            disabled={generating || !description.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Drafting…" : "Draft proposal"}
          </button>
          {draft && (
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save draft
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        {notice && <div className="text-sm text-green-800 bg-green-50 rounded-lg px-3 py-2">{notice}</div>}
      </div>

      {/* Draft */}
      {draft && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">{draft.title}</h2>
            <p className="text-gray-600 mt-2">{draft.scope_summary}</p>
          </div>

          {(draft.gaps?.length > 0 || draft.dropped_items?.length > 0) && (
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-200">
              <p className="text-sm font-medium text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Needs your pricing
              </p>
              <ul className="mt-1 text-sm text-amber-800 list-disc list-inside">
                {draft.gaps?.map((g, i) => <li key={`g${i}`}>{g}</li>)}
                {draft.dropped_items?.map((d, i) => (
                  <li key={`d${i}`}>{d} — not in your catalogue, left off</li>
                ))}
              </ul>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Item", "Qty", "Unit price", "Total", ""].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase ${h === "Item" ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {draft.line_items.map((l, i) => (
                  <tr key={i} className={l.priced_per_job ? "bg-amber-50/50" : ""}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{l.name}</p>
                      {l.note && <p className="text-xs text-gray-500">{l.note}</p>}
                      {l.priced_per_job && <p className="text-xs text-amber-700 font-medium">Priced per job — enter an amount</p>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number" min="1" value={l.quantity}
                        onChange={(e) => setQty(i, Math.max(1, Number(e.target.value) || 1))}
                        className="w-16 px-2 py-1 border border-gray-200 rounded text-right"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number" min="0" step="0.01" value={l.unit_cost}
                        onChange={(e) => setPrice(i, Number(e.target.value) || 0)}
                        className="w-28 px-2 py-1 border border-gray-200 rounded text-right"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{usd(l.total)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeLine(i)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr><td colSpan={3} className="px-4 py-2 text-right text-gray-600">Subtotal</td><td className="px-4 py-2 text-right font-medium">{usd(draft.subtotal)}</td><td /></tr>
                <tr><td colSpan={3} className="px-4 py-2 text-right text-gray-600">Tax ({(draft.tax_rate * 100).toFixed(2)}%)</td><td className="px-4 py-2 text-right font-medium">{usd(draft.tax)}</td><td /></tr>
                <tr><td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">Total</td><td className="px-4 py-3 text-right text-lg font-bold text-gray-900">{usd(draft.total)}</td><td /></tr>
              </tfoot>
            </table>
          </div>

          <div className="p-6 grid md:grid-cols-3 gap-6 border-t border-gray-100">
            {[
              { label: "Code notes", items: draft.code_notes },
              { label: "Assumptions", items: draft.assumptions },
              { label: "Exclusions", items: draft.exclusions },
            ].map((b) => b.items?.length ? (
              <div key={b.label}>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{b.label}</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  {b.items.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      {!draft && !generating && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-900">No draft yet</p>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Describe a job above. Every price comes from your own catalogue — nothing is invented.
          </p>
        </div>
      )}
    </div>
  );
}
