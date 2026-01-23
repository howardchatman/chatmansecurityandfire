"use client";

import { Inbox } from "lucide-react";

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Recent Activity</h3>
      </div>

      <div className="px-6 py-12 text-center">
        <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No activity yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Activity will appear here as you add leads, jobs, and customers.
        </p>
      </div>
    </div>
  );
}
