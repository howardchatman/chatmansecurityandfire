"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle,
  DollarSign,
  Loader2,
  AlertTriangle,
  Receipt,
  ExternalLink,
} from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  payment_method: string | null;
  payment_date: string;
  status: string;
  receipt_url: string | null;
  invoice: { id: string; invoice_number: string } | null;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

const formatDate = (value: string) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

const methodLabel = (m: string | null) =>
  m ? m.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";

const statusColor = (s: string) =>
  s === "completed"
    ? "bg-green-100 text-green-700"
    : s === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : s === "refunded"
        ? "bg-gray-100 text-gray-600"
        : "bg-red-100 text-red-700";

export default function PortalPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/payments");
        const data = await res.json();
        if (data.success) setPayments(data.data || []);
        else setError(data.error || "Couldn't load your payment history.");
      } catch {
        setError("Couldn't load your payment history. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalPaid = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const lastPayment = payments.find((p) => p.status === "completed");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">Your payment history and receipts</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Total Paid</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Last Payment</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {lastPayment ? formatCurrency(lastPayment.amount) : "—"}
          </p>
          {lastPayment && (
            <p className="text-xs text-gray-500 mt-1">{formatDate(lastPayment.payment_date)}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Receipt className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm text-gray-500">Payments Made</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
        </div>
      </div>

      {/* How to pay */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
            <CreditCard className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">How to pay</h2>
            <p className="text-sm text-gray-600 mt-1">
              Open any unpaid invoice and choose <strong>Pay Now</strong> to pay securely by card or
              bank transfer. We never store your card details — payments are handled by Stripe.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <Link
                href="/portal/invoices"
                className="text-sm font-medium text-orange-600 hover:underline"
              >
                Go to invoices →
              </Link>
              <span className="text-sm text-gray-500">
                Prefer to pay by check or over the phone? Call{" "}
                <a href="tel:8328597009" className="text-orange-600 font-medium">
                  (832) 859-7009
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Payment history</h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700">{error}</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-900">No payments yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Once you pay an invoice, your receipt will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Date", "Invoice", "Method", "Amount", "Status", ""].map((h) => (
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
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(p.payment_date)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {p.invoice ? (
                          <span className="text-gray-900">{p.invoice.invoice_number}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {methodLabel(p.payment_method)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(p.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColor(p.status)}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.receipt_url && (
                          <a
                            href={p.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-orange-600 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Receipt
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
