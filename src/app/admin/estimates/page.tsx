"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, FileText, Send, CheckCircle } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

interface Estimate {
  id: string;
  estimateNumber: string;
  customer: string;
  title: string;
  total: number;
  status: string;
  validUntil: string;
  createdAt: string;
}

// Mock estimates data
const mockEstimates: Estimate[] = [
  {
    id: "1",
    estimateNumber: "EST-2024-000012",
    customer: "John Smith",
    title: "Residential Security System Installation",
    total: 2450.00,
    status: "sent",
    validUntil: "2024-02-15",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    estimateNumber: "EST-2024-000011",
    customer: "ABC Corporation",
    title: "Commercial Alarm System Upgrade",
    total: 8750.00,
    status: "accepted",
    validUntil: "2024-02-10",
    createdAt: "2024-01-12",
  },
  {
    id: "3",
    estimateNumber: "EST-2024-000010",
    customer: "Tech Solutions Inc",
    title: "Video Surveillance - 16 Cameras",
    total: 12500.00,
    status: "draft",
    validUntil: "2024-02-20",
    createdAt: "2024-01-14",
  },
  {
    id: "4",
    estimateNumber: "EST-2024-000009",
    customer: "Downtown Retail",
    title: "Fire Alarm System Installation",
    total: 5200.00,
    status: "declined",
    validUntil: "2024-01-20",
    createdAt: "2024-01-05",
  },
  {
    id: "5",
    estimateNumber: "EST-2024-000008",
    customer: "Medical Center West",
    title: "Access Control - 8 Doors",
    total: 15800.00,
    status: "accepted",
    validUntil: "2024-01-25",
    createdAt: "2024-01-02",
  },
  {
    id: "6",
    estimateNumber: "EST-2024-000007",
    customer: "Sarah Johnson",
    title: "Smart Home Security Package",
    total: 1850.00,
    status: "expired",
    validUntil: "2024-01-10",
    createdAt: "2023-12-28",
  },
];

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Accepted", value: "accepted" },
  { label: "Declined", value: "declined" },
  { label: "Expired", value: "expired" },
];

export default function EstimatesPage() {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredEstimates =
    statusFilter === "all"
      ? mockEstimates
      : mockEstimates.filter((e) => e.status === statusFilter);

  const totalPending = mockEstimates
    .filter((e) => e.status === "sent")
    .reduce((sum, e) => sum + e.total, 0);

  const totalAccepted = mockEstimates
    .filter((e) => e.status === "accepted")
    .reduce((sum, e) => sum + e.total, 0);

  const columns = [
    {
      key: "estimateNumber",
      label: "Estimate",
      sortable: true,
      render: (estimate: Estimate) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{estimate.estimateNumber}</p>
            <p className="text-xs text-gray-500 truncate max-w-[200px]">
              {estimate.title}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
    },
    {
      key: "total",
      label: "Amount",
      sortable: true,
      render: (estimate: Estimate) => (
        <span className="font-semibold text-gray-900">
          ${estimate.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (estimate: Estimate) => <StatusBadge status={estimate.status} />,
    },
    {
      key: "validUntil",
      label: "Valid Until",
      sortable: true,
      render: (estimate: Estimate) => {
        const isExpired = new Date(estimate.validUntil) < new Date();
        return (
          <span className={isExpired ? "text-red-600" : "text-gray-500"}>
            {new Date(estimate.validUntil).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (estimate: Estimate) => (
        <span className="text-gray-500">
          {new Date(estimate.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estimates</h1>
          <p className="text-gray-500 mt-1">
            Create and manage job estimates and proposals
          </p>
        </div>
        <Link
          href="/admin/estimates/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Estimate
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Estimates</p>
          <p className="text-2xl font-bold text-gray-900">{mockEstimates.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending Value</p>
          <p className="text-2xl font-bold text-blue-600">
            ${totalPending.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Accepted Value</p>
          <p className="text-2xl font-bold text-green-600">
            ${totalAccepted.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Conversion Rate</p>
          <p className="text-2xl font-bold text-red-600">
            {Math.round(
              (mockEstimates.filter((e) => e.status === "accepted").length /
                mockEstimates.filter((e) => e.status !== "draft").length) *
                100
            )}%
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
        data={filteredEstimates}
        searchPlaceholder="Search estimates..."
        onRowClick={(estimate) => console.log("View estimate:", estimate.id)}
        actions={(estimate) => (
          <div className="flex items-center gap-1">
            {estimate.status === "draft" && (
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                title="Send to customer"
              >
                <Send className="w-4 h-4" />
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
    </div>
  );
}
