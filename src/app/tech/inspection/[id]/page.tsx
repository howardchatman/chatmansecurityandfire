"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  Plus,
  Loader2,
  ClipboardList,
  Navigation,
  Building,
  Save,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Deficiency {
  id: string;
  category: string;
  location?: string;
  description: string;
  severity: string;
  status: string;
}

interface ChecklistResult {
  id: string;
  item: string;
  category: string;
  description?: string;
  required: boolean;
  passed: boolean | null;
  notes?: string;
}

interface InspectionChecklist {
  id: string;
  inspection_type: string;
  name: string;
  items: Array<{
    id: string;
    category: string;
    item: string;
    description?: string;
    required: boolean;
  }>;
}

interface Inspection {
  id: string;
  inspection_number: string;
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
  actual_start_time?: string;
  passed?: boolean;
  pass_with_deficiencies?: boolean;
  notes?: string;
  checklist_results?: ChecklistResult[];
  deficiencies?: Deficiency[];
}

const inspectionTypeLabels: Record<string, string> = {
  fire_alarm: "Fire Alarm Inspection",
  sprinkler_monitoring: "Sprinkler Monitoring",
  reinspection: "Reinspection",
  fire_marshal_pre: "Fire Marshal Pre-Inspection",
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

const severityOptions = [
  { value: "minor", label: "Minor", color: "bg-yellow-100 text-yellow-700" },
  { value: "major", label: "Major", color: "bg-orange-100 text-orange-700" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700" },
];

export default function TechInspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [checklist, setChecklist] = useState<InspectionChecklist | null>(null);
  const [checklistResults, setChecklistResults] = useState<ChecklistResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAddDeficiency, setShowAddDeficiency] = useState(false);
  const [newDeficiency, setNewDeficiency] = useState({
    category: "other",
    location: "",
    description: "",
    severity: "minor",
    recommended_action: "",
  });

  useEffect(() => {
    fetchInspection();
  }, [resolvedParams.id]);

  const fetchInspection = async () => {
    try {
      const [inspResponse, checklistResponse] = await Promise.all([
        fetch(`/api/inspections/${resolvedParams.id}`),
        fetch(`/api/inspection-checklists`),
      ]);

      if (!inspResponse.ok) throw new Error("Failed to fetch inspection");

      const inspData = await inspResponse.json();
      setInspection(inspData.data);

      // Get checklist template
      if (checklistResponse.ok) {
        const checklistData = await checklistResponse.json();
        const matchingChecklist = checklistData.data?.find(
          (c: InspectionChecklist) => c.inspection_type === inspData.data.inspection_type
        );

        if (matchingChecklist) {
          setChecklist(matchingChecklist);

          // Initialize checklist results from existing or template
          if (inspData.data.checklist_results?.length > 0) {
            setChecklistResults(inspData.data.checklist_results);
          } else {
            const initialResults = matchingChecklist.items.map((item: ChecklistResult) => ({
              id: item.id,
              item: item.item,
              category: item.category,
              description: item.description,
              required: item.required,
              passed: null,
              notes: "",
            }));
            setChecklistResults(initialResults);
          }

          // Expand all categories by default
          const categories = new Set<string>(matchingChecklist.items.map((i: { category: string }) => i.category));
          setExpandedCategories(categories);
        }
      }
    } catch (error) {
      console.error("Error fetching inspection:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const updateChecklistItem = (itemId: string, passed: boolean | null, notes?: string) => {
    setChecklistResults((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, passed, notes: notes ?? item.notes } : item
      )
    );
  };

  const handleAddDeficiency = async () => {
    if (!newDeficiency.description) {
      alert("Please enter a description");
      return;
    }

    try {
      const response = await fetch(`/api/inspections/${resolvedParams.id}/deficiencies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDeficiency),
      });

      if (!response.ok) throw new Error("Failed to add deficiency");

      setShowAddDeficiency(false);
      setNewDeficiency({
        category: "other",
        location: "",
        description: "",
        severity: "minor",
        recommended_action: "",
      });
      fetchInspection();
    } catch (error) {
      console.error("Error adding deficiency:", error);
      alert("Failed to add deficiency");
    }
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    try {
      await fetch(`/api/inspections/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklist_results: checklistResults,
          notes: inspection?.notes,
        }),
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteInspection = async (passed: boolean) => {
    const hasDeficiencies = inspection?.deficiencies && inspection.deficiencies.length > 0;

    setSaving(true);
    try {
      await fetch(`/api/inspections/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          passed,
          pass_with_deficiencies: passed && hasDeficiencies,
          checklist_results: checklistResults,
          notes: inspection?.notes,
        }),
      });

      router.push("/tech/inspections");
    } catch (error) {
      console.error("Error completing inspection:", error);
      alert("Failed to complete inspection");
    } finally {
      setSaving(false);
    }
  };

  const openMaps = () => {
    if (!inspection) return;
    const fullAddress = `${inspection.site_address}${inspection.site_city ? `, ${inspection.site_city}` : ""}${inspection.site_state ? `, ${inspection.site_state}` : ""}`;
    const encoded = encodeURIComponent(fullAddress);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, "_blank");
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
        <Link href="/tech/inspections" className="text-orange-600 hover:underline mt-2">
          Back to inspections
        </Link>
      </div>
    );
  }

  // Group checklist items by category
  const groupedItems: Record<string, ChecklistResult[]> = {};
  checklistResults.forEach((item) => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });

  // Calculate progress
  const totalItems = checklistResults.length;
  const completedItems = checklistResults.filter((r) => r.passed !== null).length;
  const passedItems = checklistResults.filter((r) => r.passed === true).length;
  const failedItems = checklistResults.filter((r) => r.passed === false).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <Link
          href="/tech/inspections"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono text-gray-500">
                {inspection.inspection_number}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                In Progress
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{inspection.customer_name}</h1>
            <p className="text-sm text-orange-600 font-medium flex items-center gap-1">
              <ClipboardList className="w-4 h-4" />
              {inspectionTypeLabels[inspection.inspection_type]}
            </p>
          </div>
        </div>

        {/* Site Info */}
        <div className="mt-4 flex flex-wrap gap-4">
          <button
            onClick={openMaps}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
          >
            <MapPin className="w-4 h-4" />
            {inspection.site_address}
            {inspection.site_city && `, ${inspection.site_city}`}
            <Navigation className="w-4 h-4 text-blue-600" />
          </button>

          {inspection.contact_phone && (
            <a
              href={`tel:${inspection.contact_phone}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
            >
              <Phone className="w-4 h-4" />
              {inspection.contact_phone}
            </a>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-900">Checklist Progress</span>
          <span className="text-gray-600">{progressPercent}% Complete</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-green-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
          <div className="bg-green-50 rounded p-2">
            <p className="font-semibold text-green-700">{passedItems}</p>
            <p className="text-green-600 text-xs">Passed</p>
          </div>
          <div className="bg-red-50 rounded p-2">
            <p className="font-semibold text-red-700">{failedItems}</p>
            <p className="text-red-600 text-xs">Failed</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="font-semibold text-gray-700">{totalItems - completedItems}</p>
            <p className="text-gray-600 text-xs">Pending</p>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">{category}</span>
                <span className="text-sm text-gray-500">
                  {items.filter((i) => i.passed !== null).length}/{items.length}
                </span>
              </div>
              {expandedCategories.has(category) ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedCategories.has(category) && (
              <div className="border-t border-gray-200 divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.item}</p>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                        {item.required && (
                          <span className="text-xs text-red-500">Required</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateChecklistItem(item.id, true)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.passed === true
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
                          }`}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updateChecklistItem(item.id, false)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.passed === false
                              ? "bg-red-500 text-white"
                              : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600"
                          }`}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {item.passed === false && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder="Add note about failure..."
                          value={item.notes || ""}
                          onChange={(e) => updateChecklistItem(item.id, false, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <button
                          onClick={() => {
                            setNewDeficiency({
                              ...newDeficiency,
                              description: `${item.item}: ${item.notes || "Failed inspection"}`,
                            });
                            setShowAddDeficiency(true);
                          }}
                          className="mt-2 text-sm text-orange-600 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add as Deficiency
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Deficiencies */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Deficiencies ({inspection.deficiencies?.length || 0})
          </h2>
          <button
            onClick={() => setShowAddDeficiency(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {!inspection.deficiencies || inspection.deficiencies.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <p className="text-gray-600">No deficiencies found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {inspection.deficiencies.map((def) => (
              <div key={def.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      def.severity === "critical"
                        ? "bg-red-100 text-red-700"
                        : def.severity === "major"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {def.severity}
                  </span>
                  <span className="text-sm text-gray-500">
                    {categoryLabels[def.category] || def.category}
                  </span>
                </div>
                <p className="text-gray-900">{def.description}</p>
                {def.location && (
                  <p className="text-sm text-gray-500">Location: {def.location}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Deficiency Modal */}
      {showAddDeficiency && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Add Deficiency</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={newDeficiency.category}
                  onChange={(e) =>
                    setNewDeficiency({ ...newDeficiency, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity *
                </label>
                <div className="flex gap-2">
                  {severityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setNewDeficiency({ ...newDeficiency, severity: opt.value })
                      }
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                        newDeficiency.severity === opt.value
                          ? `${opt.color} border-current`
                          : "bg-gray-50 text-gray-600 border-transparent"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newDeficiency.location}
                  onChange={(e) =>
                    setNewDeficiency({ ...newDeficiency, location: e.target.value })
                  }
                  placeholder="e.g., 2nd floor, Room 201"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={newDeficiency.description}
                  onChange={(e) =>
                    setNewDeficiency({ ...newDeficiency, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Describe the deficiency..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recommended Action
                </label>
                <textarea
                  value={newDeficiency.recommended_action}
                  onChange={(e) =>
                    setNewDeficiency({ ...newDeficiency, recommended_action: e.target.value })
                  }
                  rows={2}
                  placeholder="What should be done to fix this..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowAddDeficiency(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDeficiency}
                className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Add Deficiency
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="max-w-7xl mx-auto flex gap-3">
          <button
            onClick={handleSaveProgress}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Progress
          </button>
          <button
            onClick={() => handleCompleteInspection(true)}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5" />
            Pass
          </button>
          <button
            onClick={() => handleCompleteInspection(false)}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" />
            Fail
          </button>
        </div>
      </div>
    </div>
  );
}
