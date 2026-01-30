"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  status: string;
  receipt_url: string | null;
  notes: string | null;
  invoice: {
    id: string;
    invoice_number: string;
    total: number;
    status: string;
  } | null;
  customer: {
    id: string;
    name: string;
    email: string;
    company: string;
  } | null;
}

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/payments?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalCollected = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter((p) => p.status === "refunded")
    .reduce((sum, p) => sum + p.amount, 0);

  const columns = [
    {
      key: "payment_date",
      label: "Date",
      sortable: true,
      render: (payment: Payment) => (
        <span className="text-gray-900">
          {new Date(payment.payment_date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
      render: (payment: Payment) => (
        <div>
          <p className="font-medium text-gray-900">
            {payment.customer?.name || payment.customer?.company || "N/A"}
          </p>
          <p className="text-xs text-gray-500">{payment.customer?.email}</p>
        </div>
      ),
    },
    {
      key: "invoice",
      label: "Invoice",
      sortable: true,
      render: (payment: Payment) => (
        payment.invoice ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/invoices/${payment.invoice!.id}`);
            }}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            {payment.invoice.invoice_number}
          </button>
        ) : <span className="text-gray-400">-</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (payment: Payment) => (
        <span className="font-semibold text-gray-900">
          ${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "payment_method",
      label: "Method",
      sortable: true,
      render: (payment: Payment) => (
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 capitalize">
            {payment.payment_method.replace("_", " ")}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (payment: Payment) => <StatusBadge status={payment.status} />,
    },
    {
      key: "receipt",
      label: "",
      render: (payment: Payment) => (
        payment.receipt_url ? (
          <a
            href={payment.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Receipt
          </a>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-1">Track payment history and transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Payments</p>
          <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-sm text-gray-500">Collected</p>
          </div>
          <p className="text-2xl font-bold text-green-600">
            ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-yellow-500" />
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            ${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-1 mb-1">
            <XCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-gray-500">Refunded</p>
          </div>
          <p className="text-2xl font-bold text-red-600">
            ${totalRefunded.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Payments will appear here when invoices are paid through Stripe or recorded manually.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={payments}
          searchPlaceholder="Search payments..."
        />
      )}
    </div>
  );
}
