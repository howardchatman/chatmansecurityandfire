"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bell,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Phone,
  Calendar,
  Loader2,
  Ticket,
  ArrowRight,
  Wrench,
} from "lucide-react";

interface Summary {
  customer: { name: string; company: string | null; email: string; address: string | null; city: string | null } | null;
  stats: { amountDue: number; openInvoices: number; openRequests: number; upcomingJobs: number };
  invoices: { id: string; invoice_number: string; status: string; total: number; amount_paid: number | null; due_date: string | null; created_at: string }[];
  requests: { id: string; ticket_number: string; title: string; status: string; created_at: string }[];
  jobs: { id: string; job_number: string; job_type: string | null; status: string; scheduled_date: string | null; site_address: string | null; description: string | null }[];
  alerts: { id: string; type: string; severity: string; title: string; message: string; date: string | null; href: string }[];
}

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const shortDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

const severityStyle: Record<string, string> = {
  high: "border-red-200 bg-red-50",
  medium: "border-amber-200 bg-amber-50",
  info: "border-blue-200 bg-blue-50",
};
const severityIcon: Record<string, string> = {
  high: "text-red-600",
  medium: "text-amber-600",
  info: "text-blue-600",
};

export default function PortalDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/portal/summary");
        const json = await res.json();
        if (json.success) setData(json.data);
        else setError(json.error || "Couldn't load your account.");
      } catch {
        setError("Couldn't load your account. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const firstName = (data?.customer?.name || user?.name || "").split(" ")[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  const stats = data?.stats ?? { amountDue: 0, openInvoices: 0, openRequests: 0, upcomingJobs: 0 };
  const alerts = data?.alerts ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-gray-600 mt-1">
          {data?.customer?.company || data?.customer?.name || "Your account"}
          {data?.customer?.city ? ` · ${data.customer.city}` : ""}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/portal/invoices" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-300 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg"><FileText className="w-5 h-5 text-orange-600" /></div>
            <span className="text-sm text-gray-500">Amount Due</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{money(stats.amountDue)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.openInvoices} open invoice{stats.openInvoices === 1 ? "" : "s"}
          </p>
        </Link>

        <Link href="/portal/support" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-300 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg"><Ticket className="w-5 h-5 text-blue-600" /></div>
            <span className="text-sm text-gray-500">Open Requests</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.openRequests}</p>
          <p className="text-xs text-gray-500 mt-1">service requests</p>
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg"><Calendar className="w-5 h-5 text-green-600" /></div>
            <span className="text-sm text-gray-500">Scheduled Work</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.upcomingJobs}</p>
          <p className="text-xs text-gray-500 mt-1">upcoming visits</p>
        </div>

        <Link href="/portal/alerts" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-300 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg"><Bell className="w-5 h-5 text-amber-600" /></div>
            <span className="text-sm text-gray-500">Alerts</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
          <p className="text-xs text-gray-500 mt-1">need your attention</p>
        </Link>
      </div>

      {/* Alerts preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Needs attention</h2>
          {alerts.length > 3 && (
            <Link href="/portal/alerts" className="text-sm text-orange-600 font-medium hover:underline">
              View all
            </Link>
          )}
        </div>
        {alerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="font-medium text-gray-900">You&apos;re all caught up</p>
            <p className="text-sm text-gray-500 mt-1">No overdue invoices or open items.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 3).map((a) => (
              <Link key={a.id} href={a.href} className={`block rounded-xl border p-4 ${severityStyle[a.severity] || severityStyle.info}`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${severityIcon[a.severity] || severityIcon.info}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{a.title}</p>
                    <p className="text-sm text-gray-600">{a.message}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming work */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming work</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {(data?.jobs?.length ?? 0) === 0 ? (
              <div className="p-8 text-center">
                <Wrench className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Nothing scheduled right now.</p>
              </div>
            ) : (
              data!.jobs.map((jb) => (
                <div key={jb.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 capitalize">
                        {(jb.job_type || "Service").replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {jb.site_address || jb.description || jb.job_number}
                      </p>
                    </div>
                    <span className="text-sm text-gray-600 flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      {shortDate(jb.scheduled_date)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent invoices */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Recent invoices</h2>
            <Link href="/portal/invoices" className="text-sm text-orange-600 font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {(data?.invoices?.length ?? 0) === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No invoices yet.</p>
              </div>
            ) : (
              data!.invoices.map((inv) => (
                <Link key={inv.id} href="/portal/invoices" className="block p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{inv.invoice_number}</p>
                      <p className="text-xs text-gray-500">{shortDate(inv.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{money(inv.total)}</p>
                      <p className={`text-xs capitalize ${inv.status === "paid" ? "text-green-600" : "text-gray-500"}`}>
                        {inv.status}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="bg-[#0D1B2A] rounded-xl p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-semibold">Need something looked at?</p>
          <p className="text-white/70 text-sm">Submit a request, or call us if it&apos;s urgent.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/portal/support" className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium text-sm">
            Request service
          </Link>
          <a href="tel:8328597009" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium text-sm">
            <Phone className="w-4 h-4" /> (832) 859-7009
          </a>
        </div>
      </div>
    </div>
  );
}
