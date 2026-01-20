"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Send,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  DollarSign,
} from "lucide-react";

interface Quote {
  id: string;
  number: string;
  customer: string;
  email: string;
  title: string;
  amount: number;
  status: "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired";
  createdAt: string;
  expiresAt: string;
  sentAt?: string;
}

const mockQuotes: Quote[] = [
  {
    id: "1",
    number: "QT-2024-001",
    customer: "ABC Corporation",
    email: "john@abccorp.com",
    title: "Commercial Security System Installation",
    amount: 45000,
    status: "accepted",
    createdAt: "2024-01-15",
    expiresAt: "2024-02-15",
    sentAt: "2024-01-16",
  },
  {
    id: "2",
    number: "QT-2024-002",
    customer: "Tech Solutions Inc",
    email: "sarah@techsol.com",
    title: "Office Access Control Upgrade",
    amount: 28500,
    status: "sent",
    createdAt: "2024-01-17",
    expiresAt: "2024-02-17",
    sentAt: "2024-01-17",
  },
  {
    id: "3",
    number: "QT-2024-003",
    customer: "Retail Chain LLC",
    email: "mike@retailchain.com",
    title: "Multi-Location Camera System",
    amount: 125000,
    status: "viewed",
    createdAt: "2024-01-18",
    expiresAt: "2024-02-18",
    sentAt: "2024-01-18",
  },
  {
    id: "4",
    number: "QT-2024-004",
    customer: "Wilson Warehouses",
    email: "david@wilsonwh.com",
    title: "Warehouse Security Upgrade",
    amount: 67000,
    status: "draft",
    createdAt: "2024-01-19",
    expiresAt: "2024-02-19",
  },
  {
    id: "5",
    number: "QT-2024-005",
    customer: "Downtown Clinic",
    email: "admin@downtownclinic.com",
    title: "Healthcare Facility Security",
    amount: 35000,
    status: "declined",
    createdAt: "2024-01-10",
    expiresAt: "2024-02-10",
    sentAt: "2024-01-11",
  },
  {
    id: "6",
    number: "QT-2024-006",
    customer: "Metro Schools District",
    email: "facilities@metroschools.edu",
    title: "School Security System",
    amount: 89000,
    status: "expired",
    createdAt: "2023-12-01",
    expiresAt: "2024-01-01",
    sentAt: "2023-12-02",
  },
];

const statusConfig = {
  draft: { label: "Draft", icon: FileText, color: "bg-gray-100 text-gray-700" },
  sent: { label: "Sent", icon: Send, color: "bg-blue-100 text-blue-700" },
  viewed: { label: "Viewed", icon: Eye, color: "bg-purple-100 text-purple-700" },
  accepted: {
    label: "Accepted",
    icon: CheckCircle,
    color: "bg-green-100 text-green-700",
  },
  declined: {
    label: "Declined",
    icon: XCircle,
    color: "bg-red-100 text-red-700",
  },
  expired: { label: "Expired", icon: Clock, color: "bg-orange-100 text-orange-700" },
};

export default function QuotesPage() {
  const [quotes] = useState<Quote[]>(mockQuotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const stats = {
    total: quotes.length,
    draft: quotes.filter((q) => q.status === "draft").length,
    pending: quotes.filter((q) => ["sent", "viewed"].includes(q.status)).length,
    accepted: quotes.filter((q) => q.status === "accepted").length,
    totalValue: quotes
      .filter((q) => q.status === "accepted")
      .reduce((sum, q) => sum + q.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes & Proposals</h1>
          <p className="text-gray-600 mt-1">
            Create and manage quotes for your customers
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          New Quote
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Quotes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Accepted</p>
              <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Won Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalValue)}
              </p>
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
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="viewed">Viewed</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
          <option value="expired">Expired</option>
        </select>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700">More Filters</span>
        </button>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Quote
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredQuotes.map((quote) => {
                const status = statusConfig[quote.status];
                const StatusIcon = status.icon;
                return (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{quote.number}</p>
                        <p className="text-sm text-gray-500">{quote.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {quote.customer}
                        </p>
                        <p className="text-sm text-gray-500">{quote.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(quote.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{quote.createdAt}</p>
                        <p className="text-xs text-gray-500">
                          Expires: {quote.expiresAt}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        {quote.status === "draft" && (
                          <button
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Send"
                          >
                            <Send className="w-4 h-4 text-blue-500" />
                          </button>
                        )}
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
