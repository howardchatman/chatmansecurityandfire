"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface Deficiency {
  id: string;
  category: string;
  location?: string;
  description: string;
  severity: string;
  status: string;
  recommended_action?: string;
  code_reference?: string;
}

interface ChecklistResult {
  id: string;
  item: string;
  category: string;
  passed: boolean | null;
  notes?: string;
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
  actual_end_time?: string;
  passed?: boolean;
  pass_with_deficiencies?: boolean;
  notes?: string;
  fire_marshal_notes?: string;
  checklist_results?: ChecklistResult[];
  inspector?: { id: string; full_name: string; email?: string; phone?: string };
  deficiencies?: Deficiency[];
  photos?: InspectionPhoto[];
  created_at: string;
}

const inspectionTypeLabels: Record<string, string> = {
  fire_alarm: "Fire Alarm Inspection",
  sprinkler_monitoring: "Sprinkler Monitoring Inspection",
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

export default function InspectionReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return "N/A";
    return new Date(dateTimeStr).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
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

  // Group checklist by category
  const groupedChecklist: Record<string, ChecklistResult[]> = {};
  inspection.checklist_results?.forEach((item) => {
    if (!groupedChecklist[item.category]) {
      groupedChecklist[item.category] = [];
    }
    groupedChecklist[item.category].push(item);
  });

  return (
    <>
      {/* Print-only styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-content,
          #print-content * {
            visibility: visible;
          }
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: letter;
            margin: 0.5in;
          }
        }
      `}</style>

      {/* Action bar - hidden in print */}
      <div className="no-print mb-6 flex items-center justify-between">
        <Link
          href={`/admin/inspections/${resolvedParams.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inspection
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <Printer className="w-5 h-5" />
          Print / Save PDF
        </button>
      </div>

      {/* Printable Report */}
      <div id="print-content" className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="border-b-2 border-gray-900 pb-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {inspectionTypeLabels[inspection.inspection_type]}
              </h1>
              <p className="text-gray-600">Report #{inspection.inspection_number}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl text-gray-900">Chatman Security & Fire</p>
              <p className="text-gray-600 text-sm">Fire Alarm Specialists</p>
              <p className="text-gray-500 text-sm">State License #XXXXX</p>
            </div>
          </div>
        </div>

        {/* Result Banner */}
        <div
          className={`mb-6 p-4 rounded-lg text-center ${
            inspection.passed
              ? inspection.pass_with_deficiencies
                ? "bg-yellow-100 border-2 border-yellow-400"
                : "bg-green-100 border-2 border-green-400"
              : "bg-red-100 border-2 border-red-400"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            {inspection.passed ? (
              inspection.pass_with_deficiencies ? (
                <>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  <span className="text-2xl font-bold text-yellow-800">
                    PASSED WITH DEFICIENCIES
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <span className="text-2xl font-bold text-green-800">PASSED</span>
                </>
              )
            ) : (
              <>
                <XCircle className="w-8 h-8 text-red-600" />
                <span className="text-2xl font-bold text-red-800">FAILED</span>
              </>
            )}
          </div>
        </div>

        {/* Inspection Details */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-1">
              Site Information
            </h2>
            <div>
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-medium">{inspection.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Site Address</p>
              <p className="font-medium">
                {inspection.site_address}
                <br />
                {inspection.site_city}
                {inspection.site_state && `, ${inspection.site_state}`}
                {inspection.site_zip && ` ${inspection.site_zip}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact</p>
              <p className="font-medium">{inspection.contact_name || "N/A"}</p>
              <p className="text-sm text-gray-600">
                {inspection.contact_phone} | {inspection.contact_email}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-1">
              Inspection Details
            </h2>
            <div>
              <p className="text-sm text-gray-500">Scheduled Date</p>
              <p className="font-medium">{formatDate(inspection.scheduled_date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Inspection Started</p>
              <p className="font-medium">{formatDateTime(inspection.actual_start_time)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Inspection Completed</p>
              <p className="font-medium">{formatDateTime(inspection.actual_end_time)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Inspector</p>
              <p className="font-medium">{inspection.inspector?.full_name || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Checklist Results */}
        {Object.keys(groupedChecklist).length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-1 mb-4">
              Inspection Checklist
            </h2>
            <div className="space-y-4">
              {Object.entries(groupedChecklist).map(([category, items]) => (
                <div key={category}>
                  <h3 className="font-medium text-gray-800 mb-2">{category}</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1 w-1/2">Item</th>
                        <th className="text-center py-1 w-24">Result</th>
                        <th className="text-left py-1">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-200">
                          <td className="py-1">{item.item}</td>
                          <td className="py-1 text-center">
                            {item.passed === true ? (
                              <span className="text-green-600 font-medium">PASS</span>
                            ) : item.passed === false ? (
                              <span className="text-red-600 font-medium">FAIL</span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="py-1 text-gray-600">{item.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deficiencies */}
        {inspection.deficiencies && inspection.deficiencies.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-1 mb-4">
              Deficiencies Found ({inspection.deficiencies.length})
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-400">
                  <th className="text-left py-2">#</th>
                  <th className="text-left py-2">Category</th>
                  <th className="text-left py-2">Severity</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-left py-2">Location</th>
                </tr>
              </thead>
              <tbody>
                {inspection.deficiencies.map((def, index) => (
                  <tr key={def.id} className="border-b border-gray-200">
                    <td className="py-2">{index + 1}</td>
                    <td className="py-2">{categoryLabels[def.category] || def.category}</td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          def.severity === "critical"
                            ? "bg-red-100 text-red-700"
                            : def.severity === "major"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {def.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2">{def.description}</td>
                    <td className="py-2">{def.location || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Recommended Actions */}
            <div className="mt-4">
              <h3 className="font-medium text-gray-800 mb-2">Recommended Corrective Actions:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {inspection.deficiencies
                  .filter((d) => d.recommended_action)
                  .map((def, index) => (
                    <li key={def.id}>
                      <strong>{categoryLabels[def.category]}:</strong> {def.recommended_action}
                    </li>
                  ))}
              </ol>
            </div>
          </div>
        )}

        {/* Notes */}
        {(inspection.notes || inspection.fire_marshal_notes) && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-1 mb-4">Notes</h2>
            {inspection.notes && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-800 mb-1">General Notes:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{inspection.notes}</p>
              </div>
            )}
            {inspection.fire_marshal_notes && (
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Fire Marshal Notes:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{inspection.fire_marshal_notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Signature Block */}
        <div className="mt-12 pt-6 border-t-2 border-gray-900">
          <div className="grid grid-cols-2 gap-12">
            <div>
              <p className="text-sm text-gray-500 mb-8">Inspector Signature:</p>
              <div className="border-b border-gray-400 mb-2" />
              <p className="font-medium">{inspection.inspector?.full_name}</p>
              <p className="text-sm text-gray-500">Date: {formatDate(inspection.actual_end_time)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-8">Customer Representative:</p>
              <div className="border-b border-gray-400 mb-2" />
              <p className="font-medium">{inspection.contact_name || "___________________"}</p>
              <p className="text-sm text-gray-500">Date: _______________</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
          <p>
            This inspection was performed in accordance with NFPA 72 and local fire codes.
          </p>
          <p className="mt-1">
            Chatman Security & Fire | www.chatmansecurityandfire.com | (XXX) XXX-XXXX
          </p>
        </div>
      </div>
    </>
  );
}
