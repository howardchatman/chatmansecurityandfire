"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Phone, Mail, DollarSign, CheckCircle,
  AlertTriangle, Clock, User, Building2, FileText, ChevronDown,
  ChevronUp, AlertCircle, RefreshCw, Calendar,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

interface Job {
  id: string;
  job_number?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  site_address?: string;
  site_city?: string;
  site_state?: string;
  site_zip?: string;
  job_type?: string;
  priority?: string;
  status: string;
  total_amount?: number;
  notes?: string;
  description?: string;
  created_at: string;
  scheduled_date?: string;
}

// ── Note parsers ────────────────────────────────────────────────────────────

function parseSection(notes: string, heading: string): string {
  const idx = notes.indexOf(heading);
  if (idx === -1) return "";
  const after = notes.slice(idx + heading.length);
  const nextHeading = after.search(/\n[A-Z][A-Z ]+:/);
  return (nextHeading === -1 ? after : after.slice(0, nextHeading)).trim();
}

function parseContractValue(notes: string): number | null {
  const match = notes.match(/CONTRACT:\s*\$?([\d,]+)/i);
  return match ? parseInt(match[1].replace(/,/g, "")) : null;
}

function parseGCContact(notes: string) {
  const match = notes.match(/GC:\s*([^\|]+)\|?\s*([\d\-]+)?\s*\|?\s*([^\n]+)?/i);
  if (!match) return null;
  return {
    name: match[1]?.trim() || "",
    phone: match[2]?.trim() || "",
    email: match[3]?.trim() || "",
  };
}

function parseDrawAmount(notes: string): number | null {
  const match = notes.match(/\$([\d,]+(?:\.\d+)?)\/(week|draw)/i);
  if (match) return parseFloat(match[1].replace(/,/g, ""));
  const m2 = notes.match(/Draw\s*1[^:]*:\s*\$([\d,]+(?:\.\d+)?)/i);
  if (m2) return parseFloat(m2[1].replace(/,/g, ""));
  return null;
}

function parseDrawCount(notes: string): number {
  const match = notes.match(/(\d+)\s*weekly draws/i);
  if (match) return parseInt(match[1]);
  return 10;
}

function parseCriticalItems(notes: string): { level: "URGENT" | "HIGH" | "MEDIUM" | "LOW"; text: string }[] {
  const section = parseSection(notes, "CRITICAL ITEMS OPEN:");
  if (!section) return [];
  return section
    .split("\n")
    .filter((l) => l.trim().startsWith("-"))
    .map((line) => {
      const stripped = line.replace(/^-\s*/, "").trim();
      const levelMatch = stripped.match(/^(URGENT|HIGH|MEDIUM|LOW):\s*/i);
      const level = (levelMatch?.[1]?.toUpperCase() as any) || "MEDIUM";
      const text = levelMatch ? stripped.slice(levelMatch[0].length) : stripped;
      return { level, text };
    });
}

function parseScopeLines(notes: string): { label: string; amount: number }[] {
  const section = parseSection(notes, "CONTRACT:");
  const lines = section.split("\n").filter((l) => l.trim().startsWith("-"));
  return lines.flatMap((line) => {
    const m = line.match(/-\s*(.+?):\s*\$([\d,]+)/);
    if (!m) return [];
    return [{ label: m[1].trim(), amount: parseInt(m[2].replace(/,/g, "")) }];
  });
}

function parseOccupancy(notes: string): string {
  const match = notes.match(/Occupancy:\s*([^\n|]+)/i);
  return match ? match[1].trim() : "";
}

function parsePermit(notes: string): string {
  const match = notes.match(/Permit\s*#?:\s*([^\n—]+)/i);
  return match ? match[1].trim() : "";
}

// ── Level colors ─────────────────────────────────────────────────────────

const levelColors: Record<string, string> = {
  URGENT: "bg-red-100 text-red-700 border-red-200",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  LOW: "bg-gray-100 text-gray-600 border-gray-200",
};

const levelIcons: Record<string, React.ElementType> = {
  URGENT: AlertCircle,
  HIGH: AlertTriangle,
  MEDIUM: Clock,
  LOW: CheckCircle,
};

// ── Draw tracker ──────────────────────────────────────────────────────────

function DrawSchedule({ count, amount }: { count: number; amount: number }) {
  const [paid, setPaid] = useState<boolean[]>(Array(count).fill(false));
  const paidCount = paid.filter(Boolean).length;
  const paidTotal = paidCount * amount;
  const remaining = count * amount - paidTotal;

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-xs text-green-600 mb-0.5">Collected</p>
          <p className="text-base font-bold text-green-700">{fmt(paidTotal)}</p>
          <p className="text-xs text-green-500">{paidCount} of {count} draws</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <p className="text-xs text-amber-600 mb-0.5">Remaining</p>
          <p className="text-base font-bold text-amber-700">{fmt(remaining)}</p>
          <p className="text-xs text-amber-500">{count - paidCount} draws left</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center col-span-2 sm:col-span-1">
          <p className="text-xs text-blue-600 mb-0.5">Per Draw</p>
          <p className="text-base font-bold text-blue-700">{fmt(amount)}</p>
          <p className="text-xs text-blue-500">weekly</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${(paidCount / count) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {paid.map((isPaid, i) => (
          <button
            key={i}
            onClick={() => {
              const next = [...paid];
              next[i] = !next[i];
              setPaid(next);
            }}
            title={`Draw ${i + 1}: ${fmt(amount)} — click to toggle`}
            className={`flex flex-col items-center p-2 rounded-lg border text-xs font-medium transition-all ${
              isPaid
                ? "bg-green-500 border-green-500 text-white"
                : "bg-white border-gray-200 text-gray-500 hover:border-orange-400"
            }`}
          >
            <span className="text-xs font-bold">{i + 1}</span>
            {isPaid ? <CheckCircle className="w-3.5 h-3.5 mt-0.5" /> : <DollarSign className="w-3.5 h-3.5 mt-0.5" />}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">Click a draw to mark it as collected</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullNotes, setShowFullNotes] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((d) => setJob(d.data || d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Project not found.</p>
        <Link href="/admin/projects" className="text-orange-600 hover:underline text-sm mt-2 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  const notes = job.notes || "";
  const contractVal = job.total_amount || parseContractValue(notes);
  const gc = parseGCContact(notes);
  const drawAmount = parseDrawAmount(notes);
  const drawCount = parseDrawCount(notes);
  const criticalItems = parseCriticalItems(notes);
  const scopeLines = parseScopeLines(notes);
  const occupancy = parseOccupancy(notes);
  const permit = parsePermit(notes);

  const firstLine = notes.split("\n")[0]?.trim() || job.customer_name;
  const projectTitle = firstLine && firstLine.length < 80 ? firstLine : job.customer_name;

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + Header */}
      <div>
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          All Projects
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{projectTitle}</h1>
            {projectTitle !== job.customer_name && (
              <p className="text-gray-500 mt-0.5">{job.customer_name}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={job.status} />
              {job.job_type && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 capitalize">
                  {job.job_type}
                </span>
              )}
              {job.priority && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700 capitalize">
                  {job.priority} priority
                </span>
              )}
              {job.job_number && (
                <span className="text-xs text-gray-400 font-mono">#{job.job_number}</span>
              )}
            </div>
          </div>
          <Link
            href={`/admin/jobs/${job.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm flex-shrink-0"
          >
            <FileText className="w-4 h-4" />
            Full Job Record
          </Link>
        </div>
      </div>

      {/* Critical Action Items */}
      {criticalItems.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-red-50">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h2 className="font-semibold text-red-800 text-sm">Critical Action Items ({criticalItems.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {criticalItems.map((item, i) => {
              const Icon = levelIcons[item.level] || AlertCircle;
              return (
                <div key={i} className="flex items-start gap-3 px-5 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border flex-shrink-0 mt-0.5 ${levelColors[item.level]}`}>
                    <Icon className="w-3 h-3" />
                    {item.level}
                  </span>
                  <p className="text-sm text-gray-700">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top cards: Contract + Site Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Contract */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            Contract
          </h2>
          {contractVal && (
            <p className="text-3xl font-bold text-gray-900 mb-1">{fmt(contractVal)}</p>
          )}
          {scopeLines.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {scopeLines.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{s.label}</span>
                  <span className="font-medium text-gray-900">{fmt(s.amount)}</span>
                </div>
              ))}
            </div>
          )}
          {permit && (
            <p className="text-xs text-gray-400 mt-3">Permit: {permit}</p>
          )}
        </div>

        {/* Site + Project Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Project Site
          </h2>
          <div className="space-y-2 text-sm text-gray-700">
            {job.site_address && (
              <div>
                <p>{job.site_address}</p>
                {(job.site_city || job.site_state) && (
                  <p className="text-gray-500">{[job.site_city, job.site_state, job.site_zip].filter(Boolean).join(", ")}</p>
                )}
              </div>
            )}
            {occupancy && (
              <p className="text-gray-500 text-xs mt-1">Occupancy: {occupancy}</p>
            )}
            {job.scheduled_date && (
              <div className="flex items-center gap-1.5 text-gray-500 text-xs pt-1">
                <Calendar className="w-3.5 h-3.5" />
                Scheduled: {new Date(job.scheduled_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Owner / Customer */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-purple-600" />
            Owner / Customer
          </h2>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-900">{job.customer_name}</p>
            {job.customer_phone && (
              <a href={`tel:${job.customer_phone}`} className="flex items-center gap-1.5 text-gray-600 hover:text-orange-600">
                <Phone className="w-3.5 h-3.5" />
                {job.customer_phone}
              </a>
            )}
            {job.customer_email && (
              <a href={`mailto:${job.customer_email}`} className="flex items-center gap-1.5 text-gray-600 hover:text-orange-600 truncate">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                {job.customer_email}
              </a>
            )}
          </div>
        </div>

        {/* GC */}
        {gc ? (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              General Contractor
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{gc.name}</p>
              {gc.phone && (
                <a href={`tel:${gc.phone}`} className="flex items-center gap-1.5 text-gray-600 hover:text-orange-600">
                  <Phone className="w-3.5 h-3.5" />
                  {gc.phone}
                </a>
              )}
              {gc.email && (
                <a href={`mailto:${gc.email}`} className="flex items-center gap-1.5 text-gray-600 hover:text-orange-600 truncate">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  {gc.email}
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-5 flex items-center justify-center">
            <p className="text-sm text-gray-400">No GC contact on record</p>
          </div>
        )}
      </div>

      {/* Draw Schedule */}
      {drawAmount && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            Payment Draw Schedule
          </h2>
          <DrawSchedule count={drawCount} amount={drawAmount} />
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowFullNotes(!showFullNotes)}
            className="w-full flex items-center justify-between px-5 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Project Notes</h2>
            </div>
            {showFullNotes ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {showFullNotes && (
            <pre className="px-5 py-4 text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
              {notes}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
