"use client";

import Link from "next/link";
import {
  UserPlus,
  Calculator,
  FileText,
  Calendar,
  UserCog,
  Briefcase,
} from "lucide-react";

const actions = [
  {
    name: "New Lead",
    href: "/admin/leads",
    icon: UserPlus,
    color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
  },
  {
    name: "New Quote",
    href: "/admin/quote",
    icon: Calculator,
    color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
  },
  {
    name: "New Invoice",
    href: "/admin/invoices/new",
    icon: FileText,
    color: "bg-green-50 text-green-600 hover:bg-green-100",
  },
  {
    name: "New Job",
    href: "/admin/jobs",
    icon: Briefcase,
    color: "bg-violet-50 text-violet-600 hover:bg-violet-100",
  },
  {
    name: "Schedule",
    href: "/admin/scheduling",
    icon: Calendar,
    color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
  },
  {
    name: "Add Employee",
    href: "/admin/employees",
    icon: UserCog,
    color: "bg-amber-50 text-amber-600 hover:bg-amber-100",
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
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
            <p className="text-sm font-medium text-center">{action.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
