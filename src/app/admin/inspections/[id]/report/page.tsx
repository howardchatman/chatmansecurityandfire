"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";
import InspectionReportDocument, {
  ReportInspection,
} from "@/components/inspection/InspectionReportDocument";
import { INSPECTION_TYPE_LABELS } from "@/lib/inspection-report";

// The customer-facing report for any inspection. Print / Save PDF out of the
// browser produces the multi-page document; the screen shows the same pages.

export default function InspectionReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [inspection, setInspection] = useState<ReportInspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalUrl, setPortalUrl] = useState<string>();

  useEffect(() => {
    // The QR code on the cover sends the customer to their portal.
    const base = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    setPortalUrl(`${base.replace(/\/$/, "")}/portal/services`);
  }, []);

  useEffect(() => {
    let live = true;
    fetch(`/api/inspections/${resolvedParams.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => live && setInspection(j.data))
      .catch((err) => console.error("Error fetching inspection:", err))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [resolvedParams.id]);

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

  return (
    <div className="pb-12">
      <div className="no-print mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link
            href={`/admin/inspections/${resolvedParams.id}`}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inspection
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            {INSPECTION_TYPE_LABELS[inspection.inspection_type] || "Inspection"} Report
            {inspection.inspection_number ? ` · ${inspection.inspection_number}` : ""}
          </h1>
          {inspection.status !== "completed" && (
            <p className="text-sm text-amber-700 mt-1">
              This inspection is not completed yet. The report prints with whatever has been recorded so far.
            </p>
          )}
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <Printer className="w-5 h-5" />
          Print / Save PDF
        </button>
      </div>

      <InspectionReportDocument inspection={inspection} portalUrl={portalUrl} />
    </div>
  );
}
