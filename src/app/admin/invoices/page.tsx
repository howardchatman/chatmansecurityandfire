"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal, FileText } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total: number;
  amount_paid: number;
  due_date: string | null;
  created_at: string;
  sent_at: string | null;
  customer: {
    id: string;
    name: string;
    email: string;
    company: string;
  } | null;
}

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Paid", value: "paid" },
  { label: "Partial", value: "partial" },
  { label: "Overdue", value: "overdue" },
  { label: "Cancelled", value: "cancelled" },
];

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/invoices?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalOutstanding = invoices
    .filter((i) => ["sent", "partial", "overdue"].includes(i.status))
    .reduce((sum, i) => sum + (i.total - (i.amount_paid || 0)), 0);

  const totalOverdue = invoices
    .filter((i) => i.status === "overdue" || (i.due_date && new Date(i.due_date) < new Date() && !["paid", "cancelled", "draft"].includes(i.status)))
    .reduce((sum, i) => sum + (i.total - (i.amount_paid || 0)), 0);

  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);

  const columns = [
    {
      key: "invoice_number",
      label: "Invoice",
      sortable: true,
      render: (invoice: Invoice) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
            <p className="text-xs text-gray-500">
              Created {new Date(invoice.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
      render: (invoice: Invoice) => (
        <span className="text-gray-900">
          {invoice.customer?.name || invoice.customer?.company || "N/A"}
        </span>
      ),
    },
    {
      key: "total",
      label: "Amount",
      sortable: true,
      render: (invoice: Invoice) => (
        <span className="font-semibold text-gray-900">
          ${invoice.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "amount_paid",
      label: "Paid",
      sortable: true,
      render: (invoice: Invoice) => (
        <span className={`font-medium ${(invoice.amount_paid || 0) > 0 ? "text-green-600" : "text-gray-400"}`}>
          ${(invoice.amount_paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
      key: "due_date",
      label: "Due Date",
      sortable: true,
      render: (invoice: Invoice) => {
        if (!invoice.due_date) return <span className="text-gray-400">N/A</span>;
        const isOverdue = new Date(invoice.due_date) < new Date() && !["paid", "cancelled"].includes(invoice.status);
        return (
          <span className={isOverdue ? "text-red-600 font-medium" : "text-gray-500"}>
            {new Date(invoice.due_date).toLocaleDateString()}
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className="text-2xl font-bold text-blue-600">
            ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-2xl font-bold text-red-600">
            ${totalOverdue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Paid</p>
          <p className="text-2xl font-bold text-green-600">
            ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                ? "bg-orange-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={invoices}
          searchPlaceholder="Search invoices..."
          onRowClick={(invoice) => router.push(`/admin/invoices/${invoice.id}`)}
          actions={(invoice) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/invoices/${invoice.id}`);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        />
      )}
    </div>
  );
}
