"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export default function NotificationsSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "new_lead",
      label: "New Leads",
      description: "When a new lead is submitted",
      email: true,
      push: true,
      sms: false,
    },
    {
      id: "access_request",
      label: "Access Requests",
      description: "When someone requests portal access",
      email: true,
      push: true,
      sms: true,
    },
    {
      id: "quote_accepted",
      label: "Quote Accepted",
      description: "When a customer accepts a quote",
      email: true,
      push: true,
      sms: true,
    },
    {
      id: "invoice_paid",
      label: "Invoice Paid",
      description: "When an invoice is paid",
      email: true,
      push: false,
      sms: false,
    },
    {
      id: "urgent_call",
      label: "Urgent Calls",
      description: "High-priority calls from Chad AI",
      email: true,
      push: true,
      sms: true,
    },
  ]);

  const toggleSetting = (
    id: string,
    channel: "email" | "push" | "sms"
  ) => {
    setSettings(
      settings.map((s) =>
        s.id === id ? { ...s, [channel]: !s[channel] } : s
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Configure alert preferences</p>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <span className="text-sm font-medium text-gray-500">
                Notification Type
              </span>
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-gray-500">Email</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-gray-500">Push</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-gray-500">SMS</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {settings.map((setting) => (
            <div key={setting.id} className="p-6">
              <div className="grid grid-cols-4 gap-4 items-center">
                <div>
                  <p className="font-medium text-gray-900">{setting.label}</p>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => toggleSetting(setting.id, "email")}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      setting.email ? "bg-orange-600" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        setting.email ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => toggleSetting(setting.id, "push")}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      setting.push ? "bg-orange-600" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        setting.push ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => toggleSetting(setting.id, "sms")}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      setting.sms ? "bg-orange-600" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        setting.sms ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
