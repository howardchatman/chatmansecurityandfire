"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, DollarSign, FileText } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
}

// Mock data
const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-000045",
    customer: "ABC Corporation",
    amount: 2450.0,
    status: "sent",
    dueDate: "2024-02-01",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-000044",
    customer: "Tech Solutions Inc",
    amount: 850.0,
    status: "paid",
    dueDate: "2024-01-20",
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-000043",
    customer: "Medical Center West",
    amount: 4200.0,
    status: "overdue",
    dueDate: "2024-01-10",
    createdAt: "2024-01-01",
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-000042",
    customer: "Downtown Retail",
    amount: 1299.0,
    status: "partial",
    dueDate: "2024-01-25",
    createdAt: "2024-01-08",
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-000041",
    customer: "Smith Residence",
    amount: 149.0,
    status: "paid",
    dueDate: "2024-01-15",
    createdAt: "2024-01-05",
  },
  {
    id: "6",
    invoiceNumber: "INV-2024-000040",
    customer: "Johnson Family",
    amount: 299.0,
    status: "draft",
    dueDate: "2024-02-05",
    createdAt: "2024-01-14",
  },
];

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Paid", value: "paid" },
  { label: "Partial", value: "partial" },
  { label: "Overdue", value: "overdue" },
];

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredInvoices =
    statusFilter === "all"
      ? mockInvoices
      : mockInvoices.filter((i) => i.status === statusFilter);

  const totalOutstanding = mockInvoices
    .filter((i) => ["sent", "partial", "overdue"].includes(i.status))
    .reduce((sum, i) => sum + i.amount, 0);

  const totalOverdue = mockInvoices
    .filter((i) => i.status === "overdue")
    .reduce((sum, i) => sum + i.amount, 0);

  const columns = [
    {
      key: "invoiceNumber",
      label: "Invoice",
      sortable: true,
      render: (invoice: Invoice) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
            <p className="text-xs text-gray-500">
              Created {new Date(invoice.createdAt).toLocaleDateString()}
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
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (invoice: Invoice) => (
        <span className="font-semibold text-gray-900">
          ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (invoice: Invoice) => <StatusBadge status={invoice.status} />,
    },
    {
      key: "dueDate",
      label: "Due Date",
      sortable: true,
      render: (invoice: Invoice) => {
        const isOverdue =
          new Date(invoice.dueDate) < new Date() && invoice.status !== "paid";
        return (
          <span className={isOverdue ? "text-red-600 font-medium" : "text-gray-500"}>
            {new Date(invoice.dueDate).toLocaleDateString()}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">
            Manage billing and track payments
          </p>
        </div>
        <Link
          href="/admin/invoices/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900">{mockInvoices.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className="text-2xl font-bold text-blue-600">
            ${totalOutstanding.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-2xl font-bold text-red-600">
            ${totalOverdue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Paid This Month</p>
          <p className="text-2xl font-bold text-green-600">
            ${mockInvoices
              .filter((i) => i.status === "paid")
              .reduce((sum, i) => sum + i.amount, 0)
              .toLocaleString()}
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
        data={filteredInvoices}
        searchPlaceholder="Search invoices..."
        onRowClick={(invoice) => console.log("View invoice:", invoice.id)}
        actions={(invoice) => (
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      />
    </div>
  );
}
