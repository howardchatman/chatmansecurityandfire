"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  Loader2,
  Ban,
} from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total: number;
  amount_paid: number | null;
  due_date: string | null;
  created_at: string;
  notes: string | null;
  stripe_hosted_url: string | null;
  stripe_pdf_url: string | null;
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  paid: { label: "Paid", icon: CheckCircle, color: "bg-green-100 text-green-700" },
  sent: { label: "Due", icon: Clock, color: "bg-blue-100 text-blue-700" },
  viewed: { label: "Due", icon: Clock, color: "bg-blue-100 text-blue-700" },
  partial: { label: "Partially Paid", icon: Clock, color: "bg-yellow-100 text-yellow-700" },
  overdue: { label: "Overdue", icon: AlertTriangle, color: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", icon: Ban, color: "bg-gray-100 text-gray-500" },
  refunded: { label: "Refunded", icon: Ban, color: "bg-gray-100 text-gray-500" },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

// An invoice past its due date that isn't settled reads as overdue even if the
// stored status hasn't been swept yet.
const isOverdue = (inv: Invoice) =>
  !!inv.due_date &&
  new Date(inv.due_date) < new Date() &&
  !["paid", "cancelled", "refunded"].includes(inv.status);

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/invoices");
        const data = await res.json();
        if (data.success) setInvoices(data.data || []);
        else setError(data.error || "Couldn't load your invoices.");
      } catch {
        setError("Couldn't load your invoices. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const balanceOf = (inv: Invoice) => (inv.total || 0) - (inv.amount_paid || 0);

  const amountDue = invoices
    .filter((i) => !["paid", "cancelled", "refunded"].includes(i.status))
    .reduce((sum, i) => sum + balanceOf(i), 0);

  const paidThisYear = invoices
    .filter((i) => i.status === "paid" && new Date(i.created_at).getFullYear() === new Date().getFullYear())
    .reduce((sum, i) => sum + (i.total || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600 mt-1">View, pay, and download your invoices</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Amount Due</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(amountDue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Paid This Year</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(paidThisYear)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm text-gray-500">Total Invoices</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">{error}</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-900">No invoices yet</p>
          <p className="text-sm text-gray-500 mt-1">
            When we invoice you for work, it will show up here.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Questions about billing? Call{" "}
            <a href="tel:8328597009" className="text-orange-600 font-medium">
              (832) 859-7009
            </a>
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Invoice", "Date", "Amount", "Status", ""].map((h) => (
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
                {invoices.map((invoice) => {
                  const effectiveStatus = isOverdue(invoice) ? "overdue" : invoice.status;
                  const status = statusConfig[effectiveStatus] || {
                    label: effectiveStatus,
                    icon: Clock,
                    color: "bg-gray-100 text-gray-600",
                  };
                  const StatusIcon = status.icon;
                  const balance = balanceOf(invoice);
                  const payable =
                    balance > 0 && !["paid", "cancelled", "refunded"].includes(invoice.status);

                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                        {invoice.notes && (
                          <p className="text-sm text-gray-500">{invoice.notes}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{formatDate(invoice.created_at)}</p>
                        <p className={`text-xs ${isOverdue(invoice) ? "text-red-600 font-medium" : "text-gray-500"}`}>
                          Due: {formatDate(invoice.due_date)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(invoice.total)}
                        </span>
                        {(invoice.amount_paid || 0) > 0 && balance > 0 && (
                          <p className="text-xs text-gray-500">
                            {formatCurrency(balance)} remaining
                          </p>
                        )}
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
                        <div className="flex items-center justify-end gap-2">
                          {payable && invoice.stripe_hosted_url && (
                            <a
                              href={invoice.stripe_hosted_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Pay Now
                            </a>
                          )}
                          {payable && !invoice.stripe_hosted_url && (
                            <a
                              href="tel:8328597009"
                              className="text-sm text-orange-600 font-medium hover:underline"
                            >
                              Call to pay
                            </a>
                          )}
                          {invoice.stripe_pdf_url && (
                            <a
                              href={invoice.stripe_pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4 text-gray-500" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
