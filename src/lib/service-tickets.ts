// The service_tickets table enforces CHECK constraints on these columns, so a
// value the database doesn't recognise fails the insert outright. Keep the
// admin UI, the customer portal, and the API reading from one list.

export const TICKET_SERVICE_TYPES = [
  "fire_alarm",
  "sprinkler",
  "extinguisher",
  "emergency_lights",
  "fire_lane",
  "security",
  "other",
] as const;

export const TICKET_PRIORITIES = ["emergency", "urgent", "normal", "low"] as const;

export const TICKET_STATUSES = [
  "open",
  "assigned",
  "in_progress",
  "on_hold",
  "resolved",
  "closed",
] as const;

// Customer-facing wording — the raw values read like database columns.
export const SERVICE_TYPE_LABELS: Record<string, string> = {
  fire_alarm: "Fire alarm",
  sprinkler: "Fire sprinkler",
  extinguisher: "Fire extinguisher",
  emergency_lights: "Exit / emergency lighting",
  fire_lane: "Fire lane markings",
  security: "Security, cameras or access control",
  other: "Something else",
};

export const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In Progress",
  on_hold: "On Hold",
  resolved: "Resolved",
  closed: "Closed",
};

export const PRIORITY_LABELS: Record<string, string> = {
  emergency: "Emergency",
  urgent: "Urgent",
  normal: "Normal",
  low: "Low",
};

export function normalizeServiceType(value: unknown): string {
  return TICKET_SERVICE_TYPES.includes(value as never) ? (value as string) : "other";
}

export function normalizePriority(value: unknown): string {
  return TICKET_PRIORITIES.includes(value as never) ? (value as string) : "normal";
}
