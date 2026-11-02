import { supabaseAdmin } from "@/lib/supabase";
import { geocode, distanceMeters, formatDistance } from "@/lib/geocode";
import { houstonToday, runsOn } from "@/lib/job-dates";

// The on-site rule for the time clock: a check-in has to come from the job
// site. The phone's GPS position is compared with the site address of the
// job being checked into, or, from the general time clock, with every job
// and inspection the person is scheduled on today.

/** How close counts as "on site": about a quarter mile, for big campuses and job trailers. */
export const SITE_RADIUS_M = 400;
/** GPS error we give the benefit of the doubt for, on top of the radius. */
const MAX_SLACK_M = 100;
/** Coarser than this is a Wi-Fi/cell guess, not GPS: ask for precise location. */
export const MAX_ACCURACY_M = 1000;

export interface Position {
  lat: number;
  lng: number;
  accuracy: number | null;
}

/** The position from a request body, or null when the phone didn't send one. */
export function readPosition(body: { lat?: unknown; lng?: unknown; accuracy?: unknown }): Position | null {
  const { lat, lng, accuracy } = body;
  if (typeof lat !== "number" || typeof lng !== "number" || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, accuracy: typeof accuracy === "number" && Number.isFinite(accuracy) ? accuracy : null };
}

export const LOCATION_REQUIRED =
  "Location is required to check in or out. Turn on Location for this site in your phone's settings, then try again.";

interface Site {
  kind: "job" | "inspection";
  id: string;
  label: string;
  address: string;
}

const addressOf = (r: { site_address?: string | null; site_city?: string | null; site_state?: string | null; site_zip?: string | null }) =>
  [r.site_address, r.site_city, [r.site_state || "TX", r.site_zip].filter(Boolean).join(" ")].filter(Boolean).join(", ");

async function jobSite(jobId: string): Promise<Site | null> {
  const { data } = await supabaseAdmin
    .from("jobs")
    .select("id, job_number, customer_name, site_address, site_city, site_state, site_zip")
    .eq("id", jobId)
    .maybeSingle();
  if (!data?.site_address) return null;
  return { kind: "job", id: data.id, label: data.customer_name || data.job_number || "the job", address: addressOf(data) };
}

/** Jobs (via crew assignment) and inspections the person is scheduled on today. */
async function todaysSites(userId: string): Promise<Site[]> {
  const today = houstonToday();
  const sites: Site[] = [];

  const { data: assigned } = await supabaseAdmin.from("job_assignments").select("job_id").eq("user_id", userId);
  const jobIds = (assigned || []).map((a) => a.job_id);
  if (jobIds.length) {
    const { data: jobs } = await supabaseAdmin
      .from("jobs")
      .select("id, job_number, customer_name, status, scheduled_date, scheduled_end_date, site_address, site_city, site_state, site_zip")
      .in("id", jobIds);
    for (const j of jobs || []) {
      if (!j.site_address || ["cancelled", "completed"].includes(j.status) || !runsOn(j, today)) continue;
      sites.push({ kind: "job", id: j.id, label: j.customer_name || j.job_number || "a job", address: addressOf(j) });
    }
  }

  const { data: inspections } = await supabaseAdmin
    .from("inspections")
    .select("id, customer_name, status, scheduled_date, site_address, site_city, site_state, site_zip")
    .eq("inspector_id", userId)
    .eq("scheduled_date", today);
  for (const i of inspections || []) {
    if (!i.site_address || i.status === "cancelled") continue;
    sites.push({ kind: "inspection", id: i.id, label: i.customer_name || "an inspection", address: addressOf(i) });
  }

  return sites;
}

export type SiteCheck =
  /** On site (or nothing to check against; `note` says why, for the office). */
  | { ok: true; jobId: string | null; note: string | null }
  | { ok: false; error: string };

/**
 * Is this position at the site? With a jobId, that job's site; otherwise the
 * person's sites for today. `strict` refuses when away from every site (check
 * in); otherwise it passes with a note the office sees (check out, so a
 * forgotten check-out can still be closed).
 */
export async function checkOnSite(opts: {
  userId: string;
  position: Position;
  jobId?: string | null;
  strict: boolean;
}): Promise<SiteCheck> {
  const { position, strict } = opts;

  if (position.accuracy != null && position.accuracy > MAX_ACCURACY_M) {
    if (strict) {
      return {
        ok: false,
        error: `Your phone's location is too rough (within ${formatDistance(position.accuracy)}). Turn on Precise Location for this site, step outside or near a window, and try again.`,
      };
    }
  }

  let sites: Site[];
  if (opts.jobId) {
    const site = await jobSite(opts.jobId);
    if (!site) return { ok: true, jobId: opts.jobId, note: "[Location not verified: the job has no site address]" };
    sites = [site];
  } else {
    sites = await todaysSites(opts.userId);
    if (sites.length === 0) return { ok: true, jobId: null, note: "[No job or inspection scheduled today: location not verified]" };
  }

  const here = { lat: position.lat, lon: position.lng };
  const slack = Math.min(position.accuracy ?? 0, MAX_SLACK_M);
  let nearest: { site: Site; meters: number } | null = null;
  let located = 0;
  for (const site of sites) {
    const point = await geocode(site.address).catch(() => null);
    if (!point) continue;
    located++;
    const meters = distanceMeters(here, point);
    if (!nearest || meters < nearest.meters) nearest = { site, meters };
  }

  if (located === 0 || !nearest) {
    return { ok: true, jobId: opts.jobId || null, note: "[Location not verified: the site address couldn't be found on the map]" };
  }

  const jobIdFor = (s: Site) => opts.jobId || (s.kind === "job" ? s.id : null);
  if (nearest.meters <= SITE_RADIUS_M + slack) {
    return {
      ok: true,
      jobId: jobIdFor(nearest.site),
      note: !opts.jobId && nearest.site.kind === "inspection" ? `[On site: inspection at ${nearest.site.label}]` : null,
    };
  }

  const away = `${formatDistance(nearest.meters)} from ${nearest.site.label} (${nearest.site.address})`;
  if (strict) {
    return { ok: false, error: `You're ${away}. You have to be on site to check in.` };
  }
  return { ok: true, jobId: jobIdFor(nearest.site), note: `[Off site: ${away}]` };
}
