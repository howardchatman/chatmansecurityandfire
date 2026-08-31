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

import AgreementDocument from "@/components/proposal/AgreementDocument";
import type { ProposalDocument } from "@/lib/proposal-doc";

interface Draft {
  document: ProposalDocument;
  dropped_items: string[];
  attempts: number;
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

      {/* The agreement, exactly as the customer will receive it */}
      {draft && (
        <>
          {(draft.dropped_items.length > 0 || draft.document.gaps.length > 0) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 no-print">
              <p className="text-sm font-medium text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Before you send this — needs your pricing
              </p>
              <ul className="mt-1 text-sm text-amber-800 list-disc list-inside">
                {draft.document.gaps.map((g, i) => <li key={`g${i}`}>{g}</li>)}
                {draft.dropped_items.map((d, i) => (
                  <li key={`d${i}`}>{d} — not in your catalogue, left off</li>
                ))}
              </ul>
              <p className="text-xs text-amber-700 mt-2">
                These notes are for you. They are not printed on the agreement.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between no-print">
            <p className="text-sm text-gray-500">
              {draft.document.scopes.length} scope{draft.document.scopes.length === 1 ? "" : "s"} ·{" "}
              {usd(draft.document.total)} total
              {draft.attempts > 1 ? ` · drafted on attempt ${draft.attempts}` : ""}
            </p>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D1B2A] hover:bg-[#16293d] text-white rounded-xl text-sm font-medium"
            >
              <FileText className="w-4 h-4" /> Print / Save as PDF
            </button>
          </div>

          <div className="bg-gray-100 p-6 rounded-xl overflow-x-auto">
            <AgreementDocument doc={draft.document} />
          </div>

          {/* Internal build-up: how each scope price was reached. Never printed. */}
          <details className="bg-white rounded-xl border border-gray-200 p-4 no-print">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer">
              How these prices were built (internal — not shown to the customer)
            </summary>
            <div className="mt-3 space-y-4">
              {draft.document.scopes.map((sc, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-gray-900">
                    Scope {i + 1} — {sc.title}: {usd(sc.price)}
                  </p>
                  <table className="w-full text-xs mt-1">
                    <tbody>
                      {sc.line_items.map((l, k) => (
                        <tr key={k} className="border-b border-gray-100">
                          <td className="py-1 text-gray-700">{l.name}</td>
                          <td className="py-1 text-right text-gray-500 w-16">{l.quantity}</td>
                          <td className="py-1 text-right text-gray-500 w-24">{usd(l.unit_cost)}</td>
                          <td className="py-1 text-right text-gray-900 w-28">{usd(l.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </details>
        </>
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
