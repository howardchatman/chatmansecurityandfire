"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Upload,
  Loader2,
  Trash2,
  AlertTriangle,
  FileSpreadsheet,
  Image as ImageIcon,
  File as FileIcon,
} from "lucide-react";

// Forms and documents attached to a job or an inspection. One component for
// the tech pages and the admin pages, so both sides see the same list.
//
// Downloads open one-hour signed URLs minted by the API — the tech-documents
// bucket is private, so a copied link goes stale instead of living forever.

interface Doc {
  id: string;
  file_name: string;
  label?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  uploaded_by_name?: string | null;
  created_at: string;
  url: string | null;
}

function iconFor(mime?: string | null) {
  if (!mime) return FileIcon;
  if (mime.startsWith("image/")) return ImageIcon;
  if (mime.includes("spreadsheet") || mime.includes("excel") || mime === "text/csv")
    return FileSpreadsheet;
  return FileText;
}

function fmtSize(bytes?: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DocumentsCard({
  jobId,
  inspectionId,
  title = "Forms & Documents",
}: {
  jobId?: string;
  inspectionId?: string;
  title?: string;
}) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parentQuery = jobId ? `job_id=${jobId}` : `inspection_id=${inspectionId}`;

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents?${parentQuery}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not load documents");
      setDocs(json.data ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load documents");
    } finally {
      setLoading(false);
    }
  }, [parentQuery]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", pendingFile);
      if (jobId) fd.append("job_id", jobId);
      if (inspectionId) fd.append("inspection_id", inspectionId);
      if (label.trim()) fd.append("label", label.trim());

      const res = await fetch("/api/documents", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      setPendingFile(null);
      setLabel("");
      if (inputRef.current) inputRef.current.value = "";
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (doc: Doc) => {
    if (!confirm(`Delete "${doc.label || doc.file_name}"?`)) return;
    const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Delete failed");
      return;
    }
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>

      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* upload row */}
      <div className="mb-4 rounded-lg border border-dashed border-gray-300 p-3">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx,.xls,.xlsx,.csv,.txt"
          onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gray-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:text-sm file:font-medium hover:file:bg-gray-200"
        />
        {pendingFile && (
          <div className="mt-2 flex flex-col sm:flex-row gap-2">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='What is it? e.g. "Backflow test form"'
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <button
              onClick={upload}
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg text-sm font-medium"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload
            </button>
          </div>
        )}
      </div>

      {/* list */}
      {loading ? (
        <div className="flex justify-center py-6 text-gray-300">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : docs.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No documents yet</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {docs.map((d) => {
            const Icon = iconFor(d.mime_type);
            return (
              <li key={d.id} className="py-2.5 flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  {d.url ? (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-900 hover:text-orange-700 truncate block"
                    >
                      {d.label || d.file_name}
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-gray-400 truncate block">
                      {d.label || d.file_name}
                    </span>
                  )}
                  <p className="text-xs text-gray-400 truncate">
                    {[
                      d.label ? d.file_name : null,
                      fmtSize(d.size_bytes),
                      d.uploaded_by_name,
                      new Date(d.created_at).toLocaleDateString(),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <button
                  onClick={() => remove(d)}
                  className="p-1.5 text-gray-300 hover:text-red-600 rounded"
                  aria-label={`Delete ${d.file_name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
