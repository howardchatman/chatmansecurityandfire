// Shared rules for file uploads. One place for the type and size limits so a
// photo route and a document route can't quietly disagree.

export const EMPLOYEE_ROLES = ["admin", "manager", "technician", "inspector"];

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024;

// Forms come in as whatever the tech has: a scanned PDF, a photo of a paper
// form, an Excel test sheet.
export const DOCUMENT_TYPES = [
  "application/pdf",
  ...PHOTO_TYPES,
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
];
export const DOCUMENT_MAX_BYTES = 20 * 1024 * 1024;

/** `abc/1723890000-x7f2p.pdf` — parent id keeps a folder per job/inspection. */
export function storagePath(parentId: string, originalName: string): string {
  const ext = (originalName.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${parentId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
}

export function fileTooLarge(max: number): string {
  return `File too large. Maximum size is ${Math.round(max / 1024 / 1024)}MB`;
}
