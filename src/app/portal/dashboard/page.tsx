"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  Shield,
  Bell,
  FileText,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Clock,
  Camera,
  Lock,
  Flame,
  Phone,
  Calendar,
} from "lucide-react";

export default function PortalDashboard() {
  const { user } = useAuth();

  const systemStatus = {
    status: "armed",
    lastArmed: "Today at 8:00 AM",
    cameras: 8,
    camerasOnline: 8,
    doors: 4,
    doorsSecure: 4,
  };

  const recentAlerts = [
    {
      id: "1",
      type: "info",
      message: "System armed - Away mode",
      time: "Today, 8:00 AM",
      icon: Shield,
    },
    {
      id: "2",
      type: "info",
      message: "Front door unlocked",
      time: "Yesterday, 6:15 PM",
      icon: Lock,
    },
    {
      id: "3",
      type: "warning",
      message: "Motion detected - Backyard",
      time: "Yesterday, 3:42 PM",
      icon: AlertTriangle,
    },
  ];

  const upcomingServices = [
    {
      id: "1",
      type: "Maintenance",
      date: "Jan 25, 2024",
      time: "10:00 AM - 12:00 PM",
      description: "Quarterly system check",
    },
  ];

  const quickStats = [
    {
      label: "System Status",
      value: "Armed",
      subtext: "Away Mode",
      icon: Shield,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Cameras",
      value: `${systemStatus.camerasOnline}/${systemStatus.cameras}`,
      subtext: "Online",
      icon: Camera,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Entry Points",
      value: `${systemStatus.doorsSecure}/${systemStatus.doors}`,
      subtext: "Secure",
      icon: Lock,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Fire Sensors",
      value: "6/6",
      subtext: "Active",
      icon: Flame,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-8 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name || "Customer"}!
        </h1>
        <p className="text-gray-300">
          Your home security system is active and monitoring.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors">
            <Shield className="w-5 h-5" />
            Arm/Disarm System
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors">
            <Camera className="w-5 h-5" />
            View Cameras
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-sm text-gray-500">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.subtext}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <a
              href="/portal/alerts"
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              View All
            </a>
          </div>
          <div className="space-y-4">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
              >
                <div
                  className={`p-2 rounded-lg ${
                    alert.type === "warning"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <alert.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Services */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Upcoming Services
            </h2>
            <a
              href="/portal/support"
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Request Service
            </a>
          </div>
          {upcomingServices.length > 0 ? (
            <div className="space-y-4">
              {upcomingServices.map((service) => (
                <div
                  key={service.id}
                  className="p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-gray-900">
                      {service.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {service.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {service.date} • {service.time}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No upcoming services scheduled</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/portal/invoices"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
          >
            <FileText className="w-6 h-6 text-red-600" />
            <span className="text-sm font-medium text-gray-700">View Invoices</span>
          </a>
          <a
            href="/portal/payments"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
          >
            <CreditCard className="w-6 h-6 text-red-600" />
            <span className="text-sm font-medium text-gray-700">Make Payment</span>
          </a>
          <a
            href="/portal/support"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
          >
            <Phone className="w-6 h-6 text-red-600" />
            <span className="text-sm font-medium text-gray-700">Contact Support</span>
          </a>
          <a
            href="/portal/alerts"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
          >
            <Bell className="w-6 h-6 text-red-600" />
            <span className="text-sm font-medium text-gray-700">View Alerts</span>
          </a>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-xl">
            <Phone className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">24/7 Emergency Support</h3>
            <p className="text-sm text-gray-600 mt-1">
              For emergencies, call our monitoring center immediately.
            </p>
            <a
              href="tel:1-800-555-1234"
              className="inline-flex items-center gap-2 mt-3 text-red-600 hover:text-red-700 font-semibold"
            >
              <Phone className="w-4 h-4" />
              1-800-555-1234
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
