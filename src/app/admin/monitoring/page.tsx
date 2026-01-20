"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Bell,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Activity,
  Wifi,
  WifiOff,
  Volume2,
  Eye,
  RefreshCw,
} from "lucide-react";

interface Alarm {
  id: string;
  type: "intrusion" | "fire" | "panic" | "medical" | "tamper" | "low_battery";
  status: "active" | "acknowledged" | "resolved" | "false_alarm";
  customer: string;
  address: string;
  zone: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  operator?: string;
  notes?: string;
}

interface SystemStatus {
  id: string;
  customer: string;
  address: string;
  status: "online" | "offline" | "trouble";
  lastCheckin: string;
  panelType: string;
  zones: number;
  activeAlarms: number;
}

const mockAlarms: Alarm[] = [
  {
    id: "1",
    type: "intrusion",
    status: "active",
    customer: "ABC Corporation",
    address: "123 Business Park Dr",
    zone: "Front Door - Zone 1",
    triggeredAt: "2024-01-19T14:32:00",
  },
  {
    id: "2",
    type: "fire",
    status: "active",
    customer: "Tech Solutions Inc",
    address: "456 Tech Blvd",
    zone: "Server Room - Smoke Detector",
    triggeredAt: "2024-01-19T14:28:00",
  },
  {
    id: "3",
    type: "panic",
    status: "acknowledged",
    customer: "Downtown Bank",
    address: "789 Financial St",
    zone: "Teller Station 3",
    triggeredAt: "2024-01-19T14:15:00",
    acknowledgedAt: "2024-01-19T14:16:00",
    operator: "Sarah W.",
  },
  {
    id: "4",
    type: "low_battery",
    status: "resolved",
    customer: "Retail Chain LLC",
    address: "321 Shopping Way",
    zone: "Motion Sensor - Zone 5",
    triggeredAt: "2024-01-19T13:45:00",
    acknowledgedAt: "2024-01-19T13:47:00",
    resolvedAt: "2024-01-19T14:00:00",
    operator: "Mike J.",
    notes: "Customer replaced battery",
  },
];

const mockSystems: SystemStatus[] = [
  {
    id: "1",
    customer: "ABC Corporation",
    address: "123 Business Park Dr",
    status: "online",
    lastCheckin: "2024-01-19T14:30:00",
    panelType: "DSC PowerSeries",
    zones: 16,
    activeAlarms: 1,
  },
  {
    id: "2",
    customer: "Tech Solutions Inc",
    address: "456 Tech Blvd",
    status: "online",
    lastCheckin: "2024-01-19T14:31:00",
    panelType: "Honeywell Vista",
    zones: 24,
    activeAlarms: 1,
  },
  {
    id: "3",
    customer: "Retail Chain LLC",
    address: "321 Shopping Way",
    status: "trouble",
    lastCheckin: "2024-01-19T14:25:00",
    panelType: "Bosch B Series",
    zones: 32,
    activeAlarms: 0,
  },
  {
    id: "4",
    customer: "Wilson Warehouses",
    address: "555 Industrial Ave",
    status: "offline",
    lastCheckin: "2024-01-19T12:00:00",
    panelType: "DSC Neo",
    zones: 48,
    activeAlarms: 0,
  },
];

const alarmTypeConfig = {
  intrusion: {
    label: "Intrusion",
    icon: Shield,
    color: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
  },
  fire: {
    label: "Fire",
    icon: AlertTriangle,
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
  },
  panic: {
    label: "Panic",
    icon: Bell,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
  },
  medical: {
    label: "Medical",
    icon: Activity,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
  },
  tamper: {
    label: "Tamper",
    icon: XCircle,
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
  },
  low_battery: {
    label: "Low Battery",
    icon: Activity,
    color: "bg-gray-500",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
  },
};

const statusConfig = {
  active: { label: "Active", color: "bg-red-100 text-red-700" },
  acknowledged: { label: "Acknowledged", color: "bg-yellow-100 text-yellow-700" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700" },
  false_alarm: { label: "False Alarm", color: "bg-gray-100 text-gray-700" },
};

export default function MonitoringPage() {
  const [alarms, setAlarms] = useState<Alarm[]>(mockAlarms);
  const [systems] = useState<SystemStatus[]>(mockSystems);
  const [selectedTab, setSelectedTab] = useState<"alarms" | "systems">("alarms");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const activeAlarms = alarms.filter((a) => a.status === "active").length;
  const acknowledgedAlarms = alarms.filter(
    (a) => a.status === "acknowledged"
  ).length;
  const onlineSystems = systems.filter((s) => s.status === "online").length;
  const offlineSystems = systems.filter((s) => s.status === "offline").length;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alarm Monitoring</h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring of all connected systems
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              soundEnabled
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Volume2 className="w-5 h-5" />
            Sound {soundEnabled ? "On" : "Off"}
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-5 h-5 text-gray-500" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-red-600" />
              {activeAlarms > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Alarms</p>
              <p className="text-2xl font-bold text-red-600">{activeAlarms}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Eye className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Acknowledged</p>
              <p className="text-2xl font-bold text-yellow-600">
                {acknowledgedAlarms}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Wifi className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Systems Online</p>
              <p className="text-2xl font-bold text-green-600">{onlineSystems}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <WifiOff className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Systems Offline</p>
              <p className="text-2xl font-bold text-gray-600">{offlineSystems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setSelectedTab("alarms")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              selectedTab === "alarms"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Active Alarms ({activeAlarms + acknowledgedAlarms})
          </button>
          <button
            onClick={() => setSelectedTab("systems")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              selectedTab === "systems"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            System Status ({systems.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {selectedTab === "alarms" ? (
        <div className="space-y-4">
          {alarms
            .filter((a) => ["active", "acknowledged"].includes(a.status))
            .sort((a, b) => {
              if (a.status === "active" && b.status !== "active") return -1;
              if (a.status !== "active" && b.status === "active") return 1;
              return (
                new Date(b.triggeredAt).getTime() -
                new Date(a.triggeredAt).getTime()
              );
            })
            .map((alarm) => {
              const type = alarmTypeConfig[alarm.type];
              const status = statusConfig[alarm.status];
              const TypeIcon = type.icon;

              return (
                <div
                  key={alarm.id}
                  className={`rounded-xl border-2 p-6 ${
                    alarm.status === "active"
                      ? "border-red-300 bg-red-50"
                      : "border-yellow-300 bg-yellow-50"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${type.color} text-white flex-shrink-0`}
                    >
                      <TypeIcon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}
                            >
                              {status.label}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${type.bgColor} ${type.textColor}`}
                            >
                              {type.label}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {alarm.customer}
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatTime(alarm.triggeredAt)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getTimeSince(alarm.triggeredAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {alarm.address}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-4 h-4" />
                          {alarm.zone}
                        </div>
                        {alarm.operator && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            {alarm.operator}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {alarm.status === "active" && (
                          <button className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                            Acknowledge
                          </button>
                        )}
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors">
                          <CheckCircle className="w-4 h-4" />
                          Resolve
                        </button>
                        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                          <Phone className="w-4 h-4" />
                          Call Customer
                        </button>
                        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                          <XCircle className="w-4 h-4" />
                          False Alarm
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          {alarms.filter((a) => ["active", "acknowledged"].includes(a.status))
            .length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">All Clear</h3>
              <p className="text-gray-500">No active alarms at this time</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Panel
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Zones
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Last Check-in
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Alarms
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {systems.map((system) => (
                <tr key={system.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {system.status === "online" ? (
                        <Wifi className="w-5 h-5 text-green-500" />
                      ) : system.status === "offline" ? (
                        <WifiOff className="w-5 h-5 text-red-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                      <span
                        className={`text-sm font-medium capitalize ${
                          system.status === "online"
                            ? "text-green-700"
                            : system.status === "offline"
                            ? "text-red-700"
                            : "text-yellow-700"
                        }`}
                      >
                        {system.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {system.customer}
                      </p>
                      <p className="text-sm text-gray-500">{system.address}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {system.panelType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {system.zones}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">
                        {formatTime(system.lastCheckin)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getTimeSince(system.lastCheckin)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {system.activeAlarms > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        <Bell className="w-3 h-3" />
                        {system.activeAlarms}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
