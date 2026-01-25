"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

export default function AppearanceSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [compactMode, setCompactMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const themes = [
    { id: "light", label: "Light", icon: Sun, description: "Light background with dark text" },
    { id: "dark", label: "Dark", icon: Moon, description: "Dark background with light text" },
    { id: "system", label: "System", icon: Monitor, description: "Match your device settings" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/settings"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appearance</h1>
          <p className="text-gray-500 mt-1">Theme and display settings</p>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id as Theme)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                theme === t.id
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <t.icon
                  className={`w-5 h-5 ${
                    theme === t.id ? "text-orange-600" : "text-gray-500"
                  }`}
                />
                <span
                  className={`font-medium ${
                    theme === t.id ? "text-orange-600" : "text-gray-900"
                  }`}
                >
                  {t.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">{t.description}</p>
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Dark mode coming soon. Currently only light theme is available.
        </p>
      </div>

      {/* Display Options */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Display Options
        </h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Compact Mode</p>
              <p className="text-sm text-gray-500">
                Reduce spacing and padding throughout the interface
              </p>
            </div>
            <button
              onClick={() => setCompactMode(!compactMode)}
              className={`w-12 h-6 rounded-full transition-colors ${
                compactMode ? "bg-orange-600" : "bg-gray-200"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  compactMode ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                Collapse Sidebar by Default
              </p>
              <p className="text-sm text-gray-500">
                Start with the sidebar in collapsed state
              </p>
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`w-12 h-6 rounded-full transition-colors ${
                sidebarCollapsed ? "bg-orange-600" : "bg-gray-200"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  sidebarCollapsed ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
