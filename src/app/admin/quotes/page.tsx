"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Send,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  DollarSign,
  ArrowRight,
  Loader2,
  Link2,
  Copy,
  X,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface Quote {
  id: string;
  quote_number: string;
  customer: { name: string; company?: string; email?: string; phone: string };
  totals?: { grand_total?: number };
  status: "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired" | "paid";
  created_at: string;
  expires_at?: string;
  sent_at?: string;
  quote_type: string;
  template_name?: string;
}

const statusConfig = {
  draft:    { label: "Draft",    icon: FileText,    color: "bg-gray-100 text-gray-700" },
  sent:     { label: "Sent",     icon: Send,        color: "bg-blue-100 text-blue-700" },
  viewed:   { label: "Viewed",   icon: Eye,         color: "bg-purple-100 text-purple-700" },
  accepted: { label: "Accepted", icon: CheckCircle, color: "bg-green-100 text-green-700" },
  declined: { label: "Declined", icon: XCircle,     color: "bg-red-100 text-red-700" },
  expired:  { label: "Expired",  icon: Clock,       color: "bg-orange-100 text-orange-700" },
  paid:     { label: "Paid",     icon: CheckCircle, color: "bg-emerald-100 text-emerald-700" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Customer link modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/quotes?${params}`);
      const data = await res.json();
      if (data.success) {
        setQuotes(data.data ?? []);
      } else {
        setError(data.error || "Failed to load quotes");
      }
    } catch {
      setError("Failed to load quotes");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quote? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/quotes/${id}`, { method: "DELETE" });
      if (res.ok) setQuotes((prev) => prev.filter((q) => q.id !== id));
      else alert("Failed to delete quote");
    } catch {
      alert("Failed to delete quote");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSendLink = (quote: Quote) => {
    setSelectedQuote(quote);
    setGeneratedLink(null);
    setLinkCopied(false);
    setShowLinkModal(true);
  };

  const generateCustomerLink = async () => {
    if (!selectedQuote) return;
    setGeneratingLink(true);
    try {
      const res = await fetch("/api/customer-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote_id: selectedQuote.id,
          customer_email: selectedQuote.customer.email,
          customer_name: selectedQuote.customer.name,
          link_type: "quote_approval",
          expires_in_days: 30,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) setGeneratedLink(data.data.portal_url);
      else alert(data.error || "Failed to generate link");
    } catch {
      alert("Failed to generate customer link");
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyLink = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleConvertToJob = async (quoteId: string) => {
    setConvertingId(quoteId);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/convert-to-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_type: "installation", priority: "normal" }),
      });
      const data = await res.json();
      if (res.ok && data.success) router.push(`/admin/jobs/${data.data.id}`);
      else alert(data.error || "Failed to convert quote to job");
    } catch {
      alert("Failed to convert quote to job");
    } finally {
      setConvertingId(null);
    }
  };

  const filtered = quotes.filter((q) => {
    const name = q.customer?.name ?? "";
    const company = q.customer?.company ?? "";
    const term = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(term) ||
      company.toLowerCase().includes(term) ||
      q.quote_number.toLowerCase().includes(term)
    );
  });

  const stats = {
    total: quotes.length,
    pending: quotes.filter((q) => ["sent", "viewed"].includes(q.status)).length,
    accepted: quotes.filter((q) => q.status === "accepted").length,
    wonValue: quotes
      .filter((q) => ["accepted", "paid"].includes(q.status))
      .reduce((sum, q) => sum + (q.totals?.grand_total ?? 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes & Proposals</h1>
          <p className="text-gray-600 mt-1">Create and manage quotes for your customers</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchQuotes}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
          <Link
            href="/admin/quote"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Quote
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Quotes", value: stats.total, icon: FileText, bg: "bg-gray-100", iconColor: "text-gray-600" },
          { label: "Pending",      value: stats.pending, icon: Clock, bg: "bg-blue-100", iconColor: "text-blue-600" },
          { label: "Accepted",     value: stats.accepted, icon: CheckCircle, bg: "bg-green-100", iconColor: "text-green-600" },
          { label: "Won Value",    value: fmt(stats.wonValue), icon: DollarSign, bg: "bg-orange-100", iconColor: "text-orange-600" },
        ].map(({ label, value, icon: Icon, bg, iconColor }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${bg} rounded-lg`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer or quote number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="viewed">Viewed</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
          <option value="expired">Expired</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            Loading quotes...
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-red-500 mb-3">{error}</p>
            <button onClick={fetchQuotes} className="text-sm text-orange-600 hover:underline">Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No quotes found</p>
            <p className="text-sm mt-1">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first quote to get started"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Quote", "Customer", "Amount", "Status", "Date", ""].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === "" ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((quote) => {
                  const sc = statusConfig[quote.status] ?? statusConfig.draft;
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{quote.quote_number}</p>
                        <p className="text-sm text-gray-500">{quote.quote_type}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{quote.customer?.name}</p>
                        <p className="text-sm text-gray-500">{quote.customer?.company || quote.customer?.email}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {fmt(quote.totals?.grand_total ?? 0)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{fmtDate(quote.created_at)}</p>
                        {quote.expires_at && (
                          <p className="text-xs text-gray-500">Expires: {fmtDate(quote.expires_at)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/quotes/${quote.id}`}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </Link>
                          <Link
                            href={`/admin/quote?id=${quote.id}`}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </Link>
                          {["sent", "viewed"].includes(quote.status) && (
                            <button
                              onClick={() => handleSendLink(quote)}
                              className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Send customer link"
                            >
                              <Link2 className="w-4 h-4 text-purple-500" />
                            </button>
                          )}
                          {quote.status === "accepted" && (
                            <button
                              onClick={() => handleConvertToJob(quote.id)}
                              disabled={convertingId === quote.id}
                              className="flex items-center gap-1 px-2 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                              title="Convert to Job"
                            >
                              {convertingId === quote.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <><ArrowRight className="w-3.5 h-3.5" /> Job</>}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(quote.id)}
                            disabled={deletingId === quote.id}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            {deletingId === quote.id
                              ? <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                              : <Trash2 className="w-4 h-4 text-red-400" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Link Modal */}
      {showLinkModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Customer Portal Link</h2>
              <button onClick={() => setShowLinkModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Generate a secure link for <strong>{selectedQuote.customer.name}</strong> to view and approve <strong>{selectedQuote.quote_number}</strong>.
              </p>
              {!generatedLink ? (
                <button
                  onClick={generateCustomerLink}
                  disabled={generatingLink}
                  className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  {generatingLink ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Link2 className="w-5 h-5" /> Generate Customer Link</>}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Portal Link</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={generatedLink}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600"
                      />
                      <button
                        onClick={copyLink}
                        className={`p-2 rounded-lg transition-colors ${linkCopied ? "bg-green-100 text-green-600" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
                      >
                        {linkCopied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Link expires in 30 days</p>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={generatedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> Preview
                    </a>
                    <a
                      href={`mailto:${selectedQuote.customer.email}?subject=Your%20Quote%20from%20Chatman%20Security%20%26%20Fire&body=Please%20review%20and%20approve%20your%20quote%20here%3A%20${encodeURIComponent(generatedLink)}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors"
                    >
                      <Send className="w-4 h-4" /> Email Link
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
