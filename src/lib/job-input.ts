// Forms send untouched inputs as "". Postgres accepts "" for text but rejects
// it for date/time/numeric/uuid columns, so a job saved without a date (or a
// team) failed outright with a generic error. Blank optional fields are null.
const NULLABLE_JOB_FIELDS = [
  "customer_email", "customer_phone", "site_city", "site_zip", "description", "notes",
  "scheduled_date", "scheduled_time_start", "scheduled_time_end", "estimated_duration_hours", "team_id",
] as const;

export function blanksToNull<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = { ...obj };
  for (const k of NULLABLE_JOB_FIELDS) {
    if (k in out && (out[k] === "" || (typeof out[k] === "string" && !(out[k] as string).trim()))) out[k] = null;
  }
  return out as T;
}

/** Supabase errors are plain objects; surface their message instead of a generic one. */
export function dbErrorText(err: unknown, fallback: string): string {
  const e = err as { message?: string; details?: string; hint?: string } | null;
  if (e && typeof e.message === "string" && e.message) {
    return `${fallback}: ${e.message}${e.details ? ` (${e.details})` : ""}`;
  }
  return fallback;
}
