"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ClipboardList,
  ChevronDown,
  Loader2,
} from "lucide-react";

interface Inspection {
  id: string;
  inspection_number: string;
  customer_name: string;
  site_address: string;
  site_city?: string;
  inspection_type: string;
  status: string;
  scheduled_date?: string;
  scheduled_time?: string;
  passed?: boolean;
  pass_with_deficiencies?: boolean;
  inspector?: {
    id: string;
    full_name: string;
  };
  created_at: string;
}

const inspectionTypeLabels: Record<string, string> = {
  fire_alarm: "Fire Alarm",
  sprinkler_monitoring: "Sprinkler Monitoring",
  reinspection: "Reinspection",
  fire_marshal_pre: "Fire Marshal Pre-Inspection",
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700", icon: Calendar },
  in_progress: { label: "In Progress", color: "bg-orange-100 text-orange-700", icon: Clock },
  completed: { label: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-500", icon: XCircle },
};

export default function InspectionsPage() {
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchInspections();
  }, [statusFilter, typeFilter]);

  const fetchInspections = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("type", typeFilter);

      const response = await fetch(`/api/inspections?${params}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setInspections(data.data || []);
    } catch (error) {
      console.error("Error fetching inspections:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInspections = inspections.filter((insp) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      insp.inspection_number?.toLowerCase().includes(query) ||
      insp.customer_name?.toLowerCase().includes(query) ||
      insp.site_address?.toLowerCase().includes(query) ||
      insp.inspector?.full_name?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not scheduled";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
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

  // Stats
  const stats = {
    scheduled: inspections.filter((i) => i.status === "scheduled").length,
    inProgress: inspections.filter((i) => i.status === "in_progress").length,
    completed: inspections.filter((i) => i.status === "completed").length,
    withDeficiencies: inspections.filter((i) => i.pass_with_deficiencies).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspections</h1>
          <p className="text-gray-500">Manage fire alarm and sprinkler inspections</p>
        </div>
        <button
          onClick={() => router.push("/admin/inspections/new")}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Inspection
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.scheduled}</p>
              <p className="text-sm text-blue-600">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">{stats.inProgress}</p>
              <p className="text-sm text-orange-600">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
              <p className="text-sm text-green-600">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-700">{stats.withDeficiencies}</p>
              <p className="text-sm text-yellow-600">With Deficiencies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search inspections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters || statusFilter || typeFilter
                ? "border-orange-500 text-orange-600 bg-orange-50"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">All Types</option>
                <option value="fire_alarm">Fire Alarm</option>
                <option value="sprinkler_monitoring">Sprinkler Monitoring</option>
                <option value="reinspection">Reinspection</option>
                <option value="fire_marshal_pre">Fire Marshal Pre-Inspection</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Inspections List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No inspections found</h3>
            <p className="text-gray-500 mt-1">
              {searchQuery || statusFilter || typeFilter
                ? "Try adjusting your filters"
                : "Create your first inspection to get started"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredInspections.map((inspection) => {
              const statusInfo = statusConfig[inspection.status] || statusConfig.scheduled;
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={inspection.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/admin/inspections/${inspection.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-gray-500">
                          {inspection.inspection_number}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                        {inspection.passed === false && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                            <XCircle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                        {inspection.pass_with_deficiencies && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                            <AlertTriangle className="w-3 h-3" />
                            Deficiencies
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-1">
                        {inspection.customer_name}
                      </h3>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <ClipboardList className="w-4 h-4" />
                          {inspectionTypeLabels[inspection.inspection_type] || inspection.inspection_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {inspection.site_address}
                          {inspection.site_city && `, ${inspection.site_city}`}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(inspection.scheduled_date)}
                          {inspection.scheduled_time && ` at ${formatTime(inspection.scheduled_time)}`}
                        </span>
                        {inspection.inspector && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {inspection.inspector.full_name}
                          </span>
                        )}
                      </div>
                    </div>

                    <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
