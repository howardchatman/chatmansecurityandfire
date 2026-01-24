"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  FileText,
  Plus,
  Edit,
  Trash2,
  Loader2,
  ClipboardList,
  DollarSign,
  Play,
  Pause,
  Building,
} from "lucide-react";

interface Deficiency {
  id: string;
  category: string;
  location?: string;
  description: string;
  severity: string;
  status: string;
  recommended_action?: string;
  estimated_cost_low?: number;
  estimated_cost_high?: number;
  photos?: InspectionPhoto[];
}

interface InspectionPhoto {
  id: string;
  photo_url: string;
  caption?: string;
  photo_type: string;
  location?: string;
}

interface Inspection {
  id: string;
  inspection_number: string;
  customer_id?: string;
  customer_name: string;
  site_address: string;
  site_city?: string;
  site_state?: string;
  site_zip?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  inspection_type: string;
  status: string;
  scheduled_date?: string;
  scheduled_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  passed?: boolean;
  pass_with_deficiencies?: boolean;
  notes?: string;
  internal_notes?: string;
  fire_marshal_notes?: string;
  checklist_results?: ChecklistResult[];
  inspector?: { id: string; full_name: string; email: string; phone?: string };
  creator?: { id: string; full_name: string };
  deficiencies?: Deficiency[];
  photos?: InspectionPhoto[];
  created_at: string;
}

interface ChecklistResult {
  id: string;
  item: string;
  category: string;
  passed: boolean | null;
  notes?: string;
}

const inspectionTypeLabels: Record<string, string> = {
  fire_alarm: "Fire Alarm",
  sprinkler_monitoring: "Sprinkler Monitoring",
  reinspection: "Reinspection",
  fire_marshal_pre: "Fire Marshal Pre-Inspection",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700" },
  in_progress: { label: "In Progress", color: "bg-orange-100 text-orange-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-500" },
};

const severityConfig: Record<string, { label: string; color: string }> = {
  minor: { label: "Minor", color: "bg-yellow-100 text-yellow-700" },
  major: { label: "Major", color: "bg-orange-100 text-orange-700" },
  critical: { label: "Critical", color: "bg-red-100 text-red-700" },
};

const deficiencyStatusConfig: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "bg-red-100 text-red-700" },
  quoted: { label: "Quoted", color: "bg-blue-100 text-blue-700" },
  approved: { label: "Approved", color: "bg-purple-100 text-purple-700" },
  in_progress: { label: "In Progress", color: "bg-orange-100 text-orange-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
};

const categoryLabels: Record<string, string> = {
  emergency_lighting: "Emergency Lighting",
  duct_smoke: "Duct Smoke Detector",
  fire_lane: "Fire Lane",
  panel_trouble: "Panel Trouble",
  monitoring: "Monitoring",
  smoke_detector: "Smoke Detector",
  heat_detector: "Heat Detector",
  pull_station: "Pull Station",
  horn_strobe: "Horn/Strobe",
  sprinkler_head: "Sprinkler Head",
  valve: "Valve",
  signage: "Signage",
  documentation: "Documentation",
  other: "Other",
};

export default function InspectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAddDeficiency, setShowAddDeficiency] = useState(false);
  const [generatingQuote, setGeneratingQuote] = useState(false);
  const [selectedDeficiencies, setSelectedDeficiencies] = useState<string[]>([]);

  useEffect(() => {
    fetchInspection();
  }, [resolvedParams.id]);

  const fetchInspection = async () => {
    try {
      const response = await fetch(`/api/inspections/${resolvedParams.id}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setInspection(data.data);
    } catch (error) {
      console.error("Error fetching inspection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInspection = async () => {
    setUpdating(true);
    try {
      await fetch(`/api/inspections/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      fetchInspection();
    } catch (error) {
      console.error("Error starting inspection:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateQuote = async () => {
    if (selectedDeficiencies.length === 0) {
      alert("Please select at least one deficiency");
      return;
    }

    setGeneratingQuote(true);
    try {
      const response = await fetch("/api/deficiencies/generate-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deficiency_ids: selectedDeficiencies,
          inspection_id: resolvedParams.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate quote");

      const data = await response.json();
      router.push(`/admin/quotes/${data.data.id}`);
    } catch (error) {
      console.error("Error generating quote:", error);
      alert("Failed to generate quote");
    } finally {
      setGeneratingQuote(false);
    }
  };

  const toggleDeficiencySelection = (id: string) => {
    setSelectedDeficiencies((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const selectAllOpenDeficiencies = () => {
    const openIds = inspection?.deficiencies
      ?.filter((d) => d.status === "open")
      .map((d) => d.id) || [];
    setSelectedDeficiencies(openIds);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not scheduled";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const formatDateTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return "";
    return new Date(dateTimeStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Inspection not found</h2>
        <Link href="/admin/inspections" className="text-orange-600 hover:underline mt-2">
          Back to inspections
        </Link>
      </div>
    );
  }

  const statusInfo = statusConfig[inspection.status] || statusConfig.scheduled;
  const openDeficiencies = inspection.deficiencies?.filter((d) => d.status === "open").length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/inspections"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inspections
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {inspection.inspection_number}
            </h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            {inspection.passed === true && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-700">
                <CheckCircle className="w-4 h-4" />
                Passed
              </span>
            )}
            {inspection.passed === false && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-700">
                <XCircle className="w-4 h-4" />
                Failed
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">
            {inspectionTypeLabels[inspection.inspection_type]}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {inspection.status === "scheduled" && (
            <button
              onClick={handleStartInspection}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {updating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              Start Inspection
            </button>
          )}
          <button
            onClick={() => router.push(`/admin/inspections/${resolvedParams.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Edit className="w-5 h-5" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Site Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Customer & Site Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Customer</h3>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Building className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{inspection.customer_name}</p>
                    {inspection.contact_name && (
                      <p className="text-sm text-gray-500">{inspection.contact_name}</p>
                    )}
                  </div>
                </div>

                {(inspection.contact_phone || inspection.contact_email) && (
                  <div className="mt-3 space-y-1">
                    {inspection.contact_phone && (
                      <a
                        href={`tel:${inspection.contact_phone}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600"
                      >
                        <Phone className="w-4 h-4" />
                        {inspection.contact_phone}
                      </a>
                    )}
                    {inspection.contact_email && (
                      <a
                        href={`mailto:${inspection.contact_email}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600"
                      >
                        <Mail className="w-4 h-4" />
                        {inspection.contact_email}
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Site Address</h3>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-900">{inspection.site_address}</p>
                    {inspection.site_city && (
                      <p className="text-gray-600">
                        {inspection.site_city}
                        {inspection.site_state && `, ${inspection.site_state}`}
                        {inspection.site_zip && ` ${inspection.site_zip}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deficiencies */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Deficiencies</h2>
                {openDeficiencies > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                    {openDeficiencies} Open
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {openDeficiencies > 0 && (
                  <>
                    <button
                      onClick={selectAllOpenDeficiencies}
                      className="text-sm text-orange-600 hover:underline"
                    >
                      Select All Open
                    </button>
                    <button
                      onClick={handleGenerateQuote}
                      disabled={selectedDeficiencies.length === 0 || generatingQuote}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingQuote ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <DollarSign className="w-4 h-4" />
                      )}
                      Generate Quote ({selectedDeficiencies.length})
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowAddDeficiency(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {!inspection.deficiencies || inspection.deficiencies.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-600">No deficiencies found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inspection.deficiencies.map((deficiency) => {
                  const severityInfo = severityConfig[deficiency.severity] || severityConfig.minor;
                  const defStatusInfo = deficiencyStatusConfig[deficiency.status] || deficiencyStatusConfig.open;

                  return (
                    <div
                      key={deficiency.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        selectedDeficiencies.includes(deficiency.id)
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {deficiency.status === "open" && (
                          <input
                            type="checkbox"
                            checked={selectedDeficiencies.includes(deficiency.id)}
                            onChange={() => toggleDeficiencySelection(deficiency.id)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${severityInfo.color}`}>
                              {severityInfo.label}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${defStatusInfo.color}`}>
                              {defStatusInfo.label}
                            </span>
                            <span className="text-sm text-gray-500">
                              {categoryLabels[deficiency.category] || deficiency.category}
                            </span>
                          </div>

                          <p className="text-gray-900">{deficiency.description}</p>

                          {deficiency.location && (
                            <p className="text-sm text-gray-500 mt-1">
                              Location: {deficiency.location}
                            </p>
                          )}

                          {deficiency.recommended_action && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Recommended:</span> {deficiency.recommended_action}
                            </p>
                          )}

                          {(deficiency.estimated_cost_low || deficiency.estimated_cost_high) && (
                            <p className="text-sm text-green-600 font-medium mt-2">
                              Est. Cost: {formatCurrency(deficiency.estimated_cost_low)}
                              {deficiency.estimated_cost_high &&
                                deficiency.estimated_cost_high !== deficiency.estimated_cost_low &&
                                ` - ${formatCurrency(deficiency.estimated_cost_high)}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Photos */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Photos</h2>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700">
                <Camera className="w-4 h-4" />
                Add Photo
              </button>
            </div>

            {!inspection.photos || inspection.photos.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No photos uploaded</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {inspection.photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || "Inspection photo"}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs px-2 py-1 bg-black/50 rounded">
                        {photo.photo_type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {(inspection.notes || inspection.internal_notes || inspection.fire_marshal_notes) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <div className="space-y-4">
                {inspection.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">General Notes</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{inspection.notes}</p>
                  </div>
                )}
                {inspection.internal_notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Internal Notes</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{inspection.internal_notes}</p>
                  </div>
                )}
                {inspection.fire_marshal_notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Fire Marshal Notes</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{inspection.fire_marshal_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Schedule Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Scheduled Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(inspection.scheduled_date)}
                  </p>
                </div>
              </div>

              {inspection.scheduled_time && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Scheduled Time</p>
                    <p className="font-medium text-gray-900">
                      {formatTime(inspection.scheduled_time)}
                    </p>
                  </div>
                </div>
              )}

              {inspection.actual_start_time && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Play className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Started</p>
                    <p className="font-medium text-gray-900">
                      {formatDateTime(inspection.actual_start_time)}
                    </p>
                  </div>
                </div>
              )}

              {inspection.actual_end_time && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="font-medium text-gray-900">
                      {formatDateTime(inspection.actual_end_time)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inspector */}
          {inspection.inspector && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Inspector</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{inspection.inspector.full_name}</p>
                  {inspection.inspector.email && (
                    <p className="text-sm text-gray-500">{inspection.inspector.email}</p>
                  )}
                </div>
              </div>
              {inspection.inspector.phone && (
                <a
                  href={`tel:${inspection.inspector.phone}`}
                  className="flex items-center gap-2 mt-3 text-sm text-gray-600 hover:text-orange-600"
                >
                  <Phone className="w-4 h-4" />
                  {inspection.inspector.phone}
                </a>
              )}
            </div>
          )}

          {/* Checklist Progress */}
          {inspection.checklist_results && inspection.checklist_results.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Checklist Progress</h2>
              <div className="space-y-2">
                {(() => {
                  const passed = inspection.checklist_results.filter((r) => r.passed === true).length;
                  const failed = inspection.checklist_results.filter((r) => r.passed === false).length;
                  const pending = inspection.checklist_results.filter((r) => r.passed === null).length;
                  const total = inspection.checklist_results.length;
                  const percentage = Math.round((passed / total) * 100);

                  return (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
                        <div className="bg-green-50 rounded p-2">
                          <p className="font-semibold text-green-700">{passed}</p>
                          <p className="text-green-600 text-xs">Passed</p>
                        </div>
                        <div className="bg-red-50 rounded p-2">
                          <p className="font-semibold text-red-700">{failed}</p>
                          <p className="text-red-600 text-xs">Failed</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <p className="font-semibold text-gray-700">{pending}</p>
                          <p className="text-gray-600 text-xs">Pending</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <FileText className="w-5 h-5 text-gray-400" />
                Generate Report PDF
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <Mail className="w-5 h-5 text-gray-400" />
                Email Report to Customer
              </button>
              {openDeficiencies > 0 && (
                <button
                  onClick={handleGenerateQuote}
                  disabled={selectedDeficiencies.length === 0 || generatingQuote}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  Generate Repair Quote
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
