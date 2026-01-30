"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  Ticket,
  Calendar,
  UserPlus,
  AlertTriangle,
  ClipboardCheck,
  Phone,
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import RecentActivity from "@/components/admin/RecentActivity";
import QuickActions from "@/components/admin/QuickActions";

interface DashboardStats {
  activeJobs: number;
  totalCustomers: number;
  openTickets: number;
  scheduledThisWeek: number;
  newLeadsThisMonth: number;
  pendingInvoiceAmount: number;
  revenueThisMonth: number;
  callsThisWeek: number;
  totalRevenue: number;
  jobsCompleted: number;
  inspectionsPassed: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    totalCustomers: 0,
    openTickets: 0,
    scheduledThisWeek: 0,
    newLeadsThisMonth: 0,
    pendingInvoiceAmount: 0,
    revenueThisMonth: 0,
    callsThisWeek: 0,
    totalRevenue: 0,
    jobsCompleted: 0,
    inspectionsPassed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [customersRes, invoicesRes, paymentsRes, jobsRes, leadsRes] = await Promise.all([
        fetch("/api/customers").then((r) => r.json()).catch(() => ({ data: [] })),
        fetch("/api/invoices").then((r) => r.json()).catch(() => ({ data: [] })),
        fetch("/api/payments").then((r) => r.json()).catch(() => ({ data: [] })),
        fetch("/api/jobs").then((r) => r.json()).catch(() => ({ data: [] })),
        fetch("/api/leads").then((r) => r.json()).catch(() => ({ data: [] })),
      ]);

      const customers = customersRes.data || [];
      const invoices = invoicesRes.data || [];
      const payments = paymentsRes.data || [];
      const jobs = jobsRes.data || [];
      const leads = leadsRes.data || [];

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());

      // Calculate stats
      const activeJobs = jobs.filter((j: { status: string }) =>
        ["scheduled", "in_progress", "approved", "pending"].includes(j.status)
      ).length;

      const scheduledThisWeek = jobs.filter((j: { scheduled_date: string; status: string }) =>
        j.scheduled_date && new Date(j.scheduled_date) >= weekStart && new Date(j.scheduled_date) <= new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      ).length;

      const newLeadsThisMonth = leads.filter((l: { created_at: string }) =>
        new Date(l.created_at) >= monthStart
      ).length;

      const pendingInvoiceAmount = invoices
        .filter((i: { status: string }) => ["sent", "partial", "overdue"].includes(i.status))
        .reduce((sum: number, i: { total: number; amount_paid: number }) => sum + (i.total - (i.amount_paid || 0)), 0);

      const revenueThisMonth = payments
        .filter((p: { status: string; payment_date: string }) =>
          p.status === "completed" && new Date(p.payment_date) >= monthStart
        )
        .reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);

      const totalRevenue = payments
        .filter((p: { status: string }) => p.status === "completed")
        .reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);

      const jobsCompleted = jobs.filter((j: { status: string }) =>
        ["completed", "invoiced", "paid", "closed"].includes(j.status)
      ).length;

      setStats({
        activeJobs,
        totalCustomers: customers.length,
        openTickets: 0,
        scheduledThisWeek,
        newLeadsThisMonth,
        pendingInvoiceAmount,
        revenueThisMonth,
        callsThisWeek: 0,
        totalRevenue,
        jobsCompleted,
        inspectionsPassed: 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, Howard.
        </p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Jobs"
          value={loading ? "..." : String(stats.activeJobs)}
          icon={ClipboardCheck}
          color="green"
          subtitle="In progress"
        />
        <StatCard
          title="Customers"
          value={loading ? "..." : String(stats.totalCustomers)}
          icon={Users}
          color="blue"
          subtitle="Total"
        />
        <StatCard
          title="Open Tickets"
          value={loading ? "..." : String(stats.openTickets)}
          icon={Ticket}
          color="amber"
          subtitle="Pending"
        />
        <StatCard
          title="Scheduled"
          value={loading ? "..." : String(stats.scheduledThisWeek)}
          icon={Calendar}
          color="red"
          subtitle="This week"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="New Leads"
          value={loading ? "..." : String(stats.newLeadsThisMonth)}
          icon={UserPlus}
          color="blue"
          subtitle="This month"
        />
        <StatCard
          title="Pending Invoices"
          value={loading ? "..." : formatCurrency(stats.pendingInvoiceAmount)}
          icon={AlertTriangle}
          color="red"
          subtitle="Outstanding"
        />
        <StatCard
          title="Revenue"
          value={loading ? "..." : formatCurrency(stats.revenueThisMonth)}
          icon={DollarSign}
          color="green"
          subtitle="This month"
        />
        <StatCard
          title="Calls"
          value={loading ? "..." : String(stats.callsThisWeek)}
          icon={Phone}
          color="amber"
          subtitle="This week"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Summary Stats Bar */}
      <div className="bg-neutral-900 rounded-xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {loading ? "..." : formatCurrency(stats.totalRevenue)}
            </p>
            <p className="text-sm text-gray-400">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {loading ? "..." : stats.totalCustomers}
            </p>
            <p className="text-sm text-gray-400">Total Customers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {loading ? "..." : stats.jobsCompleted}
            </p>
            <p className="text-sm text-gray-400">Jobs Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {loading ? "..." : stats.inspectionsPassed}
            </p>
            <p className="text-sm text-gray-400">Inspections Passed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
