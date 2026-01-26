"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Mail, Phone, RefreshCw, UserPlus, Loader2, X, CheckCircle, Building2 } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  message?: string;
  created_at: string;
}

const statusFilters = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Proposal", value: "proposal" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
];

const sourceFilters = [
  { label: "All Sources", value: "all" },
  { label: "Contact Page", value: "contact_page" },
  { label: "Inspection Analyzer", value: "inspection_analyzer" },
  { label: "Service Recommender", value: "service_recommender" },
  { label: "Access Requests", value: "account_request" },
  { label: "Website", value: "website" },
  { label: "Chat", value: "chat" },
  { label: "Retell", value: "retell" },
  { label: "Phone", value: "phone" },
  { label: "Referral", value: "referral" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isGranting, setIsGranting] = useState(false);
  const [grantSuccess, setGrantSuccess] = useState<{ portalUrl: string } | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/leads");
      const data = await response.json();
      if (data.success) {
        setLeads(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const statusMatch = statusFilter === "all" || lead.status === statusFilter;
    const sourceMatch = sourceFilter === "all" || lead.source === sourceFilter;
    return statusMatch && sourceMatch;
  });

  const accessRequestCount = leads.filter((l) => l.source === "account_request").length;
  const newAccessRequests = leads.filter((l) => l.source === "account_request" && l.status === "new").length;

  const parseCompanyFromMessage = (message?: string) => {
    if (!message) return "";
    const match = message.match(/Company:\s*(.+)/);
    return match ? match[1].trim() : "";
  };

  const handleGrantAccess = async (lead: Lead) => {
    setIsGranting(true);
    setGrantSuccess(null);
    try {
      const response = await fetch(`/api/leads/${lead.id}/grant-access`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setGrantSuccess({ portalUrl: data.data.portalUrl });
        fetchLeads(); // Refresh the list
      } else {
        alert(data.error || "Failed to grant access");
      }
    } catch (error) {
      console.error("Error granting access:", error);
      alert("Failed to grant access");
    } finally {
      setIsGranting(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (lead: Lead) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{lead.name}</p>
            {lead.source === "account_request" && (
              <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                Access Request
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{lead.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (lead: Lead) => (
        <span className="text-gray-600">{lead.phone || "—"}</span>
      ),
    },
    {
      key: "source",
      label: "Source",
      sortable: true,
      render: (lead: Lead) => (
        <span className={`text-sm ${lead.source === "account_request" ? "text-purple-600 font-medium" : "text-gray-600"}`}>
          {lead.source === "account_request" ? "Account Request" : lead.source}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (lead: Lead) => <StatusBadge status={lead.status} />,
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (lead: Lead) => (
        <span className="text-gray-500">
          {new Date(lead.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 mt-1">
            Manage your sales leads and access requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLeads}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/admin/leads/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </Link>
        </div>
      </div>

      {/* Access Requests Alert */}
      {newAccessRequests > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-purple-900">
                {newAccessRequests} new access request{newAccessRequests > 1 ? "s" : ""}
              </p>
              <p className="text-sm text-purple-600">
                People are requesting portal access
              </p>
            </div>
          </div>
          <button
            onClick={() => setSourceFilter("account_request")}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            View Requests
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">New</p>
          <p className="text-2xl font-bold text-blue-600">
            {leads.filter((l) => l.status === "new").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-amber-600">
            {leads.filter((l) => ["contacted", "qualified", "proposal"].includes(l.status)).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Won</p>
          <p className="text-2xl font-bold text-green-600">
            {leads.filter((l) => l.status === "won").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-purple-200 p-4 border-2">
          <p className="text-sm text-purple-600 font-medium">Access Requests</p>
          <p className="text-2xl font-bold text-purple-600">{accessRequestCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Source Filter */}
        <div className="flex flex-wrap gap-2">
          {sourceFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSourceFilter(filter.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                sourceFilter === filter.value
                  ? filter.value === "account_request"
                    ? "bg-purple-600 text-white"
                    : "bg-orange-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter.label}
              {filter.value === "account_request" && accessRequestCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-white/20 rounded">
                  {accessRequestCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === filter.value
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredLeads}
          searchPlaceholder="Search leads..."
          onRowClick={(lead) => {
            setSelectedLead(lead);
            setGrantSuccess(null);
          }}
          actions={(lead) => (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `mailto:${lead.email}`;
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                title="Send email"
              >
                <Mail className="w-4 h-4" />
              </button>
              {lead.phone && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `tel:${lead.phone}`;
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  title="Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedLead.source === "account_request" ? "bg-purple-100" : "bg-orange-100"}`}>
                  {selectedLead.source === "account_request" ? (
                    <UserPlus className={`w-5 h-5 text-purple-600`} />
                  ) : (
                    <Mail className={`w-5 h-5 text-orange-600`} />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedLead.name}</h2>
                  <p className="text-sm text-gray-500">{selectedLead.source === "account_request" ? "Access Request" : selectedLead.source}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${selectedLead.email}`} className="text-orange-600 hover:underline">
                    {selectedLead.email}
                  </a>
                </div>
                {selectedLead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${selectedLead.phone}`} className="text-orange-600 hover:underline">
                      {selectedLead.phone}
                    </a>
                  </div>
                )}
                {selectedLead.source === "account_request" && selectedLead.message && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{parseCompanyFromMessage(selectedLead.message)}</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status:</span>
                <StatusBadge status={selectedLead.status} />
              </div>

              {/* Message */}
              {selectedLead.message && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Message</p>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedLead.message}</p>
                </div>
              )}

              {/* Grant Success */}
              {grantSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Access Granted!</span>
                  </div>
                  <p className="text-sm text-green-700 mb-2">
                    An email has been sent to {selectedLead.email} with their portal link.
                  </p>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-gray-500 mb-1">Portal Link:</p>
                    <a href={grantSuccess.portalUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-600 hover:underline break-all">
                      {grantSuccess.portalUrl}
                    </a>
                  </div>
                </div>
              )}

              {/* Created Date */}
              <p className="text-sm text-gray-500">
                Submitted {new Date(selectedLead.created_at).toLocaleDateString()} at {new Date(selectedLead.created_at).toLocaleTimeString()}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
                {selectedLead.phone && (
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-white transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                )}
              </div>
              {selectedLead.source === "account_request" && selectedLead.status !== "won" && !grantSuccess && (
                <button
                  onClick={() => handleGrantAccess(selectedLead)}
                  disabled={isGranting}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isGranting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {isGranting ? "Granting..." : "Grant Access"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
