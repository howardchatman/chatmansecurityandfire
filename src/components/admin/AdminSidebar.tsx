"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Ticket,
  Calendar,
  FileText,
  CreditCard,
  UserCog,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
  Package,
  Calculator,
  Kanban,
  FileCheck,
  ClipboardList,
  Bell,
  BarChart3,
} from "lucide-react";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navigation = [
  {
    section: "Dashboard",
    items: [
      { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    ],
  },
  {
    section: "CRM",
    items: [
      { name: "Leads", href: "/admin/leads", icon: Users },
      { name: "Pipeline", href: "/admin/pipeline", icon: Kanban },
      { name: "Customers", href: "/admin/customers", icon: Building2 },
    ],
  },
  {
    section: "Sales",
    items: [
      { name: "Quotes", href: "/admin/quotes", icon: FileCheck },
      { name: "Estimates", href: "/admin/estimates", icon: Calculator },
      { name: "Inventory", href: "/admin/inventory", icon: Package },
    ],
  },
  {
    section: "Operations",
    items: [
      { name: "Work Orders", href: "/admin/work-orders", icon: ClipboardList },
      { name: "Tickets", href: "/admin/tickets", icon: Ticket },
      { name: "Schedule", href: "/admin/scheduling", icon: Calendar },
    ],
  },
  {
    section: "Monitoring",
    items: [
      { name: "Alarms", href: "/admin/monitoring", icon: Bell },
    ],
  },
  {
    section: "Finance",
    items: [
      { name: "Invoices", href: "/admin/invoices", icon: FileText },
      { name: "Payments", href: "/admin/payments", icon: CreditCard },
    ],
  },
  {
    section: "Team",
    items: [
      { name: "Employees", href: "/admin/employees", icon: UserCog },
      { name: "Time Tracking", href: "/admin/time", icon: Clock },
    ],
  },
];

export default function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin" || pathname === "/admin/dashboard";
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-neutral-800">
        <div className="flex-shrink-0 bg-gradient-to-br from-red-500 to-red-700 p-2 rounded-xl">
          <Shield className="w-6 h-6 text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <span className="text-white font-bold text-lg">Security</span>
            <span className="text-red-500 font-bold text-lg">Platform</span>
          </div>
        )}
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navigation.map((group) => (
          <div key={group.section} className="mb-6">
            {!collapsed && (
              <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {group.section}
              </h3>
            )}
            <div className="space-y-1 px-2">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onMobileClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      active
                        ? "bg-red-600/10 text-red-500 border-l-2 border-red-500 -ml-0.5"
                        : "text-gray-400 hover:bg-neutral-800 hover:text-white"
                    }`}
                    title={collapsed ? item.name : undefined}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-red-500" : ""}`} />
                    {!collapsed && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings & Collapse Toggle */}
      <div className="border-t border-neutral-800 p-2">
        <Link
          href="/admin/settings"
          onClick={onMobileClose}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
            pathname.startsWith("/admin/settings")
              ? "bg-red-600/10 text-red-500"
              : "text-gray-400 hover:bg-neutral-800 hover:text-white"
          }`}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </Link>

        {/* Collapse button - desktop only */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-400 hover:bg-neutral-800 hover:text-white transition-all mt-1"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-neutral-900 border-r border-neutral-800 transition-all duration-300 z-50 hidden lg:flex flex-col ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-neutral-900 border-r border-neutral-800 z-50 lg:hidden flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
