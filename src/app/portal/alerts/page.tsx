"use client";

import { useState } from "react";
import {
  Bell,
  Shield,
  Lock,
  Camera,
  AlertTriangle,
  CheckCircle,
  Filter,
  Calendar,
} from "lucide-react";

export default function AlertsPage() {
  const [filter, setFilter] = useState("all");

  const alerts = [
    {
      id: "1",
      type: "arm",
      title: "System Armed",
      message: "Security system armed in Away mode",
      time: "Today, 8:00 AM",
      icon: Shield,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "2",
      type: "access",
      title: "Front Door Unlocked",
      message: "Front door was unlocked via mobile app",
      time: "Yesterday, 6:15 PM",
      icon: Lock,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "3",
      type: "motion",
      title: "Motion Detected",
      message: "Motion detected in backyard - Camera 4",
      time: "Yesterday, 3:42 PM",
      icon: Camera,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      id: "4",
      type: "disarm",
      title: "System Disarmed",
      message: "Security system disarmed via keypad",
      time: "Yesterday, 3:30 PM",
      icon: Shield,
      color: "bg-gray-100 text-gray-600",
    },
    {
      id: "5",
      type: "access",
      title: "Garage Door Opened",
      message: "Garage door was opened",
      time: "Yesterday, 3:28 PM",
      icon: Lock,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "6",
      type: "arm",
      title: "System Armed",
      message: "Security system armed in Stay mode",
      time: "Yesterday, 11:00 PM",
      icon: Shield,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "7",
      type: "motion",
      title: "Motion Detected",
      message: "Motion detected at front door - Camera 1",
      time: "2 days ago, 2:15 PM",
      icon: Camera,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      id: "8",
      type: "system",
      title: "System Check Complete",
      message: "Weekly automated system check completed successfully",
      time: "3 days ago, 3:00 AM",
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
  ];

  const filteredAlerts = alerts.filter(
    (alert) => filter === "all" || alert.type === filter
  );

  const alertTypes = [
    { value: "all", label: "All Alerts" },
    { value: "arm", label: "Arm/Disarm" },
    { value: "access", label: "Access" },
    { value: "motion", label: "Motion" },
    { value: "system", label: "System" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alerts & Activity</h1>
        <p className="text-gray-600 mt-1">
          View all security events and system activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Bell className="w-4 h-4" />
            Today
          </div>
          <p className="text-2xl font-bold text-gray-900">3</p>
          <p className="text-xs text-gray-500">alerts</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Calendar className="w-4 h-4" />
            This Week
          </div>
          <p className="text-2xl font-bold text-gray-900">24</p>
          <p className="text-xs text-gray-500">alerts</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Camera className="w-4 h-4" />
            Motion Events
          </div>
          <p className="text-2xl font-bold text-gray-900">12</p>
          <p className="text-xs text-gray-500">this week</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <AlertTriangle className="w-4 h-4" />
            Alarms
          </div>
          <p className="text-2xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-500">this month</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {alertTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilter(type.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === type.value
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${alert.color}`}>
                  <alert.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{alert.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {alert.message}
                      </p>
                    </div>
                    <span className="text-sm text-gray-400 whitespace-nowrap">
                      {alert.time}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No alerts found</p>
            <p className="text-sm mt-1">
              Try adjusting your filter to see more alerts
            </p>
          </div>
        )}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="px-6 py-2 text-red-600 hover:text-red-700 font-medium">
          Load More Alerts
        </button>
      </div>
    </div>
  );
}
