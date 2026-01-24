"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  Calendar,
  Phone,
  Play,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Navigation,
  ClipboardList,
} from "lucide-react";

interface Inspection {
  id: string;
  inspection_number: string;
  customer_name: string;
  site_address: string;
  site_city?: string;
  site_state?: string;
  contact_phone?: string;
  inspection_type: string;
  status: string;
  scheduled_date?: string;
  scheduled_time?: string;
  passed?: boolean;
  pass_with_deficiencies?: boolean;
}

const inspectionTypeLabels: Record<string, string> = {
  fire_alarm: "Fire Alarm",
  sprinkler_monitoring: "Sprinkler Monitoring",
  reinspection: "Reinspection",
  fire_marshal_pre: "Fire Marshal Pre",
};

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function TechInspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      const response = await fetch("/api/portal/inspections");
      if (!response.ok) {
        throw new Error("Failed to fetch inspections");
      }
      const data = await response.json();
      setInspections(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inspections");
    } finally {
      setLoading(false);
    }
  };

  const handleStartInspection = async (inspectionId: string) => {
    try {
      await fetch(`/api/inspections/${inspectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      router.push(`/tech/inspection/${inspectionId}`);
    } catch (err) {
      console.error("Error starting inspection:", err);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
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

  const openMaps = (address: string, city?: string, state?: string) => {
    const fullAddress = `${address}${city ? `, ${city}` : ""}${state ? `, ${state}` : ""}`;
    const encoded = encodeURIComponent(fullAddress);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, "_blank");
  };

  const callCustomer = (phone?: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  // Separate inspections by status
  const activeInspections = inspections.filter((i) => i.status === "in_progress");
  const scheduledInspections = inspections.filter((i) => i.status === "scheduled");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Inspections</h1>
        <p className="text-gray-500">View and manage your assigned inspections</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-orange-600 text-white rounded-xl p-4 text-center">
          <p className="text-3xl font-bold">{activeInspections.length}</p>
          <p className="text-sm text-orange-100">In Progress</p>
        </div>
        <div className="bg-blue-600 text-white rounded-xl p-4 text-center">
          <p className="text-3xl font-bold">{scheduledInspections.length}</p>
          <p className="text-sm text-blue-100">Scheduled</p>
        </div>
      </div>

      {/* Active Inspections */}
      {activeInspections.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            In Progress
          </h2>
          <div className="space-y-3">
            {activeInspections.map((inspection) => (
              <InspectionCard
                key={inspection.id}
                inspection={inspection}
                onViewDetails={() => router.push(`/tech/inspection/${inspection.id}`)}
                onNavigate={() =>
                  openMaps(inspection.site_address, inspection.site_city, inspection.site_state)
                }
                onCall={() => callCustomer(inspection.contact_phone)}
                isActive
              />
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Inspections */}
      {scheduledInspections.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming</h2>
          <div className="space-y-3">
            {scheduledInspections.map((inspection) => (
              <InspectionCard
                key={inspection.id}
                inspection={inspection}
                onViewDetails={() => router.push(`/tech/inspection/${inspection.id}`)}
                onNavigate={() =>
                  openMaps(inspection.site_address, inspection.site_city, inspection.site_state)
                }
                onCall={() => callCustomer(inspection.contact_phone)}
                onStart={() => handleStartInspection(inspection.id)}
              />
            ))}
          </div>
        </div>
      )}

      {inspections.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">No Inspections Assigned</h3>
          <p className="text-gray-500 mt-1">
            You don't have any inspections assigned at the moment.
          </p>
        </div>
      )}
    </div>
  );
}

interface InspectionCardProps {
  inspection: Inspection;
  onViewDetails: () => void;
  onNavigate: () => void;
  onCall: () => void;
  onStart?: () => void;
  isActive?: boolean;
}

function InspectionCard({
  inspection,
  onViewDetails,
  onNavigate,
  onCall,
  onStart,
  isActive,
}: InspectionCardProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
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

  return (
    <div
      className={`bg-white rounded-xl border-2 overflow-hidden ${
        isActive ? "border-orange-500 shadow-lg" : "border-gray-200"
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-500">
                {inspection.inspection_number}
              </span>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  statusColors[inspection.status]
                }`}
              >
                {inspection.status.replace("_", " ")}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">{inspection.customer_name}</h3>
            <p className="text-sm text-orange-600 font-medium flex items-center gap-1">
              <ClipboardList className="w-4 h-4" />
              {inspectionTypeLabels[inspection.inspection_type] || inspection.inspection_type}
            </p>
          </div>
          <button
            onClick={onViewDetails}
            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            {inspection.site_address}
            {inspection.site_city && `, ${inspection.site_city}`}
          </span>
        </div>

        {/* Schedule */}
        {inspection.scheduled_date && (
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(inspection.scheduled_date)}
            </div>
            {inspection.scheduled_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(inspection.scheduled_time)}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onNavigate}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Navigation className="w-4 h-4" />
            Navigate
          </button>

          {inspection.contact_phone && (
            <button
              onClick={onCall}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
            >
              <Phone className="w-4 h-4" />
              Call
            </button>
          )}

          {onStart && (
            <button
              onClick={onStart}
              className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700"
            >
              <Play className="w-4 h-4" />
              Start Inspection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
