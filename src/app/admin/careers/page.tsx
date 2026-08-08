"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Star,
  Users,
  ExternalLink,
} from "lucide-react";
import { ROLES } from "@/lib/careers";

interface Application {
  id: string;
  role_slug: string;
  role_title: string;
  full_name: string;
  email: string;
  phone: string;
  city: string | null;
  years_experience: string | null;
  disciplines: string[];
  licenses: string | null;
  message: string | null;
  resume_filename: string | null;
  resume_link?: string | null;
  wants_profile: boolean;
  status: string;
  created_at: string;
}

const STATUSES = ["new", "reviewing", "interviewing", "offered", "hired", "not_a_fit", "archived"];

const statusColor: Record<string, string> = {
  new: "bg-orange-100 text-orange-700",
  reviewing: "bg-blue-100 text-blue-700",
  interviewing: "bg-purple-100 text-purple-700",
  offered: "bg-amber-100 text-amber-700",
  hired: "bg-green-100 text-green-700",
  not_a_fit: "bg-gray-100 text-gray-500",
  archived: "bg-gray-100 text-gray-400",
};

const fmt = (v: string) =>
  new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function AdminCareersPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/careers/apply?status=${status}&role_slug=${role}`);
      const data = await res.json();
      if (data.success) setApps(data.data || []);
    } catch {
      /* leave empty */
    } finally {
      setLoading(false);
    }
  }, [status, role]);

  useEffect(() => { load(); }, [load]);

  const setAppStatus = async (id: string, next: string) => {
    // Optimistic — the list is long and a round trip per click feels broken.
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: next } : a)));
    await fetch("/api/careers/apply", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
  };

  const newCount = apps.filter((a) => a.status === "new").length;
  const poolCount = apps.filter((a) => a.wants_profile).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-500 mt-1">People who applied through the careers pages</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Star className="w-4 h-4 text-orange-500" /> New
          </div>
          <p className="text-2xl font-bold text-gray-900">{newCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Users className="w-4 h-4 text-gray-400" /> Total
          </div>
          <p className="text-2xl font-bold text-gray-900">{apps.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <FileText className="w-4 h-4 text-gray-400" /> On file for later
          </div>
          <p className="text-2xl font-bold text-gray-900">{poolCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={role} onChange={(e) => setRole(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="all">All roles</option>
          {ROLES.map((r) => <option key={r.slug} value={r.slug}>{r.title}</option>)}
          <option value="general">General / speculative</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>
      ) : apps.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-900">No applications yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Share <a href="/careers" className="text-orange-600 font-medium">chatmansecurityandfire.com/careers</a> on
            Indeed, Facebook, or with your crew.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{a.full_name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[a.status] || "bg-gray-100"}`}>
                      {a.status.replace(/_/g, " ")}
                    </span>
                    {a.wants_profile && (
                      <span className="text-xs text-gray-400" title="Asked to be kept on file">on file</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {a.role_title}
                    {a.years_experience ? ` · ${a.years_experience}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                    <a href={`tel:${a.phone}`} className="inline-flex items-center gap-1 text-gray-600 hover:text-orange-600">
                      <Phone className="w-3.5 h-3.5" /> {a.phone}
                    </a>
                    <a href={`mailto:${a.email}`} className="inline-flex items-center gap-1 text-gray-600 hover:text-orange-600">
                      <Mail className="w-3.5 h-3.5" /> {a.email}
                    </a>
                    {a.city && (
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        <MapPin className="w-3.5 h-3.5" /> {a.city}
                      </span>
                    )}
                  </div>
                  {a.disciplines?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {a.disciplines.map((d) => (
                        <span key={d} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{d}</span>
                      ))}
                    </div>
                  )}
                  {a.licenses && <p className="text-sm text-gray-600 mt-2"><strong>Licenses:</strong> {a.licenses}</p>}
                  {a.message && <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{a.message}</p>}
                </div>

                <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">{fmt(a.created_at)}</span>
                  {a.resume_link ? (
                    <a
                      href={a.resume_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <FileText className="w-3.5 h-3.5" /> Résumé
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">no résumé</span>
                  )}
                  <select
                    value={a.status}
                    onChange={(e) => setAppStatus(a.id, e.target.value)}
                    className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm capitalize"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
