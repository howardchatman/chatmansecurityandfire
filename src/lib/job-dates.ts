// Job dates are calendar days ("2026-10-20") in Houston. Parsing one with
// new Date("2026-10-20") reads it as midnight UTC, which is the evening before
// in Central time, so dates displayed a day early. Everything here treats them
// as plain days.

const TZ = "America/Chicago";

/** Today's date in Houston as YYYY-MM-DD. */
export function houstonToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

/** A YYYY-MM-DD day as a Date at local noon (safe from timezone day-shifts). */
function noon(day: string): Date {
  return new Date(`${day.slice(0, 10)}T12:00:00`);
}

/** "Mon, Oct 20, 2026" for one day; "Oct 20 – Dec 19, 2026" for a range. */
export function formatJobDates(start?: string | null, end?: string | null): string {
  if (!start) return "—";
  const s = noon(start);
  if (!end || end.slice(0, 10) <= start.slice(0, 10)) {
    return s.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  }
  const e = noon(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  const left = s.toLocaleDateString("en-US", { month: "short", day: "numeric", ...(sameYear ? {} : { year: "numeric" }) });
  const right = e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${left} – ${right}`;
}

/** True when a job is on the schedule for `day` (YYYY-MM-DD). */
export function runsOn(job: { scheduled_date?: string | null; scheduled_end_date?: string | null }, day: string): boolean {
  if (!job.scheduled_date) return false;
  const start = job.scheduled_date.slice(0, 10);
  const end = (job.scheduled_end_date || job.scheduled_date).slice(0, 10);
  return start <= day && day <= end;
}

/** Calendar days and Monday–Friday workdays in an inclusive date range. */
export function spanOf(start?: string | null, end?: string | null): { days: number; workdays: number } | null {
  if (!start || !end || end < start) return null;
  const s = noon(start);
  const e = noon(end);
  let days = 0;
  let workdays = 0;
  for (const d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    days++;
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) workdays++;
  }
  return { days, workdays };
}
