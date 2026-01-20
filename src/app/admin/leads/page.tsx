"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Mail, Phone } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  createdAt: string;
}

// Mock data
const mockLeads: Lead[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    source: "Website",
    status: "new",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    phone: "(555) 234-5678",
    source: "Referral",
    status: "contacted",
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    name: "Mike Davis",
    email: "mike.davis@business.com",
    phone: "(555) 345-6789",
    source: "AIVA Chat",
    status: "qualified",
    createdAt: "2024-01-13",
  },
  {
    id: "4",
    name: "Emily Brown",
    email: "emily.b@corp.com",
    phone: "(555) 456-7890",
    source: "Phone",
    status: "proposal",
    createdAt: "2024-01-12",
  },
  {
    id: "5",
    name: "Robert Wilson",
    email: "r.wilson@mail.com",
    phone: "(555) 567-8901",
    source: "Website",
    status: "won",
    createdAt: "2024-01-11",
  },
  {
    id: "6",
    name: "Jennifer Lee",
    email: "jen.lee@email.com",
    phone: "(555) 678-9012",
    source: "Ad Campaign",
    status: "lost",
    createdAt: "2024-01-10",
  },
  {
    id: "7",
    name: "David Martinez",
    email: "d.martinez@company.com",
    phone: "(555) 789-0123",
    source: "Referral",
    status: "new",
    createdAt: "2024-01-09",
  },
  {
    id: "8",
    name: "Lisa Anderson",
    email: "l.anderson@business.com",
    phone: "(555) 890-1234",
    source: "Website",
    status: "contacted",
    createdAt: "2024-01-08",
  },
];

const statusFilters = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Proposal", value: "proposal" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
];

export default function LeadsPage() {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredLeads =
    statusFilter === "all"
      ? mockLeads
      : mockLeads.filter((lead) => lead.status === statusFilter);

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (lead: Lead) => (
        <div>
          <p className="font-medium text-gray-900">{lead.name}</p>
          <p className="text-xs text-gray-500">{lead.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (lead: Lead) => (
        <span className="text-gray-600">{lead.phone}</span>
      ),
    },
    {
      key: "source",
      label: "Source",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (lead: Lead) => <StatusBadge status={lead.status} />,
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (lead: Lead) => (
        <span className="text-gray-500">
          {new Date(lead.createdAt).toLocaleDateString()}
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
            Manage your sales leads and pipeline
          </p>
        </div>
        <Link
          href="/admin/leads/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Lead
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900">{mockLeads.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">New</p>
          <p className="text-2xl font-bold text-blue-600">
            {mockLeads.filter((l) => l.status === "new").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-amber-600">
            {mockLeads.filter((l) => ["contacted", "qualified", "proposal"].includes(l.status)).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Won</p>
          <p className="text-2xl font-bold text-green-600">
            {mockLeads.filter((l) => l.status === "won").length}
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === filter.value
                ? "bg-red-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredLeads}
        searchPlaceholder="Search leads..."
        onRowClick={(lead) => console.log("View lead:", lead.id)}
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
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        )}
      />
    </div>
  );
}
