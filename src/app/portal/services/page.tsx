"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  Camera,
  Lock,
  Flame,
  Bell,
  Wifi,
  Droplets,
  Lightbulb,
  Speaker,
  DoorOpen,
  KeyRound,
  CheckCircle,
  AlertTriangle,
  CalendarClock,
  Loader2,
  Phone,
  LucideIcon,
} from "lucide-react";
import {
  SYSTEM_TYPE_LABELS,
  FREQUENCY_LABELS,
  daysUntilDue,
} from "@/lib/customer-systems";

interface SystemRow {
  id: string;
  system_type: string;
  description: string | null;
  location: string | null;
  quantity: number;
  manufacturer: string | null;
  model: string | null;
  install_date: string | null;
  last_inspection_date: string | null;
  inspection_frequency: string;
  next_inspection_due: string | null;
  monitored: boolean;
  status: string;
}

const ICONS: Record<string, LucideIcon> = {
  fire_alarm: Bell,
  sprinkler: Droplets,
  extinguisher: Flame,
  emergency_lighting: Lightbulb,
  fire_lane: Shield,
  knox_box: KeyRound,
  security_alarm: Shield,
  video_surveillance: Camera,
  access_control: Lock,
  pa_system: Speaker,
  nurse_call: Bell,
  gate_entry: DoorOpen,
  fiber_network: Wifi,
  other: Shield,
};

const fmt = (v: string | null) =>
  v ? new Date(v + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";

export default function PortalServicesPage() {
  const [rows, setRows] = useState<SystemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/portal/systems");
        const data = await res.json();
        if (data.success) setRows(data.data || []);
        else setError(data.error || "Couldn't load your systems.");
      } catch {
        setError("Couldn't load your systems. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const monitoredCount = rows.filter((r) => r.monitored).length;
  const dueSoon = rows.filter((r) => {
    const d = daysUntilDue(r.next_inspection_due);
    return d !== null && d <= 45;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Systems</h1>
        <p className="text-gray-600 mt-1">
          The fire and life safety equipment we maintain at your property
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">{error}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-900">No systems on file yet</p>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Once we&apos;ve documented the equipment at your property, it will appear here with
            inspection dates.
          </p>
          <a href="tel:8328597009" className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium">
            <Phone className="w-4 h-4" /> (832) 859-7009
          </a>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Systems on file</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{rows.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Monitored 24/7</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{monitoredCount}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Inspections coming up</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{dueSoon.length}</p>
            </div>
          </div>

          {/* Systems */}
          <div className="grid gap-4 md:grid-cols-2">
            {rows.map((r) => {
              const Icon = ICONS[r.system_type] || Shield;
              const d = daysUntilDue(r.next_inspection_due);
              const overdue = d !== null && d < 0;
              const soon = d !== null && d >= 0 && d <= 45;
              return (
                <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-orange-50 rounded-xl flex-shrink-0">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {SYSTEM_TYPE_LABELS[r.system_type] || r.system_type}
                            {r.quantity > 1 && <span className="text-gray-500 font-normal"> ×{r.quantity}</span>}
                          </h3>
                          {r.location && <p className="text-sm text-gray-500">{r.location}</p>}
                        </div>
                        {r.status === "needs_service" ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 flex-shrink-0">
                            Needs service
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1 flex-shrink-0">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>

                      {(r.manufacturer || r.model || r.description) && (
                        <p className="text-sm text-gray-600 mt-2">
                          {[r.manufacturer, r.model].filter(Boolean).join(" ")}
                          {r.description ? (r.manufacturer || r.model ? ` — ${r.description}` : r.description) : ""}
                        </p>
                      )}

                      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Last inspected</p>
                          <p className="text-gray-900">{fmt(r.last_inspection_date)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Next inspection</p>
                          <p className={overdue ? "text-red-700 font-medium" : soon ? "text-amber-700 font-medium" : "text-gray-900"}>
                            {fmt(r.next_inspection_due)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <CalendarClock className="w-3.5 h-3.5" />
                          {FREQUENCY_LABELS[r.inspection_frequency]}
                        </span>
                        {r.monitored && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            <Shield className="w-3 h-3" /> Monitored 24/7
                          </span>
                        )}
                        {overdue && (
                          <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                            Inspection overdue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="bg-[#0D1B2A] rounded-xl p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-semibold">Need an inspection scheduled or something added?</p>
          <p className="text-white/70 text-sm">Send us a request and we&apos;ll get it on the calendar.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/portal/support" className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium text-sm">
            Request service
          </Link>
          <a href="tel:8328597009" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium text-sm">
            <Phone className="w-4 h-4" /> (832) 859-7009
          </a>
        </div>
      </div>
    </div>
  );
}
