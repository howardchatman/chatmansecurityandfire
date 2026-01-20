"use client";

import Link from "next/link";
import {
  UserPlus,
  Ticket,
  FileText,
  Calendar,
  Plus,
} from "lucide-react";

const actions = [
  {
    name: "New Lead",
    description: "Add a new prospect",
    href: "/admin/leads/new",
    icon: UserPlus,
    color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
  },
  {
    name: "New Ticket",
    description: "Create service ticket",
    href: "/admin/tickets/new",
    icon: Ticket,
    color: "bg-amber-50 text-amber-600 hover:bg-amber-100",
  },
  {
    name: "New Invoice",
    description: "Create an invoice",
    href: "/admin/invoices/new",
    icon: FileText,
    color: "bg-green-50 text-green-600 hover:bg-green-100",
  },
  {
    name: "Schedule",
    description: "Book appointment",
    href: "/admin/scheduling",
    icon: Calendar,
    color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Quick Actions</h3>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${action.color}`}
          >
            <action.icon className="w-6 h-6" />
            <div className="text-center">
              <p className="text-sm font-medium">{action.name}</p>
              <p className="text-xs opacity-70">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
