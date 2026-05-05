"use client";

import { useState, useRef } from "react";
import {
  Upload, FileText, Users, Briefcase, CheckCircle,
  AlertCircle, Download, X, ChevronDown, ChevronUp,
} from "lucide-react";

type ImportType = "customers" | "leads" | "jobs";

interface PreviewRow {
  [key: string]: string;
}

interface ImportResult {
  created: number;
  failed: number;
  errors: string[];
}

const templates: Record<ImportType, { headers: string[]; example: string[] }> = {
  customers: {
    headers: ["name", "email", "phone", "company", "address", "city", "state", "zip", "notes"],
    example: ["Acme Corp", "contact@acme.com", "832-555-0100", "Acme Corp", "100 Main St", "Houston", "TX", "77001", ""],
  },
  leads: {
    headers: ["name", "email", "phone", "message", "source"],
    example: ["John Smith", "john@example.com", "832-555-0200", "Need fire alarm inspection", "referral"],
  },
  jobs: {
    headers: ["customer_name", "customer_email", "customer_phone", "address", "city", "state", "zip", "job_type", "notes"],
    example: ["Smith Building", "smith@email.com", "832-555-0300", "500 Commerce St", "Houston", "TX", "77002", "inspection", "Annual inspection due"],
  },
};

const typeConfig: Record<ImportType, { label: string; icon: React.ElementType; color: string }> = {
  customers: { label: "Customers", icon: Users, color: "blue" },
  leads:     { label: "Leads / Contacts", icon: Users, color: "orange" },
  jobs:      { label: "Projects / Jobs", icon: Briefcase, color: "green" },
};

function parseCSV(text: string): PreviewRow[] {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: PreviewRow = {};
    headers.forEach((h, i) => { row[h] = vals[i] || ""; });
    return row;
  });
}

export default function ImportPage() {
  const [importType, setImportType] = useState<ImportType>("customers");
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      setPreview(rows);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!preview.length) return;
    setImporting(true);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: importType, records: preview }),
      });
      const json = await res.json();
      setResult(json);
      if (json.success && json.created > 0) {
        setPreview([]);
        setFileName("");
      }
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const t = templates[importType];
    const csv = [t.headers.join(","), t.example.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${importType}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cfg = typeConfig[importType];
  const headers = preview.length ? Object.keys(preview[0]) : [];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Import</h1>
        <p className="text-gray-500 mt-1">Upload your spreadsheets to import customers, leads, and jobs</p>
      </div>

      {/* Type Selector */}
      <div className="grid grid-cols-3 gap-4">
        {(Object.entries(typeConfig) as [ImportType, typeof typeConfig[ImportType]][]).map(([key, val]) => (
          <button
            key={key}
            onClick={() => { setImportType(key); setPreview([]); setFileName(""); setResult(null); }}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              importType === key
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <val.icon className={`w-6 h-6 mb-2 ${importType === key ? "text-orange-600" : "text-gray-400"}`} />
            <p className={`font-semibold text-sm ${importType === key ? "text-orange-700" : "text-gray-700"}`}>
              {val.label}
            </p>
          </button>
        ))}
      </div>

      {/* Template Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">Need a template?</p>
            <p className="text-xs text-blue-600">
              Download the CSV template for {cfg.label.toLowerCase()}, fill it in, then upload below.
            </p>
          </div>
        </div>
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Template
        </button>
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-xl p-10 text-center transition-colors cursor-pointer bg-white"
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-700 font-medium">Drop your CSV here or click to browse</p>
        <p className="text-sm text-gray-400 mt-1">Only .csv files supported</p>
        {fileName && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            <FileText className="w-4 h-4" />
            {fileName}
            <button
              onClick={(e) => { e.stopPropagation(); setPreview([]); setFileName(""); }}
              className="hover:text-orange-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Result Banner */}
      {result && (
        <div className={`rounded-xl p-4 flex items-start gap-3 ${result.failed === 0 ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
          {result.failed === 0 ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-medium text-gray-900">
              {result.created} records imported{result.failed > 0 ? `, ${result.failed} failed` : " successfully"}
            </p>
            {result.errors.slice(0, 5).map((err, i) => (
              <p key={i} className="text-xs text-red-600 mt-1">{err}</p>
            ))}
          </div>
        </div>
      )}

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
            onClick={() => setShowPreview(!showPreview)}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-gray-900 text-sm">
                Preview — {preview.length} rows
              </span>
            </div>
            {showPreview ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>

          {showPreview && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {headers.map((h) => (
                      <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {headers.map((h) => (
                        <td key={h} className="px-4 py-2 text-gray-700 max-w-[180px] truncate">
                          {row[h] || <span className="text-gray-300">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 10 && (
                <p className="text-xs text-gray-400 text-center py-2">
                  Showing 10 of {preview.length} rows
                </p>
              )}
            </div>
          )}

          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Ready to import <strong>{preview.length}</strong> {cfg.label.toLowerCase()}
            </p>
            <button
              onClick={handleImport}
              disabled={importing}
              className="inline-flex items-center gap-2 px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import {preview.length} {cfg.label}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
