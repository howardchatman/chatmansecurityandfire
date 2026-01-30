"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  DollarSign,
  Download,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  CreditCard,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  item_type: string;
}

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  status: string;
  notes: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  job_id: string | null;
  quote_id: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  amount_paid: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  sent_at: string | null;
  notes: string | null;
  stripe_invoice_id: string | null;
  stripe_hosted_url: string | null;
  stripe_pdf_url: string | null;
  created_at: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  items: InvoiceItem[];
  payments: Payment[];
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      const data = await res.json();
      if (data.success) {
        setInvoice(data.data);
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    setActionLoading("send");
    try {
      const res = await fetch(`/api/invoices/${id}/send`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchInvoice();
      } else {
        alert(data.error || "Failed to send invoice");
      }
    } catch {
      alert("Failed to send invoice");
    } finally {
      setActionLoading("");
    }
  };

  const handleMarkPaid = async () => {
    setActionLoading("markpaid");
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "paid",
          amount_paid: invoice?.total,
          paid_at: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) await fetchInvoice();
    } finally {
      setActionLoading("");
    }
  };

  const handleVoid = async () => {
    if (!confirm("Are you sure you want to void this invoice?")) return;
    setActionLoading("void");
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await res.json();
      if (data.success) await fetchInvoice();
    } finally {
      setActionLoading("");
    }
  };

  const handleRecordPayment = async () => {
    if (!invoice || !paymentAmount) return;
    setActionLoading("payment");
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: invoice.id,
          customer_id: invoice.customer_id,
          amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
          notes: paymentNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowPaymentModal(false);
        setPaymentAmount("");
        setPaymentNotes("");
        await fetchInvoice();
      }
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Invoice not found</p>
        <button onClick={() => router.back()} className="mt-4 text-orange-600 hover:text-orange-700">
          Go back
        </button>
      </div>
    );
  }

  const balance = invoice.total - (invoice.amount_paid || 0);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{invoice.invoice_number}</h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-gray-500 mt-1">
              Created {new Date(invoice.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {invoice.stripe_pdf_url && (
            <a
              href={invoice.stripe_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded-lg"
            >
              <Download className="w-4 h-4" />
              PDF
            </a>
          )}
          {invoice.stripe_hosted_url && (
            <a
              href={invoice.stripe_hosted_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded-lg"
            >
              <ExternalLink className="w-4 h-4" />
              Payment Page
            </a>
          )}
          {["draft", "sent", "viewed", "overdue", "partial"].includes(invoice.status) && (
            <button
              onClick={() => {
                setPaymentAmount(balance.toFixed(2));
                setShowPaymentModal(true);
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded-lg"
            >
              <CreditCard className="w-4 h-4" />
              Record Payment
            </button>
          )}
          {invoice.status === "draft" && (
            <button
              onClick={handleSend}
              disabled={actionLoading === "send"}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {actionLoading === "send" ? "Sending..." : "Send Invoice"}
            </button>
          )}
          {invoice.status === "sent" && (
            <button
              onClick={handleSend}
              disabled={actionLoading === "send"}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Resend
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">${invoice.total.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Paid</p>
          <p className="text-2xl font-bold text-green-600">${(invoice.amount_paid || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Balance Due</p>
          <p className={`text-2xl font-bold ${balance > 0 ? "text-orange-600" : "text-green-600"}`}>
            ${balance.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Due Date</p>
          <p className="text-2xl font-bold text-gray-900">
            {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}
          </p>
        </div>
      </div>

      {/* Customer & Invoice Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">BILL TO</h3>
          <p className="font-semibold text-gray-900">{invoice.customer?.name}</p>
          {invoice.customer?.company && (
            <p className="text-sm text-gray-600">{invoice.customer.company}</p>
          )}
          <p className="text-sm text-gray-600">{invoice.customer?.email}</p>
          {invoice.customer?.phone && <p className="text-sm text-gray-600">{invoice.customer.phone}</p>}
          {invoice.customer?.address && (
            <p className="text-sm text-gray-500 mt-1">
              {invoice.customer.address}<br />
              {invoice.customer.city}, {invoice.customer.state} {invoice.customer.zip}
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">INVOICE DETAILS</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Invoice #</span>
              <span className="font-medium">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span>{new Date(invoice.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Due Date</span>
              <span>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "Upon Receipt"}</span>
            </div>
            {invoice.sent_at && (
              <div className="flex justify-between">
                <span className="text-gray-500">Sent</span>
                <span>{new Date(invoice.sent_at).toLocaleDateString()}</span>
              </div>
            )}
            {invoice.paid_at && (
              <div className="flex justify-between">
                <span className="text-gray-500">Paid</span>
                <span className="text-green-600">{new Date(invoice.paid_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            Line Items
          </h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Description</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Type</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Qty</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Unit Price</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item) => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                <td className="px-6 py-4 text-sm text-gray-500 capitalize">{item.item_type}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">${item.unit_price.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200">
              <td colSpan={4} className="px-6 py-3 text-sm text-gray-500 text-right">Subtotal</td>
              <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">${invoice.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={4} className="px-6 py-3 text-sm text-gray-500 text-right">
                Tax ({(invoice.tax_rate * 100).toFixed(2)}%)
              </td>
              <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">${invoice.tax_amount.toFixed(2)}</td>
            </tr>
            <tr className="border-t border-gray-300 bg-gray-50">
              <td colSpan={4} className="px-6 py-4 text-base font-semibold text-gray-900 text-right">Total</td>
              <td className="px-6 py-4 text-base font-bold text-gray-900 text-right">${invoice.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payment History */}
      {invoice.payments && invoice.payments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-600" />
            Payment History
          </h3>
          <div className="space-y-3">
            {invoice.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  {payment.status === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : payment.status === "failed" ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      ${payment.amount.toFixed(2)} via {payment.payment_method.replace("_", " ")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.payment_date).toLocaleDateString()}
                      {payment.notes && ` - ${payment.notes}`}
                    </p>
                  </div>
                </div>
                <StatusBadge status={payment.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {invoice.notes && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">NOTES</h3>
          <p className="text-sm text-gray-700">{invoice.notes}</p>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pb-8">
        <div className="flex gap-2">
          {!["paid", "cancelled", "refunded"].includes(invoice.status) && (
            <>
              <button
                onClick={handleMarkPaid}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Paid
              </button>
              <button
                onClick={handleVoid}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Void Invoice
              </button>
            </>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-7 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                >
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="ach">ACH/Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Check number, reference, etc."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={actionLoading === "payment" || !paymentAmount}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50"
              >
                {actionLoading === "payment" ? "Recording..." : "Record Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
