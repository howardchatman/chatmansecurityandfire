"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";

// The "Add Photo" button that actually adds a photo. Opens the phone camera
// (capture="environment") or a file picker on desktop, uploads to the right
// route for its parent, and tells the page to refresh its photo list.
//
// Both the tech job page and the admin inspection page shipped this button as
// a dead <button> — it drew the icon and did nothing.

export default function PhotoUploadButton({
  jobId,
  inspectionId,
  onUploaded,
  className = "",
}: {
  jobId?: string;
  inspectionId?: string;
  onUploaded: () => void;
  className?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      // Sequential on purpose: a tech on a job site is on cell data, and four
      // parallel 8MB uploads on one bar helps nobody.
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        if (jobId) fd.append("job_id", jobId);
        if (inspectionId) fd.append("inspection_id", inspectionId);
        const route = jobId ? "/api/upload/job-photo" : "/api/upload/inspection-photo";
        const res = await fetch(route, { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Upload failed");
      }
      onUploaded();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={
          className ||
          "flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400"
        }
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
        {uploading ? "Uploading…" : "Add Photo"}
      </button>
      {error && <span className="text-xs text-red-600 max-w-[240px] text-right">{error}</span>}
    </div>
  );
}
