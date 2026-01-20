"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Ticket,
  Calendar,
  Download,
  Filter,
  FileText,
  PieChart,
  Activity,
} from "lucide-react";

interface ReportCard {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
}

const reportCards: ReportCard[] = [
  {
    id: "revenue",
    name: "Revenue Report",
    description: "Monthly and annual revenue breakdown",
    category: "Finance",
    icon: DollarSign,
  },
  {
    id: "sales",
    name: "Sales Pipeline",
    description: "Lead conversion and sales funnel analysis",
    category: "Sales",
    icon: TrendingUp,
  },
  {
    id: "customers",
    name: "Customer Report",
    description: "Customer acquisition and retention metrics",
    category: "CRM",
    icon: Users,
  },
  {
    id: "service",
    name: "Service Report",
    description: "Ticket resolution and response times",
    category: "Operations",
    icon: Ticket,
  },
  {
    id: "technician",
    name: "Technician Performance",
    description: "Work order completion and efficiency",
    category: "Operations",
    icon: Activity,
  },
  {
    id: "inventory",
    name: "Inventory Report",
    description: "Stock levels and usage trends",
    category: "Inventory",
    icon: PieChart,
  },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("this_month");

  const stats = [
    {
      name: "Total Revenue",
      value: "$48,250",
      change: "+12%",
      trend: "up",
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      name: "New Customers",
      value: "24",
      change: "+8%",
      trend: "up",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "Tickets Resolved",
      value: "156",
      change: "+15%",
      trend: "up",
      icon: Ticket,
      color: "bg-purple-100 text-purple-600",
    },
    {
      name: "Avg Response Time",
      value: "2.4h",
      change: "-18%",
      trend: "down",
      icon: Calendar,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const monthlyData = [
    { month: "Jan", revenue: 32000, leads: 45, tickets: 120 },
    { month: "Feb", revenue: 35000, leads: 52, tickets: 135 },
    { month: "Mar", revenue: 41000, leads: 48, tickets: 142 },
    { month: "Apr", revenue: 38000, leads: 55, tickets: 128 },
    { month: "May", revenue: 44000, leads: 62, tickets: 145 },
    { month: "Jun", revenue: 48250, leads: 68, tickets: 156 },
  ];

  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track performance and business metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-5 h-5 text-gray-500" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-500">{stat.name}</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </span>
                <span
                  className={`inline-flex items-center text-sm font-medium ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Revenue Overview
            </h2>
            <p className="text-sm text-gray-500">Monthly revenue for 2024</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-sm text-gray-600">Revenue</span>
            </div>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="flex items-end justify-between gap-2 h-64">
          {monthlyData.map((data) => (
            <div
              key={data.month}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div className="w-full flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1">
                  ${(data.revenue / 1000).toFixed(0)}k
                </span>
                <div
                  className="w-full bg-red-500 rounded-t-lg transition-all hover:bg-red-600"
                  style={{
                    height: `${(data.revenue / maxRevenue) * 200}px`,
                  }}
                />
              </div>
              <span className="text-sm text-gray-600">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Report Cards Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Available Reports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportCards.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                    <Icon className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {report.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {report.description}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                      {report.category}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                    View Report
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Technicians
          </h2>
          <div className="space-y-4">
            {[
              { name: "Mike Johnson", jobs: 45, rating: 4.9 },
              { name: "Sarah Williams", jobs: 42, rating: 4.8 },
              { name: "Tom Davis", jobs: 38, rating: 4.7 },
              { name: "Emily Chen", jobs: 35, rating: 4.9 },
            ].map((tech, idx) => (
              <div
                key={tech.name}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-gray-900">{tech.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{tech.jobs} jobs</span>
                  <span className="text-sm font-medium text-yellow-600">
                    ★ {tech.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Categories */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue by Service
          </h2>
          <div className="space-y-4">
            {[
              { name: "Installations", value: 45, amount: "$21,712" },
              { name: "Monitoring", value: 30, amount: "$14,475" },
              { name: "Repairs", value: 15, amount: "$7,237" },
              { name: "Maintenance", value: 10, amount: "$4,825" },
            ].map((service) => (
              <div key={service.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {service.name}
                  </span>
                  <span className="text-sm text-gray-500">{service.amount}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${service.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
