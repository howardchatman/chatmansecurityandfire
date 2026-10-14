"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  FileText,
  Save,
  Building2,
  Trash2,
  Plus,
  Send,
  Copy,
  CheckCircle2,
  Paperclip,
  X,
} from "lucide-react";

interface Customer { id: string; name: string; company: string | null; city: string | null }

import AgreementDocument from "@/components/proposal/AgreementDocument";
import type { ProposalDocument } from "@/lib/proposal-doc";

interface DraftUsage {
  model: string;
  effort: string;
  mode: "standard" | "thorough";
  cost_usd: number;
  approximate?: boolean;
}

interface DraftFile { path: string; name: string; type: string }

interface Draft {
  document: ProposalDocument;
  dropped_items: string[];
  attempts: number;
  usage?: DraftUsage;
  files?: DraftFile[];
}

/** A plan set or photo being attached to the next draft. */
interface Upload {
  key: string;
  name: string;
  type: string;
  size: number;
  status: "uploading" | "ready" | "error";
  path?: string;
  error?: string;
}

const READABLE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_UPLOADS = 10;
const mb = (n: number) => `${(n / 1024 / 1024).toFixed(n < 1024 * 1024 ? 2 : 1)} MB`;

interface SentInfo {
  quote_number: string;
  link_url: string;
  email: string;
  sent_at: string;
  emailed: boolean;
}

const EFFORT_LABEL: Record<string, string> = { high: "high effort", xhigh: "extra-high effort" };

/** "31¢" under a dollar, "$1.24" above. */
const cost = (n: number) => (n < 1 ? `${Math.max(1, Math.round(n * 100))}¢` : `$${n.toFixed(2)}`);

// Thorough drafts run in Anthropic's batch queue; check back this often.
const POLL_MS = 15_000;

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
  // The proposal_history row this draft is saved as, once saved or reopened.
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedFor, setSavedFor] = useState<string>("");
  // Thorough mode: extra-high effort, run in the background.
  const [thorough, setThorough] = useState(false);
  // The saved row of a thorough draft that is still being written.
  const [pendingId, setPendingId] = useState<string | null>(null);
  // Set once the draft has been emailed to the customer as a quote.
  const [sent, setSent] = useState<SentInfo | null>(null);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const uploading = uploads.some((u) => u.status === "uploading");
  const readyFiles = uploads
    .filter((u) => u.status === "ready" && u.path)
    .map((u) => ({ path: u.path!, name: u.name, type: u.type }));
  // Saved, and still pointing at the customer it was saved for.
  const isSaved = !!savedId && !!customerId && savedFor === customerId;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        if (data.success) setCustomers(data.data || []);
      } catch { /* the picker just stays empty */ }
    })();
  }, []);

  // /admin/proposals/draft?id=… reopens a saved draft — the link the
  // customer page's Proposals tab uses.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/proposal-agent/proposals?id=${encodeURIComponent(id)}`);
        const json = await res.json();
        const pd = json.data?.proposal_data as
          | (Draft & { customer_id?: string | null; description?: string; pending?: { error?: string } })
          | null;
        if (res.ok && pd?.pending) {
          setCustomerId(pd.customer_id || json.data.customer_id || "");
          setDescription(pd.description || "");
          setSavedId(json.data.id);
          setSavedFor(pd.customer_id || json.data.customer_id || "");
          if (pd.pending.error) setError(pd.pending.error);
          else {
            setPendingId(json.data.id);
            setNotice("This Thorough draft is still being written. It will appear here when it's ready.");
          }
          return;
        }
        if (!res.ok || !pd?.document) {
          setError(json.error || "That saved proposal couldn't be opened.");
          return;
        }
        setDraft({
          document: pd.document,
          dropped_items: pd.dropped_items || [],
          attempts: pd.attempts || 1,
          usage: pd.usage,
          files: pd.files,
        });
        setSent((pd as { sent?: SentInfo }).sent || null);
        setCustomerId(pd.customer_id || json.data.customer_id || "");
        setDescription(pd.description || "");
        setSavedId(json.data.id);
        setSavedFor(pd.customer_id || json.data.customer_id || "");
        setNotice("Opened a saved draft.");
      } catch {
        setError("That saved proposal couldn't be opened.");
      }
    })();
  }, []);

  // Check on a thorough draft until it's done (or fails).
  useEffect(() => {
    if (!pendingId) return;
    let stopped = false;
    const check = async () => {
      try {
        const res = await fetch(`/api/proposal-agent/generate?id=${encodeURIComponent(pendingId)}`);
        const json = await res.json().catch(() => null);
        if (stopped || !json) return;
        if (json.success && !json.data.pending) {
          const d = json.data.draft as Draft;
          setDraft({
            document: d.document,
            dropped_items: d.dropped_items || [],
            attempts: d.attempts || 1,
            usage: d.usage,
            files: d.files,
          });
          setPendingId(null);
          setNotice("Your Thorough draft is ready. It's saved in the customer's file under Proposals.");
        } else if (!json.success && !json.retry) {
          setPendingId(null);
          setNotice("");
          setError(json.error || "The Thorough draft failed. Start it again.");
        }
      } catch {
        /* network blip: try again next tick */
      }
    };
    check();
    const timer = setInterval(check, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [pendingId]);

  const patchUpload = (key: string, patch: Partial<Upload>) =>
    setUploads((prev) => prev.map((u) => (u.key === key ? { ...u, ...patch } : u)));

  // Each file goes straight from the browser to storage through a one-time
  // signed URL, so big plan sets never hit the server's request size limit.
  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const room = MAX_UPLOADS - uploads.length;
    const picked = Array.from(list).slice(0, Math.max(0, room));
    if (list.length > picked.length) setError(`Up to ${MAX_UPLOADS} files per draft.`);
    for (const file of picked) {
      const key = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const base: Upload = { key, name: file.name, type: file.type, size: file.size, status: "uploading" };
      if (!READABLE_TYPES.includes(file.type)) {
        setUploads((prev) => [
          ...prev,
          { ...base, status: "error", error: "Only PDF, JPG, PNG, WebP, or GIF. Save iPhone (HEIC) photos as JPG." },
        ]);
        continue;
      }
      setUploads((prev) => [...prev, base]);
      (async () => {
        try {
          const res = await fetch("/api/proposal-agent/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: file.name, type: file.type, size: file.size }),
          });
          const json = await res.json().catch(() => null);
          if (!json?.success) throw new Error(json?.error || "Couldn't start the upload.");
          const form = new FormData();
          form.append("cacheControl", "3600");
          form.append("", file);
          const put = await fetch(json.data.signedUrl, {
            method: "PUT",
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
              "x-upsert": "false",
            },
            body: form,
          });
          if (!put.ok) throw new Error(`Upload failed (HTTP ${put.status}).`);
          patchUpload(key, { status: "ready", path: json.data.path });
        } catch (e) {
          patchUpload(key, { status: "error", error: e instanceof Error ? e.message : "Upload failed." });
        }
      })();
    }
  };

  const generate = async () => {
    setError(""); setNotice(""); setGenerating(true); setDraft(null); setSavedId(null); setPendingId(null); setSent(null);
    try {
      const res = await fetch("/api/proposal-agent/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: customerId || undefined, description, thorough, files: readyFiles }),
      });
      // A platform timeout or crash comes back as an HTML page, not JSON.
      const data = await res.json().catch(() => null);
      if (!data) {
        setError(
          res.status === 504 || res.status === 408
            ? "The draft took too long and the server stopped it. Try again, or split a big job into two drafts."
            : `The proposal service failed (HTTP ${res.status}). Try again in a minute.`
        );
        return;
      }
      if (!data.success) { setError(data.error || "Couldn't draft the proposal."); return; }
      if (data.data.pending) {
        // Already saved to the customer's file; it fills in when the batch finishes.
        setSavedId(data.data.id);
        setSavedFor(customerId);
        setPendingId(data.data.id);
        setNotice(
          "Thorough draft started. It usually takes a few minutes, sometimes longer. You can leave this page; it will be saved in the customer's file under Proposals."
        );
        return;
      }
      setDraft(data.data);
    } catch {
      setError("Couldn't reach the proposal service. Check your connection and try again.");
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
          customer_id: customerId || null,
          status: "draft",
          total: draft.document.total,
          proposal_type: "ai_draft",
          filename: draft.document.project_name,
          proposal_data: { ...draft, customer_id: customerId || null, description },
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error || "Couldn't save the proposal."); return; }
      setSavedId(data.data?.id || null);
      setSavedFor(customerId);
      setNotice(
        customerId
          ? "Saved. It's on the customer's page under Proposals."
          : "Saved, but not linked to a customer. Pick a customer and save again to put it in their file."
      );
    } catch {
      setError("Couldn't save the proposal.");
    } finally {
      setSaving(false);
    }
  };

  // Anything left unpriced prints "PRICING INCOMPLETE" on the agreement; the
  // server refuses to send it, so don't offer to.
  const unpricedCount = draft ? draft.document.scopes.reduce((n, s) => n + (s.unpriced?.length || 0), 0) : 0;

  const send = async () => {
    if (!draft || !savedId) return;
    const warnings = draft.document.gaps.length + draft.dropped_items.length;
    const ok = window.confirm(
      `${sent ? "Resend" : "Email"} this proposal (${usd(draft.document.total)}) to the customer with a link to review and sign it?` +
        (warnings ? `

Note: ${warnings} item(s) were flagged as missing from your catalogue and are not in the price.` : "")
    );
    if (!ok) return;
    setSending(true); setError(""); setNotice("");
    try {
      const res = await fetch("/api/proposal-agent/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal_id: savedId }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.success) {
        setError(json?.error || "Couldn't send the proposal.");
        return;
      }
      setSent(json.data);
      setNotice(
        json.data.emailed
          ? `Sent to ${json.data.email} as quote ${json.data.quote_number}. You'll get an email when they sign.`
          : `Quote ${json.data.quote_number} is ready, but the email didn't go out. Copy the link below and send it yourself.`
      );
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  const copyLink = async () => {
    if (!sent) return;
    await navigator.clipboard.writeText(sent.link_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plans &amp; photos (optional)</label>
          <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 px-4 py-4 text-sm text-gray-600 cursor-pointer">
            <Paperclip className="w-4 h-4" />
            Attach plan sets (PDF) or site photos
            <input
              type="file"
              multiple
              accept=".pdf,image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Opus reads the drawings to count devices and check the scope. Up to 50 MB each, {MAX_UPLOADS} files. Large
            plan sets work best with Thorough.
          </p>
          {uploads.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {uploads.map((u) => (
                <li
                  key={u.key}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <span className="min-w-0 flex items-center gap-2">
                    {u.status === "uploading" && <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" />}
                    {u.status === "ready" && <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />}
                    {u.status === "error" && <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                    <span className="truncate text-gray-800">{u.name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{mb(u.size)}</span>
                    {u.error && <span className="text-xs text-red-600">{u.error}</span>}
                  </span>
                  <button
                    onClick={() => setUploads((prev) => prev.filter((x) => x.key !== u.key))}
                    className="text-gray-400 hover:text-gray-700 flex-shrink-0"
                    aria-label={`Remove ${u.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={thorough}
            onChange={(e) => setThorough(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-orange-600"
          />
          <span className="text-sm">
            <span className="font-medium text-gray-900">Thorough</span>
            <span className="text-gray-600">
              {" "}
              for big, multi-system jobs. Opus thinks longer (extra-high effort) and the draft runs in the background,
              usually a few minutes, at half price. Needs a customer selected.
            </span>
          </span>
        </label>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={generate}
            disabled={generating || !!pendingId || uploading || !description.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium"
          >
            {generating || pendingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {pendingId
              ? "Thorough draft in progress…"
              : generating
                ? "Drafting… (usually 1–2 minutes)"
                : thorough
                  ? "Start thorough draft"
                  : "Draft proposal"}
          </button>
          {draft && (
            <button
              onClick={save}
              disabled={saving || isSaved}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaved ? "Saved" : "Save draft"}
            </button>
          )}
          {draft && isSaved && (
            <button
              onClick={send}
              disabled={sending || unpricedCount > 0}
              title={unpricedCount > 0 ? "Price every item before sending" : undefined}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D1B2A] hover:bg-[#16293d] disabled:opacity-50 text-white rounded-xl text-sm font-medium"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sent ? "Resend to customer" : "Send to customer"}
            </button>
          )}
          {draft && !isSaved && !pendingId && (
            <span className="text-xs text-gray-500">Save the draft to a customer to send it.</span>
          )}
          {isSaved && (
            <Link href={`/admin/customers/${customerId}`} className="text-sm text-orange-600 hover:underline">
              Open customer file
            </Link>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        {notice && <div className="text-sm text-green-800 bg-green-50 rounded-lg px-3 py-2">{notice}</div>}
        {draft && isSaved && unpricedCount > 0 && (
          <p className="text-xs text-amber-700">
            {unpricedCount} item{unpricedCount === 1 ? " has" : "s have"} no price yet, so this can&apos;t be sent. Set the
            rate in Inventory, then draft it again.
          </p>
        )}
        {sent && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Quote {sent.quote_number} sent to {sent.email} on{" "}
              {new Date(sent.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <button onClick={copyLink} className="inline-flex items-center gap-1.5 text-orange-600 hover:underline">
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied" : "Copy sign link"}
            </button>
          </div>
        )}
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
              {draft.usage
                ? ` · Opus, ${EFFORT_LABEL[draft.usage.effort] || draft.usage.effort} · cost ${draft.usage.approximate ? "about " : ""}${cost(draft.usage.cost_usd)}`
                : ""}
              {draft.files?.length ? ` · read ${draft.files.length} attached file${draft.files.length === 1 ? "" : "s"}` : ""}
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

      {!draft && !generating && !pendingId && (
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
