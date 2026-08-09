"use client";

import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import Nfpa72Document from "@/components/inspection/Nfpa72Document";
import {
  Nfpa72Form,
  DeviceRow,
  TestRow,
  NotifyRow,
  SignalRow,
  TRANSMISSION_TYPES,
  SERVICE_FREQUENCIES,
  BATTERY_TYPES,
  emptyNfpa72Form,
  emptyDeviceTestRow,
  nfpa72Completeness,
} from "@/lib/nfpa72";

// The fill-in side of the Inspection and Testing Form.
//
// It is split into the same seven sections as the printed pages so a tech
// working down the paper form finds the fields in the order they expect, and
// the Preview tab is the actual document component — not a mockup of it — so
// what they check before printing is what prints.

const TABS = [
  "Identification",
  "Devices",
  "Circuits & Power",
  "Tests",
  "Device Log",
  "Systems",
  "Sign-Off",
  "Preview",
] as const;

// ── field primitives ──────────────────────────────────────────────────────

function Text({
  label,
  value,
  onChange,
  placeholder,
  className = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
      />
    </label>
  );
}

function Box({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
      />
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}

/** Yes / No / unanswered — clicking the active pill clears it back to blank. */
function YesNo({
  value,
  onChange,
}: {
  value: "" | "yes" | "no";
  onChange: (v: "" | "yes" | "no") => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
      {(["yes", "no"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(value === v ? "" : v)}
          className={`px-2.5 py-1 text-xs font-medium capitalize ${
            value === v
              ? v === "yes"
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-white"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h3>
      {children}
    </div>
  );
}

function OptionRow({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(value === o ? "" : o)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
            value === o
              ? "bg-orange-600 border-orange-600 text-white"
              : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** Shared editor for the three quantity/style/tested device tables. */
function DeviceTable({
  rows,
  onChange,
  typeLabel,
}: {
  rows: DeviceRow[];
  onChange: (rows: DeviceRow[]) => void;
  typeLabel: string;
}) {
  const set = (i: number, key: keyof DeviceRow, v: string) => {
    const next = rows.map((r, j) => (i === j ? { ...r, [key]: v } : r));
    onChange(next);
  };
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500 uppercase tracking-wide">
            <th className="text-left font-semibold py-1.5 px-1">{typeLabel}</th>
            <th className="font-semibold py-1.5 px-1 w-24">Installed</th>
            <th className="font-semibold py-1.5 px-1 w-24">Style</th>
            <th className="font-semibold py-1.5 px-1 w-24">Tested</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-gray-100">
              <td className="py-1.5 px-1 text-gray-800">
                {r.specify !== undefined ? (
                  <input
                    value={r.specify}
                    placeholder={r.label}
                    onChange={(e) => set(i, "specify", e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                ) : (
                  r.label
                )}
              </td>
              {(["qty_installed", "circuit_style", "qty_tested"] as const).map((k) => (
                <td key={k} className="py-1.5 px-1">
                  <input
                    value={r[k]}
                    onChange={(e) => set(i, k, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Shared editor for the visual/functional/comments tables. */
function TestTable({ rows, onChange }: { rows: TestRow[]; onChange: (rows: TestRow[]) => void }) {
  const set = (i: number, patch: Partial<TestRow>) =>
    onChange(rows.map((r, j) => (i === j ? { ...r, ...patch } : r)));
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500 uppercase tracking-wide">
            <th className="text-left font-semibold py-1.5 px-1">Type</th>
            <th className="font-semibold py-1.5 px-1 w-16">Visual</th>
            <th className="font-semibold py-1.5 px-1 w-20">Functional</th>
            <th className="text-left font-semibold py-1.5 px-1">Comments</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-gray-100">
              <td className="py-1.5 px-1 text-gray-800">{r.label}</td>
              <td className="py-1.5 px-1 text-center">
                <Box checked={r.visual} onChange={(v) => set(i, { visual: v })} />
              </td>
              <td className="py-1.5 px-1 text-center">
                <Box checked={r.functional} onChange={(v) => set(i, { functional: v })} />
              </td>
              <td className="py-1.5 px-1">
                <input
                  value={r.comments}
                  onChange={(e) => set(i, { comments: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NotifyTable({
  rows,
  onChange,
}: {
  rows: NotifyRow[];
  onChange: (rows: NotifyRow[]) => void;
}) {
  const set = (i: number, patch: Partial<NotifyRow>) =>
    onChange(rows.map((r, j) => (i === j ? { ...r, ...patch } : r)));
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500 uppercase tracking-wide">
            <th className="text-left font-semibold py-1.5 px-1">Notified</th>
            <th className="font-semibold py-1.5 px-1 w-28">Yes / No</th>
            <th className="text-left font-semibold py-1.5 px-1">Who</th>
            <th className="text-left font-semibold py-1.5 px-1 w-32">Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-gray-100">
              <td className="py-1.5 px-1 text-gray-800">{r.label}</td>
              <td className="py-1.5 px-1 text-center">
                <YesNo value={r.answer} onChange={(v) => set(i, { answer: v })} />
              </td>
              <td className="py-1.5 px-1">
                <input
                  value={r.who}
                  onChange={(e) => set(i, { who: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </td>
              <td className="py-1.5 px-1">
                <input
                  value={r.time}
                  onChange={(e) => set(i, { time: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SignalTable({
  rows,
  onChange,
}: {
  rows: SignalRow[];
  onChange: (rows: SignalRow[]) => void;
}) {
  const set = (i: number, patch: Partial<SignalRow>) =>
    onChange(rows.map((r, j) => (i === j ? { ...r, ...patch } : r)));
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500 uppercase tracking-wide">
            <th className="text-left font-semibold py-1.5 px-1">Signal</th>
            <th className="font-semibold py-1.5 px-1 w-28">Yes / No</th>
            <th className="text-left font-semibold py-1.5 px-1 w-32">Time</th>
            <th className="text-left font-semibold py-1.5 px-1">Comments</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-gray-100">
              <td className="py-1.5 px-1 text-gray-800">{r.label}</td>
              <td className="py-1.5 px-1 text-center">
                <YesNo value={r.answer} onChange={(v) => set(i, { answer: v })} />
              </td>
              <td className="py-1.5 px-1">
                <input
                  value={r.time}
                  onChange={(e) => set(i, { time: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </td>
              <td className="py-1.5 px-1">
                <input
                  value={r.comments}
                  onChange={(e) => set(i, { comments: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────

export default function Nfpa72Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [form, setForm] = useState<Nfpa72Form | null>(null);
  const [meta, setMeta] = useState<{ inspection_number?: string; customer_name?: string } | null>(
    null
  );
  const [tab, setTab] = useState<(typeof TABS)[number]>("Identification");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [migrationRequired, setMigrationRequired] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/inspections/${id}/nfpa72`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not load the report");
        setForm(json.data.form);
        setMeta(json.data.inspection);
        setMigrationRequired(!!json.data.migration_required);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load the report");
        setForm(emptyNfpa72Form());
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /** Mutate a copy of the form — keeps the deeply nested updates readable. */
  const patch = useCallback((fn: (draft: Nfpa72Form) => void) => {
    setForm((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
    setDirty(true);
  }, []);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/inspections/${id}/nfpa72`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      setDirty(false);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Leaving with unsaved edits loses a whole inspection's worth of typing.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (!form) return null;

  const progress = nfpa72Completeness(form);
  const pct = Math.round((progress.done / progress.total) * 100);

  return (
    <div className="space-y-5">
      {/* ── action bar ─────────────────────────────────────────── */}
      <div className="no-print">
        <Link
          href={`/admin/inspections/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to inspection
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inspection &amp; Testing Report</h1>
            <p className="text-gray-600 text-sm mt-0.5">
              NFPA 72, Fig. 10.6.2.3
              {meta?.customer_name ? ` · ${meta.customer_name}` : ""}
              {meta?.inspection_number ? ` · ${meta.inspection_number}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {savedAt && !dirty && (
              <span className="text-xs text-green-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved {savedAt}
              </span>
            )}
            <button
              onClick={save}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {dirty ? "Save report" : "Saved"}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {migrationRequired && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Reports can be filled in and printed, but <strong>not saved</strong> yet — the{" "}
              <code className="font-mono text-xs">nfpa72_form</code> column is missing. Run{" "}
              <code className="font-mono text-xs">
                supabase/migrations/20260808_nfpa72_form.sql
              </code>{" "}
              to turn on saving.
            </span>
          </div>
        )}

        {/* completeness — an unfinished form should not reach a fire marshal
            without the tech knowing it is unfinished */}
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Required fields
            </span>
            <span className={`text-sm font-bold ${pct === 100 ? "text-green-600" : "text-orange-600"}`}>
              {progress.done} of {progress.total}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct === 100 ? "bg-green-600" : "bg-orange-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {progress.missing.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Still needed: <span className="text-gray-700">{progress.missing.join(", ")}</span>
            </p>
          )}
        </div>

        {/* ── tabs ─────────────────────────────────────────────── */}
        <div className="mt-4 flex gap-1 overflow-x-auto border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${
                tab === t
                  ? "border-orange-600 text-orange-700"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── panels ───────────────────────────────────────────────── */}
      {tab === "Identification" && (
        <div className="no-print grid gap-4 lg:grid-cols-2">
          <Card title="Inspection">
            <div className="grid grid-cols-2 gap-3">
              <Text label="Date" type="date" value={form.date} onChange={(v) => patch((d) => (d.date = v))} />
              <Text label="Time" value={form.time} onChange={(v) => patch((d) => (d.time = v))} placeholder="10:00 AM" />
            </div>
            <div className="mt-3">
              <span className="block text-xs font-medium text-gray-600 mb-1.5">Service frequency</span>
              <OptionRow
                options={SERVICE_FREQUENCIES}
                value={form.service_frequency}
                onChange={(v) => patch((d) => (d.service_frequency = v))}
              />
              <div className="mt-2">
                <Text
                  label="Other (specify)"
                  value={form.service_other}
                  onChange={(v) => patch((d) => (d.service_other = v))}
                />
              </div>
            </div>
          </Card>

          <Card title="Property (User)">
            <div className="space-y-3">
              <Text label="Name" value={form.property.name} onChange={(v) => patch((d) => (d.property.name = v))} />
              <Text label="Address" value={form.property.address} onChange={(v) => patch((d) => (d.property.address = v))} />
              <div className="grid grid-cols-2 gap-3">
                <Text label="Owner contact" value={form.property.owner_contact} onChange={(v) => patch((d) => (d.property.owner_contact = v))} />
                <Text label="Telephone" value={form.property.telephone} onChange={(v) => patch((d) => (d.property.telephone = v))} />
              </div>
            </div>
          </Card>

          <Card title="Service Organization">
            <div className="space-y-3">
              <Text label="Name" value={form.service_org.name} onChange={(v) => patch((d) => (d.service_org.name = v))} />
              <Text label="Address" value={form.service_org.address} onChange={(v) => patch((d) => (d.service_org.address = v))} />
              <div className="grid grid-cols-3 gap-3">
                <Text label="Representative" value={form.service_org.representative} onChange={(v) => patch((d) => (d.service_org.representative = v))} />
                <Text label="License no." value={form.service_org.license_no} onChange={(v) => patch((d) => (d.service_org.license_no = v))} />
                <Text label="Telephone" value={form.service_org.telephone} onChange={(v) => patch((d) => (d.service_org.telephone = v))} />
              </div>
            </div>
          </Card>

          <Card title="Monitoring Entity">
            <div className="space-y-3">
              <Text label="Contact" value={form.monitoring.contact} onChange={(v) => patch((d) => (d.monitoring.contact = v))} />
              <div className="grid grid-cols-2 gap-3">
                <Text label="Telephone" value={form.monitoring.telephone} onChange={(v) => patch((d) => (d.monitoring.telephone = v))} />
                <Text label="Account ref. no." value={form.monitoring.account_ref} onChange={(v) => patch((d) => (d.monitoring.account_ref = v))} />
              </div>
            </div>
          </Card>

          <Card title="Approving Agency">
            <div className="grid grid-cols-2 gap-3">
              <Text label="Contact" value={form.approving_agency.contact} onChange={(v) => patch((d) => (d.approving_agency.contact = v))} />
              <Text label="Telephone" value={form.approving_agency.telephone} onChange={(v) => patch((d) => (d.approving_agency.telephone = v))} />
            </div>
          </Card>

          <Card title="Type of Transmission">
            <div className="flex flex-wrap gap-2">
              {TRANSMISSION_TYPES.map((t) => {
                const on = form.transmission.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      patch((d) => {
                        d.transmission = on
                          ? d.transmission.filter((x) => x !== t)
                          : [...d.transmission, t];
                      })
                    }
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                      on
                        ? "bg-orange-600 border-orange-600 text-white"
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <div className="mt-3">
              <Text label="Other (specify)" value={form.transmission_other} onChange={(v) => patch((d) => (d.transmission_other = v))} />
            </div>
          </Card>

          <Card title="Fire Alarm Control Unit">
            <div className="grid grid-cols-2 gap-3">
              <Text label="Manufacturer" value={form.control_unit.manufacturer} onChange={(v) => patch((d) => (d.control_unit.manufacturer = v))} />
              <Text label="Model no." value={form.control_unit.model_no} onChange={(v) => patch((d) => (d.control_unit.model_no = v))} />
              <Text label="Circuit styles" value={form.control_unit.circuit_styles} onChange={(v) => patch((d) => (d.control_unit.circuit_styles = v))} />
              <Text label="Number of circuits" value={form.control_unit.number_of_circuits} onChange={(v) => patch((d) => (d.control_unit.number_of_circuits = v))} />
              <Text label="Software rev." value={form.control_unit.software_rev} onChange={(v) => patch((d) => (d.control_unit.software_rev = v))} />
            </div>
          </Card>

          <Card title="Service History">
            <div className="space-y-3">
              <Text label="Last date system had any service performed" value={form.last_service_date} onChange={(v) => patch((d) => (d.last_service_date = v))} />
              <Text label="Last date software or configuration was revised" value={form.last_config_revision_date} onChange={(v) => patch((d) => (d.last_config_revision_date = v))} />
            </div>
          </Card>
        </div>
      )}

      {tab === "Devices" && (
        <div className="no-print space-y-4">
          <Card title="Alarm-Initiating Devices and Circuit Information">
            <DeviceTable
              rows={form.initiating}
              typeLabel="Device"
              onChange={(rows) => patch((d) => (d.initiating = rows))}
            />
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Alarm verification feature is</span>
              <OptionRow
                options={["disabled", "enabled"]}
                value={form.alarm_verification}
                onChange={(v) => patch((d) => (d.alarm_verification = v))}
              />
            </div>
          </Card>

          <Card title="Alarm Notification Appliances and Circuit Information">
            <DeviceTable
              rows={form.notification}
              typeLabel="Appliance"
              onChange={(rows) => patch((d) => (d.notification = rows))}
            />
            <div className="mt-4 grid sm:grid-cols-2 gap-4 items-end">
              <Text
                label="No. of alarm notification appliance circuits"
                value={form.nac_circuit_count}
                onChange={(v) => patch((d) => (d.nac_circuit_count = v))}
              />
              <div>
                <span className="block text-xs font-medium text-gray-600 mb-1.5">
                  Are circuits monitored for integrity?
                </span>
                <YesNo
                  value={form.circuits_monitored}
                  onChange={(v) => patch((d) => (d.circuits_monitored = v))}
                />
              </div>
            </div>
          </Card>

          <Card title="Supervisory Signal-Initiating Devices">
            <DeviceTable
              rows={form.supervisory}
              typeLabel="Device"
              onChange={(rows) => patch((d) => (d.supervisory = rows))}
            />
          </Card>
        </div>
      )}

      {tab === "Circuits & Power" && (
        <div className="no-print space-y-4">
          <Card title="Signaling Line Circuits">
            <p className="text-xs text-gray-500 mb-3">
              Quantity and style of signaling line circuits connected to system (NFPA 72, Table 6.6.1)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Text label="Quantity" value={form.slc.quantity} onChange={(v) => patch((d) => (d.slc.quantity = v))} />
              <Text label="Style(s)" value={form.slc.styles} onChange={(v) => patch((d) => (d.slc.styles = v))} />
            </div>
          </Card>

          <Card title="Primary (Main) Power">
            <div className="grid sm:grid-cols-4 gap-3">
              <Text label="Nominal voltage" value={form.power.primary_voltage} onChange={(v) => patch((d) => (d.power.primary_voltage = v))} />
              <Text label="Amps" value={form.power.primary_amps} onChange={(v) => patch((d) => (d.power.primary_amps = v))} />
              <Text label="Overcurrent type" value={form.power.overcurrent_type} onChange={(v) => patch((d) => (d.power.overcurrent_type = v))} />
              <Text label="Overcurrent amps" value={form.power.overcurrent_amps} onChange={(v) => patch((d) => (d.power.overcurrent_amps = v))} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <Text label="Location of primary supply panelboard" value={form.power.panelboard_location} onChange={(v) => patch((d) => (d.power.panelboard_location = v))} />
              <Text label="Disconnecting means location" value={form.power.disconnect_location} onChange={(v) => patch((d) => (d.power.disconnect_location = v))} />
            </div>
          </Card>

          <Card title="Secondary (Standby) Power">
            <div className="grid sm:grid-cols-4 gap-3">
              <Text label="Nominal voltage" value={form.power.secondary_voltage} onChange={(v) => patch((d) => (d.power.secondary_voltage = v))} />
              <Text label="Battery amp-hr rating" value={form.power.battery_amp_hr} onChange={(v) => patch((d) => (d.power.battery_amp_hr = v))} />
              <Text label="Calculated capacity (amp-hrs)" value={form.power.calculated_capacity} onChange={(v) => patch((d) => (d.power.calculated_capacity = v))} />
              <Text label="To operate system for (hours)" value={form.power.capacity_hours} onChange={(v) => patch((d) => (d.power.capacity_hours = v))} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <Text label="Engine-driven generator dedicated to fire alarm" value={form.power.generator} onChange={(v) => patch((d) => (d.power.generator = v))} />
              <Text label="Location of fuel storage" value={form.power.fuel_storage} onChange={(v) => patch((d) => (d.power.fuel_storage = v))} />
            </div>
            <div className="mt-4">
              <span className="block text-xs font-medium text-gray-600 mb-1.5">Type of battery</span>
              <OptionRow
                options={BATTERY_TYPES}
                value={form.battery_type}
                onChange={(v) => patch((d) => (d.battery_type = v))}
              />
              {form.battery_type === "Other" && (
                <div className="mt-2">
                  <Text label="Other (specify)" value={form.battery_other} onChange={(v) => patch((d) => (d.battery_other = v))} />
                </div>
              )}
            </div>
          </Card>

          <Card title="Emergency or Standby System Used as Backup to Primary Power">
            <div className="space-y-2">
              {[
                ["700", "Emergency system described in NFPA 70, Article 700"],
                ["701", "Legally required standby described in NFPA 70, Article 701"],
                ["702", "Optional standby described in NFPA 70, Article 702 meeting Art. 700 or 701"],
              ].map(([code, label]) => (
                <label key={code} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="standby"
                    checked={form.standby_article === code}
                    onChange={() => patch((d) => (d.standby_article = code))}
                    className="mt-0.5 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
              {form.standby_article && (
                <button
                  type="button"
                  onClick={() => patch((d) => (d.standby_article = ""))}
                  className="text-xs text-gray-500 hover:text-gray-800 underline"
                >
                  Clear — no standby system used
                </button>
              )}
            </div>
          </Card>
        </div>
      )}

      {tab === "Tests" && (
        <div className="no-print space-y-4">
          <Card title="Prior to Any Testing — Notifications Made">
            <NotifyTable
              rows={form.pre_test_notifications}
              onChange={(rows) => patch((d) => (d.pre_test_notifications = rows))}
            />
          </Card>
          <Card title="System Tests and Inspections">
            <TestTable rows={form.system_tests} onChange={(rows) => patch((d) => (d.system_tests = rows))} />
          </Card>
          <Card title="Secondary Power and Appliance Tests">
            <TestTable
              rows={form.secondary_power_tests}
              onChange={(rows) => patch((d) => (d.secondary_power_tests = rows))}
            />
          </Card>
        </div>
      )}

      {tab === "Device Log" && (
        <div className="no-print space-y-4">
          <Card title="Initiating and Supervisory Device Tests and Inspections">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[820px]">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wide">
                    <th className="text-left font-semibold py-1.5 px-1">Loc. &amp; S/N</th>
                    <th className="text-left font-semibold py-1.5 px-1">Device type</th>
                    <th className="font-semibold py-1.5 px-1 w-14">Vis.</th>
                    <th className="font-semibold py-1.5 px-1 w-16">Func.</th>
                    <th className="text-left font-semibold py-1.5 px-1">Factory</th>
                    <th className="text-left font-semibold py-1.5 px-1">Measured</th>
                    <th className="font-semibold py-1.5 px-1 w-32">Result</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {form.device_tests.map((r, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      {(["location", "device_type"] as const).map((k) => (
                        <td key={k} className="py-1.5 px-1">
                          <input
                            value={r[k]}
                            onChange={(e) =>
                              patch((d) => {
                                d.device_tests[i][k] = e.target.value;
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                          />
                        </td>
                      ))}
                      <td className="py-1.5 px-1 text-center">
                        <Box
                          checked={r.visual}
                          onChange={(v) => patch((d) => (d.device_tests[i].visual = v))}
                        />
                      </td>
                      <td className="py-1.5 px-1 text-center">
                        <Box
                          checked={r.functional}
                          onChange={(v) => patch((d) => (d.device_tests[i].functional = v))}
                        />
                      </td>
                      {(["factory_setting", "measured_setting"] as const).map((k) => (
                        <td key={k} className="py-1.5 px-1">
                          <input
                            value={r[k]}
                            onChange={(e) =>
                              patch((d) => {
                                d.device_tests[i][k] = e.target.value;
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                          />
                        </td>
                      ))}
                      <td className="py-1.5 px-1">
                        <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
                          {(["pass", "fail"] as const).map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() =>
                                patch((d) => (d.device_tests[i].result = r.result === v ? "" : v))
                              }
                              className={`px-2.5 py-1 text-xs font-medium capitalize ${
                                r.result === v
                                  ? v === "pass"
                                    ? "bg-green-600 text-white"
                                    : "bg-red-600 text-white"
                                  : "bg-white text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-1.5 px-1">
                        <button
                          type="button"
                          onClick={() => patch((d) => d.device_tests.splice(i, 1))}
                          className="text-gray-300 hover:text-red-600"
                          aria-label="Remove row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => patch((d) => d.device_tests.push(emptyDeviceTestRow()))}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              <Plus className="w-4 h-4" /> Add device row
            </button>
            <div className="mt-4">
              <Area
                label="Comments"
                value={form.device_tests_comments}
                onChange={(v) => patch((d) => (d.device_tests_comments = v))}
              />
            </div>
          </Card>
        </div>
      )}

      {tab === "Systems" && (
        <div className="no-print space-y-4">
          <Card title="Emergency Communications Equipment">
            <TestTable
              rows={form.emergency_comms}
              onChange={(rows) => patch((d) => (d.emergency_comms = rows))}
            />
          </Card>

          <Card title="Combination Systems">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[620px]">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wide">
                    <th className="text-left font-semibold py-1.5 px-1">System</th>
                    <th className="font-semibold py-1.5 px-1 w-16">Visual</th>
                    <th className="text-left font-semibold py-1.5 px-1">Device operation</th>
                    <th className="text-left font-semibold py-1.5 px-1">Simulated operation</th>
                  </tr>
                </thead>
                <tbody>
                  {form.combination_systems.map((r, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="py-1.5 px-1 text-gray-800">
                        {r.specify !== undefined ? (
                          <input
                            value={r.specify}
                            placeholder={r.label}
                            onChange={(e) =>
                              patch((d) => (d.combination_systems[i].specify = e.target.value))
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                          />
                        ) : (
                          r.label
                        )}
                      </td>
                      <td className="py-1.5 px-1 text-center">
                        <Box
                          checked={r.visual}
                          onChange={(v) => patch((d) => (d.combination_systems[i].visual = v))}
                        />
                      </td>
                      {(["device_operation", "simulated_operation"] as const).map((k) => (
                        <td key={k} className="py-1.5 px-1">
                          <input
                            value={r[k]}
                            onChange={(e) =>
                              patch((d) => {
                                d.combination_systems[i][k] = e.target.value;
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Interface Equipment">
              <div className="space-y-2">
                {form.interface_equipment.map((s, i) => (
                  <Text
                    key={i}
                    label={`(Specify) ${i + 1}`}
                    value={s}
                    onChange={(v) => patch((d) => (d.interface_equipment[i] = v))}
                  />
                ))}
              </div>
            </Card>
            <Card title="Special Hazard Systems">
              <div className="space-y-2">
                {form.special_hazard_systems.map((s, i) => (
                  <Text
                    key={i}
                    label={`(Specify) ${i + 1}`}
                    value={s}
                    onChange={(v) => patch((d) => (d.special_hazard_systems[i] = v))}
                  />
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Special Procedures">
              <Area
                label="Describe any special procedures"
                value={form.special_procedures}
                onChange={(v) => patch((d) => (d.special_procedures = v))}
              />
            </Card>
            <Card title="Comments">
              <Area
                label="Additional comments"
                value={form.page6_comments}
                onChange={(v) => patch((d) => (d.page6_comments = v))}
              />
            </Card>
          </div>
        </div>
      )}

      {tab === "Sign-Off" && (
        <div className="no-print space-y-4">
          <Card title="Supervising Station Monitoring">
            <SignalTable
              rows={form.supervising_station}
              onChange={(rows) => patch((d) => (d.supervising_station = rows))}
            />
          </Card>

          <Card title="Notifications That Testing Is Complete">
            <NotifyTable
              rows={form.post_test_notifications}
              onChange={(rows) => patch((d) => (d.post_test_notifications = rows))}
            />
          </Card>

          <Card title="Results">
            <Area
              label="The following did not operate correctly"
              value={form.did_not_operate}
              onChange={(v) => patch((d) => (d.did_not_operate = v))}
            />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Text
                label="System restored to normal operation — date"
                type="date"
                value={form.restored.date}
                onChange={(v) => patch((d) => (d.restored.date = v))}
              />
              <Text
                label="Time"
                value={form.restored.time}
                onChange={(v) => patch((d) => (d.restored.time = v))}
              />
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {(
              [
                ["Inspector", "inspector"],
                ["Owner or Representative", "owner_rep"],
              ] as const
            ).map(([title, key]) => (
              <Card key={key} title={title}>
                <div className="space-y-3">
                  <Text
                    label="Name"
                    value={form[key].name}
                    onChange={(v) => patch((d) => (d[key].name = v))}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Text
                      label="Date"
                      type="date"
                      value={form[key].date}
                      onChange={(v) => patch((d) => (d[key].date = v))}
                    />
                    <Text
                      label="Time"
                      value={form[key].time}
                      onChange={(v) => patch((d) => (d[key].time = v))}
                    />
                  </div>
                  <Text
                    label="Signature — type full name to sign"
                    value={form[key].signature}
                    onChange={(v) => patch((d) => (d[key].signature = v))}
                  />
                </div>
              </Card>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            Typing a name in the signature field certifies the testing was performed in accordance
            with applicable NFPA standards. It prints in script on the last page.
          </p>
        </div>
      )}

      {/* The preview is the real document — the same component that prints, so
          there is no gap between what is checked and what is issued. Kept
          mounted at all times so Print works from any tab. */}
      <div className={tab === "Preview" ? "block" : "hidden print:block"}>
        <div className="bg-gray-100 py-6 print:bg-white print:py-0 -mx-4 px-4 print:mx-0 print:px-0 overflow-x-auto">
          <Nfpa72Document form={form} inspectionNumber={meta?.inspection_number} />
        </div>
      </div>
    </div>
  );
}
