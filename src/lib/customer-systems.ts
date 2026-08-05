// Shared vocabulary for customer_systems. The table enforces CHECK constraints
// on system_type, inspection_frequency and status, so an unrecognised value
// fails the insert — keep the admin UI, the portal and the API reading from here.

export const SYSTEM_TYPES = [
  "fire_alarm",
  "sprinkler",
  "extinguisher",
  "emergency_lighting",
  "fire_lane",
  "knox_box",
  "security_alarm",
  "video_surveillance",
  "access_control",
  "pa_system",
  "nurse_call",
  "gate_entry",
  "fiber_network",
  "other",
] as const;

export const SYSTEM_TYPE_LABELS: Record<string, string> = {
  fire_alarm: "Fire Alarm System",
  sprinkler: "Fire Sprinkler System",
  extinguisher: "Fire Extinguishers",
  emergency_lighting: "Exit & Emergency Lighting",
  fire_lane: "Fire Lane Markings",
  knox_box: "Knox Box / Fire Dept. Access",
  security_alarm: "Security Alarm",
  video_surveillance: "Video Surveillance",
  access_control: "Access Control",
  pa_system: "PA & Mass Notification",
  nurse_call: "Nurse Call System",
  gate_entry: "Gate Entry System",
  fiber_network: "Fiber / Structured Cabling",
  other: "Other",
};

export const INSPECTION_FREQUENCIES = [
  "monthly",
  "quarterly",
  "semi_annual",
  "annual",
  "biennial",
  "five_year",
  "none",
] as const;

export const FREQUENCY_LABELS: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  semi_annual: "Every 6 months",
  annual: "Annually",
  biennial: "Every 2 years",
  five_year: "Every 5 years",
  none: "No routine inspection",
};

// Months to add to the last inspection to get the next due date.
const FREQUENCY_MONTHS: Record<string, number | null> = {
  monthly: 1,
  quarterly: 3,
  semi_annual: 6,
  annual: 12,
  biennial: 24,
  five_year: 60,
  none: null,
};

export const SYSTEM_STATUSES = ["active", "needs_service", "inactive"] as const;

export const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  needs_service: "Needs Service",
  inactive: "Inactive",
};

export function normalizeSystemType(v: unknown): string {
  return SYSTEM_TYPES.includes(v as never) ? (v as string) : "other";
}
export function normalizeFrequency(v: unknown): string {
  return INSPECTION_FREQUENCIES.includes(v as never) ? (v as string) : "annual";
}
export function normalizeStatus(v: unknown): string {
  return SYSTEM_STATUSES.includes(v as never) ? (v as string) : "active";
}

/**
 * Next inspection date from the last one plus the frequency.
 * Returns null when there's no last inspection or the system isn't on a cycle,
 * so "unknown" stays distinct from "not due".
 */
export function computeNextDue(
  lastInspection: string | null | undefined,
  frequency: string
): string | null {
  const months = FREQUENCY_MONTHS[frequency];
  if (!lastInspection || months == null) return null;

  const d = new Date(lastInspection);
  if (Number.isNaN(d.getTime())) return null;

  const target = new Date(d);
  target.setMonth(target.getMonth() + months);
  // Adding months to e.g. Jan 31 can roll into March; pin back to month end.
  if (target.getDate() !== d.getDate()) target.setDate(0);

  return target.toISOString().slice(0, 10);
}

/** Days until due; negative means overdue. null when there's no due date. */
export function daysUntilDue(nextDue: string | null | undefined): number | null {
  if (!nextDue) return null;
  const t = new Date(nextDue).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / (24 * 60 * 60 * 1000));
}
