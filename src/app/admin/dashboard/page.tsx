"use client";

import {
  DollarSign,
  Users,
  Ticket,
  Calendar,
  UserPlus,
  AlertTriangle,
  TrendingUp,
  Star,
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import RecentActivity from "@/components/admin/RecentActivity";
import QuickActions from "@/components/admin/QuickActions";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value="$48,250"
          change={{ value: 12, trend: "up" }}
          icon={DollarSign}
          color="green"
          subtitle="This month"
        />
        <StatCard
          title="Active Customers"
          value="1,284"
          change={{ value: 8, trend: "up" }}
          icon={Users}
          color="blue"
          subtitle="+24 this month"
        />
        <StatCard
          title="Open Tickets"
          value="23"
          change={{ value: 5, trend: "down" }}
          icon={Ticket}
          color="amber"
          subtitle="3 emergency"
        />
        <StatCard
          title="Scheduled Jobs"
          value="18"
          icon={Calendar}
          color="red"
          subtitle="This week"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="New Leads"
          value="47"
          change={{ value: 23, trend: "up" }}
          icon={UserPlus}
          color="blue"
          subtitle="32% conversion"
        />
        <StatCard
          title="Overdue Invoices"
          value="$12,450"
          icon={AlertTriangle}
          color="red"
          subtitle="8 invoices"
        />
        <StatCard
          title="Tech Utilization"
          value="78%"
          change={{ value: 5, trend: "up" }}
          icon={TrendingUp}
          color="green"
          subtitle="Average"
        />
        <StatCard
          title="Customer Rating"
          value="4.8"
          icon={Star}
          color="amber"
          subtitle="Based on 156 reviews"
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

      {/* Charts Section (placeholder) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">Chart will be displayed here</p>
          </div>
        </div>

        {/* Ticket Status Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Ticket Status</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">Chart will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Summary Stats Bar */}
      <div className="bg-neutral-900 rounded-xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">$580K</p>
            <p className="text-sm text-gray-400">Annual Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">1,284</p>
            <p className="text-sm text-gray-400">Total Customers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">3,456</p>
            <p className="text-sm text-gray-400">Jobs Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">99.2%</p>
            <p className="text-sm text-gray-400">Uptime</p>
          </div>
        </div>
      </div>
    </div>
  );
}
