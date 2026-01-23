"use client";

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

export default function DashboardPage() {
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
          value="0"
          icon={ClipboardCheck}
          color="green"
          subtitle="In progress"
        />
        <StatCard
          title="Customers"
          value="0"
          icon={Users}
          color="blue"
          subtitle="Total"
        />
        <StatCard
          title="Open Tickets"
          value="0"
          icon={Ticket}
          color="amber"
          subtitle="Pending"
        />
        <StatCard
          title="Scheduled"
          value="0"
          icon={Calendar}
          color="red"
          subtitle="This week"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="New Leads"
          value="0"
          icon={UserPlus}
          color="blue"
          subtitle="This month"
        />
        <StatCard
          title="Pending Invoices"
          value="$0"
          icon={AlertTriangle}
          color="red"
          subtitle="Outstanding"
        />
        <StatCard
          title="Revenue"
          value="$0"
          icon={DollarSign}
          color="green"
          subtitle="This month"
        />
        <StatCard
          title="Calls"
          value="0"
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
            <p className="text-2xl font-bold text-white">$0</p>
            <p className="text-sm text-gray-400">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-gray-400">Total Customers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-gray-400">Jobs Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-gray-400">Inspections Passed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
