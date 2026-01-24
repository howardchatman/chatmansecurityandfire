"use client";

import { useState, useEffect } from "react";
import {
  Link2,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Trash2,
  RotateCcw,
  Copy,
  ExternalLink,
  Loader2,
  Ban,
  RefreshCw,
} from "lucide-react";

interface CustomerLink {
  id: string;
  token: string;
  customer_email: string;
  customer_name?: string;
  link_type: string;
  status: string;
  expires_at?: string;
  use_count: number;
  last_accessed_at?: string;
  created_at: string;
  quote?: {
    id: string;
    quote_number: string;
    status: string;
    totals: { total?: number; grandTotal?: number };
  };
  job?: {
    id: string;
    job_number: string;
    status: string;
  };
  created_by_user?: {
    full_name: string;
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: "Active", color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-4 h-4" /> },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-500", icon: <Clock className="w-4 h-4" /> },
  revoked: { label: "Revoked", color: "bg-red-100 text-red-700", icon: <Ban className="w-4 h-4" /> },
  used: { label: "Used", color: "bg-blue-100 text-blue-700", icon: <CheckCircle className="w-4 h-4" /> },
};

const linkTypeLabels: Record<string, string> = {
  quote_approval: "Quote Approval",
  job_status: "Job Status",
  payment: "Payment",
  document_access: "Documents",
  full_access: "Full Access",
};

export default function CustomerLinksPage() {
  const [links, setLinks] = useState<CustomerLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, [statusFilter]);

  const fetchLinks = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await fetch(`/api/customer-links?${params}`);
      const data = await response.json();

      if (data.success) {
        setLinks(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching links:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (token: string, action: string) => {
    setActionLoading(token);
    try {
      const response = await fetch(`/api/customer-links/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        fetchLinks();
      } else {
        const data = await response.json();
        alert(data.error || "Action failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const copyLink = async (token: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const url = `${baseUrl}/c/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isExpired = (link: CustomerLink) => {
    if (!link.expires_at) return false;
    return new Date(link.expires_at) < new Date();
  };

  const filteredLinks = links.filter((link) => {
    const matchesSearch =
      link.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.quote?.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.job?.job_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: links.length,
    active: links.filter((l) => l.status === "active" && !isExpired(l)).length,
    expired: links.filter((l) => l.status === "expired" || isExpired(l)).length,
    revoked: links.filter((l) => l.status === "revoked").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Links</h1>
        <p className="text-gray-600 mt-1">Manage customer portal access links</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Link2 className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Links</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Expired</p>
              <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Revoked</p>
              <p className="text-2xl font-bold text-gray-900">{stats.revoked}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email, name, or quote/job number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
          <option value="used">Used</option>
        </select>
        <button
          onClick={fetchLinks}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700">Refresh</span>
        </button>
      </div>

      {/* Links Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type / Quote
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLinks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No customer links found
                    </td>
                  </tr>
                ) : (
                  filteredLinks.map((link) => {
                    const status = statusConfig[link.status] || statusConfig.active;
                    const expired = isExpired(link);
                    const effectiveStatus = expired && link.status === "active" ? statusConfig.expired : status;

                    return (
                      <tr key={link.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {link.customer_name || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-500">{link.customer_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {linkTypeLabels[link.link_type] || link.link_type}
                            </p>
                            {link.quote && (
                              <p className="text-sm text-gray-500">
                                {link.quote.quote_number} •{" "}
                                {formatCurrency(link.quote.totals?.total || link.quote.totals?.grandTotal)}
                              </p>
                            )}
                            {link.job && (
                              <p className="text-sm text-gray-500">{link.job.job_number}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${effectiveStatus.color}`}
                          >
                            {effectiveStatus.icon}
                            {effectiveStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900">{link.use_count} views</p>
                            {link.last_accessed_at && (
                              <p className="text-xs text-gray-500">
                                Last: {formatDate(link.last_accessed_at)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm ${expired ? "text-red-600" : "text-gray-600"}`}>
                            {link.expires_at ? formatDate(link.expires_at) : "Never"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => copyLink(link.token)}
                              className={`p-2 rounded-lg transition-colors ${
                                copiedId === link.token
                                  ? "bg-green-100 text-green-600"
                                  : "hover:bg-gray-100 text-gray-500"
                              }`}
                              title="Copy link"
                            >
                              {copiedId === link.token ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <a
                              href={`/c/${link.token}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Preview"
                            >
                              <ExternalLink className="w-4 h-4 text-gray-500" />
                            </a>
                            {link.status === "active" && (
                              <button
                                onClick={() => handleAction(link.token, "revoke")}
                                disabled={actionLoading === link.token}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Revoke"
                              >
                                {actionLoading === link.token ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                ) : (
                                  <Ban className="w-4 h-4 text-red-500" />
                                )}
                              </button>
                            )}
                            {(link.status === "revoked" || link.status === "expired" || expired) && (
                              <button
                                onClick={() => handleAction(link.token, "reactivate")}
                                disabled={actionLoading === link.token}
                                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                title="Reactivate"
                              >
                                {actionLoading === link.token ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                ) : (
                                  <RotateCcw className="w-4 h-4 text-green-500" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
