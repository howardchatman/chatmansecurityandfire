"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, AlertTriangle } from "lucide-react";

// Add a lead by hand: a phone call, a referral, someone met on a job. Saved
// without the website's "new lead" alerts (you're the one entering it).

const SOURCES = [
  { value: "phone", label: "Phone call" },
  { value: "referral", label: "Referral" },
  { value: "general_contractor", label: "General contractor" },
  { value: "walk_in", label: "In person / on a job" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

const SERVICES = [
  "Fire alarm", "Fire sprinkler", "Fire extinguishers", "Emergency lighting", "Fire marshal corrections",
  "Security / access control", "Cameras", "Inspection", "Other",
];

const input = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500";

export default function NewLeadPage() {
  const router = useRouter();
  const [f, setF] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    source: "phone",
    serviceNeed: "",
    description: "",
    send_confirmation: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) return setError("Enter a name.");
    if (!f.phone.trim() && !f.email.trim()) return setError("Enter a phone number or an email.");
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entered_by_staff: true,
          name: f.name.trim(),
          phone: f.phone.trim() || undefined,
          email: f.email.trim() || undefined,
          source: f.source,
          serviceNeed: f.serviceNeed || undefined,
          message: [f.company.trim() && `Company: ${f.company.trim()}`, f.description.trim()].filter(Boolean).join("\n") || undefined,
          preferred_contact: f.phone.trim() ? "phone" : "email",
          send_confirmation: f.send_confirmation,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.error || `Couldn't save the lead (HTTP ${res.status}).`);
      router.push("/admin/leads");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the lead.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/leads" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600">
          <ArrowLeft className="w-4 h-4" /> Leads
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Add a lead</h1>
        <p className="text-gray-500 mt-1">For a call, a referral, or someone you met on a job.</p>
      </div>

      <form onSubmit={save} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {error && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Name *</span>
            <input className={input} value={f.name} onChange={set("name")} required />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Company</span>
            <input className={input} value={f.company} onChange={set("company")} />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Phone</span>
            <input className={input} type="tel" value={f.phone} onChange={set("phone")} placeholder="(713) 555-0100" />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Email</span>
            <input className={input} type="email" value={f.email} onChange={set("email")} />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">How they found us</span>
            <select className={input} value={f.source} onChange={set("source")}>
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">What they need</span>
            <select className={input} value={f.serviceNeed} onChange={set("serviceNeed")}>
              <option value="">Not sure yet</option>
              {SERVICES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1">Notes</span>
          <textarea className={input} rows={4} value={f.description} onChange={set("description")} placeholder="Site, building type, what failed, when they want it done…" />
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={f.send_confirmation}
            disabled={!f.email.trim()}
            onChange={(e) => setF({ ...f, send_confirmation: e.target.checked })}
            className="h-4 w-4 accent-orange-600"
          />
          Email them our &quot;we got your request&quot; confirmation
        </label>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save lead
          </button>
          <Link href="/admin/leads" className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
