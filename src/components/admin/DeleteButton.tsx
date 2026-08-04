"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface DeleteButtonProps {
  /** DELETE is sent here, e.g. `/api/customers/123`. */
  endpoint: string;
  /** Shown in the confirmation dialog so it is obvious what is being removed. */
  label: string;
  /** What kind of record this is, e.g. "customer". Used in the dialog copy. */
  entity?: string;
  /** Extra warning shown in the dialog (related records that go with it, etc.). */
  warning?: string;
  onDeleted: () => void;
}

export default function DeleteButton({
  endpoint,
  label,
  entity = "record",
  warning,
  onDeleted,
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        // Surface the server's reason (e.g. "only draft invoices can be deleted")
        // rather than failing silently.
        setError(data.error || `Delete failed (${res.status})`);
        return;
      }
      setOpen(false);
      onDeleted();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation(); // don't trigger the row's onRowClick
          setOpen(true);
        }}
        title={`Delete ${entity}`}
        aria-label={`Delete ${entity}`}
        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            e.stopPropagation();
            if (!deleting) setOpen(false);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Delete {entity}?</h3>
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{label}</span> will be permanently
                  removed. This can&apos;t be undone.
                </p>
                {warning && <p className="mt-2 text-sm text-amber-700">{warning}</p>}
                {error && (
                  <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                )}
              </div>
              <button
                onClick={() => !deleting && setOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : `Delete ${entity}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
