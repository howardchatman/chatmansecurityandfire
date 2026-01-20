"use client";

import { Clock } from "lucide-react";

export default function TimePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
        <p className="text-gray-500 mt-1">Monitor employee hours and timesheets</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Time Entries</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          This page will display employee clock-in/out records, timesheets, and overtime tracking.
        </p>
      </div>
    </div>
  );
}
