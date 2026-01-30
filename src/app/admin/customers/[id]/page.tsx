"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  Edit2,
  Save,
  X,
  FileText,
  Briefcase,
  CreditCard,
  DollarSign,
  Plus,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  status: string;
  created_at: string;
  quotes: Array<{
    id: string;
    quote_number: string;
    status: string;
    totals: { total?: number; grandTotal?: number };
    created_at: string;
  }>;
  jobs: Array<{
    id: string;
    job_number: string;
    status: string;
    job_type: string;
    scheduled_date: string;
    total_amount: number;
    description: string;
  }>;
  invoices: Array<{
    id: string;
    invoice_number: string;
    status: string;
    total: number;
    amount_paid: number;
    due_date: string;
    created_at: string;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    payment_method: string;
    payment_date: string;
    status: string;
  }>;
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<CustomerData>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      const data = await res.json();
      if (data.success) {
        setCustomer(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) {
        setEditing(false);
        await fetchCustomer();
      }
    } finally {
      setSaving(false);
    }
  };

  const startEditing = () => {
    if (!customer) return;
    setEditData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zip: customer.zip,
      notes: customer.notes,
    });
    setEditing(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found</p>
      </div>
    );
  }

  const totalInvoiced = customer.invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = customer.payments.reduce((sum, p) => sum + (p.status === "completed" ? p.amount : 0), 0);
  const outstanding = customer.invoices
    .filter((inv) => !["paid", "cancelled"].includes(inv.status))
    .reduce((sum, inv) => sum + (inv.total - (inv.amount_paid || 0)), 0);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "quotes", label: `Quotes (${customer.quotes.length})` },
    { key: "jobs", label: `Jobs (${customer.jobs.length})` },
    { key: "invoices", label: `Invoices (${customer.invoices.length})` },
    { key: "payments", label: `Payments (${customer.payments.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              <StatusBadge status={customer.status || "active"} />
            </div>
            <p className="text-gray-500 mt-1">Customer since {new Date(customer.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/invoices/new?customer=${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Invoiced</p>
          <p className="text-2xl font-bold text-gray-900">${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className={`text-2xl font-bold ${outstanding > 0 ? "text-orange-600" : "text-green-600"}`}>
            ${outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Jobs</p>
          <p className="text-2xl font-bold text-blue-600">{customer.jobs.length}</p>
        </div>
      </div>

      {/* Customer Info + Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Contact Info</h3>
            {!editing ? (
              <button onClick={startEditing} className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="text-sm text-gray-500 hover:text-gray-700">
                  <X className="w-4 h-4" />
                </button>
                <button onClick={handleSave} disabled={saving} className="text-sm text-orange-600 hover:text-orange-700">
                  <Save className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <input
                value={editData.name || ""}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                placeholder="Name"
              />
              <input
                value={editData.email || ""}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                placeholder="Email"
              />
              <input
                value={editData.phone || ""}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                placeholder="Phone"
              />
              <input
                value={editData.company || ""}
                onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                placeholder="Company"
              />
              <input
                value={editData.address || ""}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                placeholder="Address"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  value={editData.city || ""}
                  onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  placeholder="City"
                />
                <input
                  value={editData.state || ""}
                  onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  placeholder="State"
                />
                <input
                  value={editData.zip || ""}
                  onChange={(e) => setEditData({ ...editData, zip: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  placeholder="ZIP"
                />
              </div>
              <textarea
                value={editData.notes || ""}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none"
                rows={3}
                placeholder="Notes"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{customer.phone}</span>
                </div>
              )}
              {customer.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{customer.company}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-700">
                    {customer.address}<br />
                    {customer.city}, {customer.state} {customer.zip}
                  </span>
                </div>
              )}
              {customer.notes && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{customer.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs Content */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className="flex gap-1 border-b border-gray-200 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                {[...customer.invoices.slice(0, 3).map(inv => ({
                  type: "invoice" as const,
                  title: `Invoice ${inv.invoice_number}`,
                  subtitle: `$${inv.total.toFixed(2)}`,
                  status: inv.status,
                  date: inv.created_at,
                  icon: FileText,
                })),
                ...customer.jobs.slice(0, 3).map(job => ({
                  type: "job" as const,
                  title: `Job ${job.job_number}`,
                  subtitle: job.description,
                  status: job.status,
                  date: job.scheduled_date || "",
                  icon: Briefcase,
                }))].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status} />
                      {item.date && (
                        <span className="text-xs text-gray-400">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {customer.invoices.length === 0 && customer.jobs.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No activity yet</p>
                )}
              </div>
            </div>
          )}

          {/* Quotes Tab */}
          {activeTab === "quotes" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {customer.quotes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No quotes yet</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Quote</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Amount</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.quotes.map((quote) => (
                      <tr key={quote.id} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/quotes`)}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{quote.quote_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          ${((quote.totals?.total || quote.totals?.grandTotal || 0) as number).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={quote.status} /></td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(quote.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === "jobs" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {customer.jobs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No jobs yet</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Job</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Type</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Scheduled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.jobs.map((job) => (
                      <tr key={job.id} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/jobs/${job.id}`)}>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{job.job_number}</p>
                          <p className="text-xs text-gray-500">{job.description}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">{job.job_type}</td>
                        <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === "invoices" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {customer.invoices.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No invoices yet</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Invoice</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Total</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Paid</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.invoices.map((inv) => (
                      <tr key={inv.id} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/invoices/${inv.id}`)}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{inv.invoice_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">${inv.total.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-green-600">${(inv.amount_paid || 0).toFixed(2)}</td>
                        <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {customer.payments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No payments yet</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Amount</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Method</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.payments.map((payment) => (
                      <tr key={payment.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">${payment.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">{payment.payment_method.replace("_", " ")}</td>
                        <td className="px-4 py-3"><StatusBadge status={payment.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
