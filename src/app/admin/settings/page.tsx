"use client";

import { Settings, User, Bell, Shield, Palette, Database } from "lucide-react";

const settingSections = [
  {
    title: "Profile Settings",
    description: "Manage your account information",
    icon: User,
    href: "/admin/settings/profile",
  },
  {
    title: "Notifications",
    description: "Configure alert preferences",
    icon: Bell,
    href: "/admin/settings/notifications",
  },
  {
    title: "Security",
    description: "Password and authentication",
    icon: Shield,
    href: "/admin/settings/security",
  },
  {
    title: "Appearance",
    description: "Theme and display settings",
    icon: Palette,
    href: "/admin/settings/appearance",
  },
  {
    title: "Data Management",
    description: "Import, export, and backup",
    icon: Database,
    href: "/admin/settings/data",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingSections.map((section) => (
          <div
            key={section.title}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-xl">
                <section.icon className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{section.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{section.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
