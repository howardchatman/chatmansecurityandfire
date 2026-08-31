"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wrench,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Calendar,
  MapPin,
  MessageSquare,
  Phone,
  PauseCircle,
} from "lucide-react";

interface Update {
  id: string;
  note: string;
  created_at: string;
}

interface Project {
  id: string;
  job_number: string;
  title: string;
  scope: string | null;
  site: string;
  scheduled_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  stage: string;
  stage_label: string;
  stage_index: number;
  progress: number;
  is_complete: boolean;
  is_on_hold: boolean;
  updates: Update[];
}

interface StageDef { key: string; label: string; blurb: string }

const fmt = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;

const fmtShort = (v: string) =>
  new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function PortalProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stages, setStages] = useState<StageDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/portal/projects");
        const data = await res.json();
        if (data.success) {
          setProjects(data.data || []);
          setStages(data.stages || []);
        } else setError(data.error || "Couldn't load your projects.");
      } catch {
        setError("Couldn't load your projects. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const active = projects.filter((p) => !p.is_complete);
  const finished = projects.filter((p) => p.is_complete);

  const Card = ({ p }: { p: Project }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-mono text-gray-500">{p.job_number}</p>
            <h3 className="font-semibold text-gray-900 capitalize">{p.title}</h3>
            {p.site && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" /> {p.site}
              </p>
            )}
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 flex items-center gap-1 ${
              p.is_on_hold
                ? "bg-gray-100 text-gray-600"
                : p.is_complete
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
            }`}
          >
            {p.is_on_hold && <PauseCircle className="w-3 h-3" />}
            {p.is_complete && <CheckCircle className="w-3 h-3" />}
            {p.stage_label}
          </span>
        </div>

        {/* Stage tracker */}
        <div className="mt-5">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${p.is_complete ? "bg-green-500" : "bg-orange-500"}`}
              style={{ width: `${p.progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {stages.map((s, i) => {
              const done = i < p.stage_index || p.is_complete;
              const current = i === p.stage_index && !p.is_complete;
              return (
                <div key={s.key} className="flex-1 text-center">
                  <p
                    className={`text-xs ${
                      current ? "font-semibold text-orange-600" : done ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dates */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {fmt(p.scheduled_date) && (
            <span className="text-gray-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Scheduled {fmt(p.scheduled_date)}
            </span>
          )}
          {fmt(p.completed_at) && (
            <span className="text-green-700 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Completed {fmt(p.completed_at)}
            </span>
          )}
        </div>

        {p.scope && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">Scope of work</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{p.scope}</p>
          </div>
        )}
      </div>

      {/* Crew updates */}
      {p.updates.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/60 p-5">
          <p className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Updates from our crew
          </p>
          <div className="space-y-3">
            {p.updates.map((u) => (
              <div key={u.id} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 whitespace-pre-line">{u.note}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmtShort(u.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <p className="text-gray-600 mt-1">Where your work stands, updated by our crew as it happens</p>
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
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-900">No projects yet</p>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            When we schedule work at your property, you&apos;ll be able to follow its progress here.
          </p>
          <Link
            href="/portal/support"
            className="inline-block mt-5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium"
          >
            Request service
          </Link>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                In progress ({active.length})
              </h2>
              <div className="space-y-4">
                {active.map((p) => <Card key={p.id} p={p} />)}
              </div>
            </div>
          )}

          {finished.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Completed ({finished.length})
              </h2>
              <div className="space-y-4">
                {finished.map((p) => <Card key={p.id} p={p} />)}
              </div>
            </div>
          )}
        </>
      )}

      <div className="bg-[#0D1B2A] rounded-xl p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-semibold">Question about a project?</p>
          <p className="text-white/70 text-sm">Call and ask for Howard — you&apos;ll get a straight answer.</p>
        </div>
        <a
          href="tel:8328597009"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium text-sm flex-shrink-0"
        >
          <Phone className="w-4 h-4" /> (832) 859-7009
        </a>
      </div>
    </div>
  );
}
