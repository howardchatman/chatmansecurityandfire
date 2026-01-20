"use client";

import {
  Users,
  Ticket,
  FileText,
  CreditCard,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Activity {
  id: string;
  type: "lead" | "ticket" | "invoice" | "payment" | "call" | "appointment";
  title: string;
  description: string;
  time: string;
  status?: "success" | "warning" | "info";
}

const iconMap = {
  lead: Users,
  ticket: Ticket,
  invoice: FileText,
  payment: CreditCard,
  call: Phone,
  appointment: Calendar,
};

const statusColors = {
  success: "text-green-500",
  warning: "text-amber-500",
  info: "text-blue-500",
};

// Mock data
const activities: Activity[] = [
  {
    id: "1",
    type: "lead",
    title: "New lead received",
    description: "John Smith requested a quote for residential security",
    time: "5 minutes ago",
    status: "info",
  },
  {
    id: "2",
    type: "ticket",
    title: "Ticket completed",
    description: "TKT-2024-000123 - Alarm panel replacement",
    time: "1 hour ago",
    status: "success",
  },
  {
    id: "3",
    type: "payment",
    title: "Payment received",
    description: "$450.00 from ABC Corporation",
    time: "2 hours ago",
    status: "success",
  },
  {
    id: "4",
    type: "appointment",
    title: "Appointment scheduled",
    description: "Installation at 123 Main St - Tomorrow 9:00 AM",
    time: "3 hours ago",
    status: "info",
  },
  {
    id: "5",
    type: "ticket",
    title: "Emergency ticket created",
    description: "TKT-2024-000124 - Fire alarm malfunction",
    time: "4 hours ago",
    status: "warning",
  },
  {
    id: "6",
    type: "call",
    title: "AIVA call completed",
    description: "Lead qualification call - 5 min duration",
    time: "5 hours ago",
    status: "success",
  },
];

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Recent Activity</h3>
      </div>

      <div className="divide-y divide-gray-50">
        {activities.map((activity) => {
          const Icon = iconMap[activity.type];
          return (
            <div
              key={activity.id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-lg bg-gray-100 ${
                    activity.status ? statusColors[activity.status] : "text-gray-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    {activity.status === "success" && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {activity.status === "warning" && (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
        <button className="text-sm text-red-600 hover:text-red-700 font-medium">
          View all activity
        </button>
      </div>
    </div>
  );
}
