"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Send, Briefcase, Printer, Copy, CheckCircle2, AlertTriangle } from "lucide-react";
import AgreementDocument from "@/components/proposal/AgreementDocument";
import type { ProposalDocument } from "@/lib/proposal-doc";

// One quote: who it's for, what's in it, where it stands, and the two things
// you do next (send it for signature, or turn a signed quote into a job).

interface LineItem {
  name?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  unit_price?: number;
  total?: number;
}
interface Quote {
  id: string;
  quote_number: string;
  quote_type: string;
  template_name?: string | null;
  status: string;
  customer?: { name?: string; company?: string; email?: string; phone?: string } | null;
  site?: { name?: string; address?: string; city?: string; state?: string; zip?: string } | null;
  line_items?: LineItem[] | null;
  totals?: { subtotal?: number; tax?: number; total?: number; grandTotal?: number; grand_total?: number } | null;
  terms?: { disclaimers?: string[]; proposal_document?: ProposalDocument | null } | null;
  created_at: string;
  expires_at?: string | null;
  accepted_at?: string | null;
  accepted_by?: string | null;
}

const usd = (n?: number | null) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
const day = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const STATUS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  viewed: "bg-purple-100 text-purple-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
  expired: "bg-orange-100 text-orange-700",
  paid: "bg-emerald-100 text-emerald-700",
};

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [link, setLink] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/quotes/${id}`);
      const json = await res.json().catch(() => null);
      if (!json?.success || !json.data) throw new Error(json?.error || "Quote not found.");
      setQuote(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Quote not found.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loader2 className="w-6 h-6 animate-spin text-orange-600" />;
  if (!quote) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-700">{error || "Quote not found."}</p>
        <Link href="/admin/quotes" className="text-orange-600 hover:underline text-sm">Back to quotes</Link>
      </div>
    );
  }

  const total = quote.totals?.total ?? quote.totals?.grandTotal ?? quote.totals?.grand_total ?? 0;
  const items = quote.line_items || [];
  const doc = quote.terms?.proposal_document || null;
  const email = quote.customer?.email;

  const send = async () => {
    if (!email) return setMessage({ ok: false, text: "This quote's customer has no email address." });
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/customer-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote_id: quote.id,
          customer_email: email,
          customer_name: quote.customer?.name,
          customer_phone: quote.customer?.phone,
          link_type: "quote_approval",
          expires_in_days: 30,
          send_email: true,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error || "Couldn't send.");
      setLink(json.data.portal_url);
      setMessage({
        ok: true,
        text: json.data.emailed ? `Emailed to ${email} with a link to review and sign.` : "Link created, but the email didn't go out. Copy the link below.",
      });
      await load();
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Couldn't send." });
    } finally {
      setBusy(false);
    }
  };

  const toJob = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/quotes/${quote.id}/convert-to-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_type: "installation", priority: "normal" }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error || "Couldn't create the job.");
      router.push(`/admin/jobs/${json.data.id}`);
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Couldn't create the job." });
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/admin/quotes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 no-print">
        <ArrowLeft className="w-4 h-4" /> Quotes
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 font-mono">Quote {quote.quote_number}</p>
          <h1 className="text-2xl font-bold text-gray-900">{quote.template_name || quote.customer?.company || quote.customer?.name || "Quote"}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Created {day(quote.created_at)}
            {quote.expires_at ? ` · valid until ${day(quote.expires_at)}` : ""}
            {quote.accepted_at ? ` · signed ${day(quote.accepted_at)}${quote.accepted_by ? ` by ${quote.accepted_by}` : ""}` : ""}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${STATUS[quote.status] || "bg-gray-100 text-gray-700"}`}>
          {quote.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 no-print">
        {["draft", "sent", "viewed"].includes(quote.status) && (
          <button onClick={send} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {quote.status === "draft" ? "Send for signature" : "Resend sign link"}
          </button>
        )}
        {["accepted", "paid"].includes(quote.status) && (
          <button onClick={toJob} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D1B2A] hover:bg-[#16293d] text-white rounded-lg text-sm disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />} Convert to job
          </button>
        )}
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm">
          <Printer className="w-4 h-4" /> Print / PDF
        </button>
      </div>

      {message && (
        <div className={`flex items-start gap-2 text-sm rounded-lg px-3 py-2 no-print ${message.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
          {message.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <AlertTriangle className="w-4 h-4 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}
      {link && (
        <button onClick={() => navigator.clipboard?.writeText(link)} className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:underline no-print">
          <Copy className="w-4 h-4" /> Copy sign link
        </button>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm">
          <p className="text-xs font-medium text-gray-500 mb-2">Customer</p>
          <p className="font-medium text-gray-900">{quote.customer?.company || quote.customer?.name || "—"}</p>
          {quote.customer?.company && quote.customer?.name && <p className="text-gray-700">{quote.customer.name}</p>}
          {email && <p className="text-gray-600">{email}</p>}
          {quote.customer?.phone && <p className="text-gray-600">{quote.customer.phone}</p>}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm">
          <p className="text-xs font-medium text-gray-500 mb-2">Site</p>
          <p className="text-gray-900">{quote.site?.name || "—"}</p>
          <p className="text-gray-600">{[quote.site?.address, quote.site?.city, quote.site?.state, quote.site?.zip].filter(Boolean).join(", ")}</p>
        </div>
      </div>

      {doc ? (
        <div className="bg-gray-100 p-4 sm:p-6 rounded-xl overflow-x-auto">
          <AgreementDocument doc={doc} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Item</th>
                <th className="text-right px-4 py-2 font-medium w-20">Qty</th>
                <th className="text-right px-4 py-2 font-medium w-28">Price</th>
                <th className="text-right px-4 py-2 font-medium w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((it, i) => {
                const price = it.unit_price ?? it.unitPrice ?? 0;
                const qty = it.quantity ?? 1;
                return (
                  <tr key={i}>
                    <td className="px-4 py-2 text-gray-900">{it.description || it.name}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{qty}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{usd(price)}</td>
                    <td className="px-4 py-2 text-right text-gray-900">{usd(it.total ?? price * qty)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t border-gray-200">
              {quote.totals?.tax ? (
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right text-gray-500">Tax</td>
                  <td className="px-4 py-2 text-right text-gray-700">{usd(quote.totals.tax)}</td>
                </tr>
              ) : null}
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">Total</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{usd(total)}</td>
              </tr>
            </tfoot>
          </table>
          {quote.terms?.disclaimers?.length ? (
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
              <p className="font-medium mb-1">Exclusions</p>
              <ul className="list-disc pl-5 space-y-0.5">
                {quote.terms.disclaimers.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
