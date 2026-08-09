"use client";

import Link from "next/link";
import { Bell, ShieldCheck, ExternalLink, Phone, DollarSign } from "lucide-react";

// This page used to render a live-looking alarm board — "Downtown Bank",
// "Wilson Warehouses", panel models, alarm events, online/offline counts. None
// of it was real, and none of those were customers. A fabricated monitoring
// screen is worse than no screen: it is exactly the sort of thing you glance at
// and believe.
//
// Signals live with COPS Monitoring, not here. Until there is a real feed from
// them, this page says so plainly and points at what IS real — the monitored
// systems and recurring revenue recorded against each customer.

export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alarm Monitoring</h1>
        <p className="text-gray-600 mt-1">Central station signals and monitored accounts</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Bell className="w-6 h-6 text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">No signal feed connected</h2>
        <p className="text-sm text-gray-600 mt-2 max-w-lg mx-auto">
          Alarm signals are held by COPS Monitoring. Nothing is shown here because this system has no
          connection to them yet — and a monitoring board that invents its own events is worse than an
          empty one.
        </p>
        <p className="text-sm text-gray-600 mt-3 max-w-lg mx-auto">
          For live signals, use the COPS dealer portal. What we do track here is which customers have
          monitored systems and what they pay monthly.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium"
          >
            <ShieldCheck className="w-4 h-4" /> Monitored systems &amp; RMR
          </Link>
          <a
            href="https://www.copsmonitoring.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            COPS dealer portal <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <h3 className="font-semibold text-gray-900">Recurring revenue</h3>
          </div>
          <p className="text-sm text-gray-600">
            Every monitored system is recorded on the customer&apos;s Systems tab with its monthly
            rate. That roll-up is real and is the number worth watching.
          </p>
          <Link href="/admin/customers" className="inline-block mt-3 text-sm text-orange-600 font-medium hover:underline">
            Open Customers →
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Connecting COPS</h3>
          </div>
          <p className="text-sm text-gray-600">
            If COPS can provide dealer API access or send signal webhooks, this page can show live
            events against the right customer record. Ask your COPS rep what integration they offer
            for your account.
          </p>
        </div>
      </div>
    </div>
  );
}
