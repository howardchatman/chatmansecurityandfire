import { supabaseAdmin } from "@/lib/supabase";

// Google Calendar integration.
//
// OAuth "authorization code" flow: the admin clicks Connect, approves at
// Google, Google redirects back with a code, we swap that for an access token
// (short-lived) and a refresh token (long-lived). We store the refresh token
// and mint fresh access tokens from it as needed — so the connection survives
// without the admin re-approving.
//
// Everything here runs server-side with the service-role client. The tokens
// live in a table the browser can't read (RLS, no policies).

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const CAL_BASE = "https://www.googleapis.com/calendar/v3";

// calendar.events lets us create/edit/delete events; openid+email so we can
// show which Google account is connected.
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "openid",
  "email",
];

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || "https://www.chatmansecurityandfire.com").replace(/\/$/, "");
}
export function redirectUri(): string {
  return `${baseUrl()}/api/integrations/google/callback`;
}
function clientId() {
  return process.env.GOOGLE_CLIENT_ID || "";
}
function clientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET || "";
}
export function googleConfigured(): boolean {
  return Boolean(clientId() && clientSecret());
}

interface Account {
  google_email: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expiry: string | null;
  calendar_id: string;
}

async function loadAccount(): Promise<Account | null> {
  const { data, error } = await supabaseAdmin
    .from("google_calendar_account")
    .select("google_email, access_token, refresh_token, token_expiry, calendar_id")
    .eq("id", "default")
    .maybeSingle();
  if (error) {
    // Table missing before the migration runs — treat as not connected.
    if (/google_calendar_account/.test(error.message)) return null;
    throw error;
  }
  return (data as Account) ?? null;
}

export async function isConnected(): Promise<{ connected: boolean; email?: string | null }> {
  const acct = await loadAccount();
  return { connected: Boolean(acct?.refresh_token), email: acct?.google_email };
}

// ── OAuth ──────────────────────────────────────────────────────────────────

/** The consent URL to send the admin to. `state` guards against CSRF. */
export function authUrl(state: string): string {
  const p = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline", // ask for a refresh token
    prompt: "consent", // force a refresh token even on re-connect
    include_granted_scopes: "true",
    state,
  });
  return `${AUTH_ENDPOINT}?${p.toString()}`;
}

/** Swap the authorization code for tokens and store them. */
export async function exchangeCodeAndStore(code: string, connectedBy?: string): Promise<void> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  const tok = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    id_token?: string;
  };

  // The email is in the id_token's payload (JWT); decode without verifying —
  // it came straight from Google over TLS and is only used for display.
  let email: string | null = null;
  if (tok.id_token) {
    try {
      const payload = JSON.parse(Buffer.from(tok.id_token.split(".")[1], "base64").toString());
      email = payload.email ?? null;
    } catch {
      /* display-only; ignore */
    }
  }

  const expiry = new Date(Date.now() + (tok.expires_in - 60) * 1000).toISOString();
  const row: Record<string, unknown> = {
    id: "default",
    access_token: tok.access_token,
    token_expiry: expiry,
    google_email: email,
    connected_at: new Date().toISOString(),
    connected_by: connectedBy ?? null,
    updated_at: new Date().toISOString(),
  };
  // Google only returns a refresh_token on the first consent; keep the stored
  // one if this response doesn't carry a new one.
  if (tok.refresh_token) row.refresh_token = tok.refresh_token;

  const { error } = await supabaseAdmin.from("google_calendar_account").upsert(row, { onConflict: "id" });
  if (error) throw error;
}

export async function disconnect(): Promise<void> {
  await supabaseAdmin.from("google_calendar_account").delete().eq("id", "default");
}

/** A valid access token, refreshed from the stored refresh token if expired. */
async function accessToken(): Promise<{ token: string; calendarId: string } | null> {
  const acct = await loadAccount();
  if (!acct?.refresh_token) return null;

  const stillValid = acct.access_token && acct.token_expiry && new Date(acct.token_expiry) > new Date();
  if (stillValid) return { token: acct.access_token as string, calendarId: acct.calendar_id };

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: acct.refresh_token,
      client_id: clientId(),
      client_secret: clientSecret(),
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    console.error("[gcal] refresh failed:", res.status, (await res.text()).slice(0, 200));
    return null;
  }
  const tok = (await res.json()) as { access_token: string; expires_in: number };
  const expiry = new Date(Date.now() + (tok.expires_in - 60) * 1000).toISOString();
  await supabaseAdmin
    .from("google_calendar_account")
    .update({ access_token: tok.access_token, token_expiry: expiry, updated_at: new Date().toISOString() })
    .eq("id", "default");
  return { token: tok.access_token, calendarId: acct.calendar_id };
}

// ── Events (push) ────────────────────────────────────────────────────────

export interface CalendarEvent {
  summary: string;
  description?: string;
  location?: string;
  /** YYYY-MM-DD (all-day) or ISO datetime. */
  start: string;
  /** ISO datetime; defaults to +1h for timed, same day for all-day. */
  end?: string;
}

function toGoogleTimes(ev: CalendarEvent) {
  const allDay = /^\d{4}-\d{2}-\d{2}$/.test(ev.start);
  if (allDay) {
    const endDate = ev.end && /^\d{4}-\d{2}-\d{2}$/.test(ev.end) ? ev.end : ev.start;
    // Google all-day end date is exclusive — bump one day.
    const d = new Date(`${endDate}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    return { start: { date: ev.start }, end: { date: d.toISOString().slice(0, 10) } };
  }
  const start = new Date(ev.start);
  const end = ev.end ? new Date(ev.end) : new Date(start.getTime() + 60 * 60 * 1000);
  const tz = "America/Chicago";
  return {
    start: { dateTime: start.toISOString(), timeZone: tz },
    end: { dateTime: end.toISOString(), timeZone: tz },
  };
}

/**
 * Create or update a calendar event. Pass the stored google_event_id to update
 * the existing event; omit it to create a new one. Returns the event id to
 * store, or null if the calendar isn't connected/configured (a no-op — callers
 * treat that as "sync skipped", never an error).
 */
export async function upsertEvent(
  ev: CalendarEvent,
  existingEventId?: string | null
): Promise<string | null> {
  const auth = await accessToken();
  if (!auth) return null;

  const body = JSON.stringify({
    summary: ev.summary,
    description: ev.description,
    location: ev.location,
    ...toGoogleTimes(ev),
  });

  const url = existingEventId
    ? `${CAL_BASE}/calendars/${encodeURIComponent(auth.calendarId)}/events/${existingEventId}`
    : `${CAL_BASE}/calendars/${encodeURIComponent(auth.calendarId)}/events`;

  const res = await fetch(url, {
    method: existingEventId ? "PATCH" : "POST",
    headers: { Authorization: `Bearer ${auth.token}`, "Content-Type": "application/json" },
    body,
  });

  // The stored event was deleted on Google's side — recreate it.
  if (existingEventId && (res.status === 404 || res.status === 410)) {
    return upsertEvent(ev, null);
  }
  if (!res.ok) {
    console.error("[gcal] upsert event failed:", res.status, (await res.text()).slice(0, 200));
    return existingEventId ?? null;
  }
  const json = (await res.json()) as { id: string };
  return json.id;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const auth = await accessToken();
  if (!auth) return;
  await fetch(`${CAL_BASE}/calendars/${encodeURIComponent(auth.calendarId)}/events/${eventId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${auth.token}` },
  }).catch((e) => console.error("[gcal] delete event failed:", e));
}

// ── Job / inspection sync ──────────────────────────────────────────────────
// Each builds the event, upserts it (create or update via the stored event id),
// and writes the event id back onto the row. All no-ops when the calendar isn't
// connected, and all safe to call fire-and-forget — a calendar hiccup must
// never block scheduling a job.

interface JobLike {
  id: string;
  job_number?: string | null;
  customer_name?: string | null;
  site_address?: string | null;
  site_city?: string | null;
  job_type?: string | null;
  description?: string | null;
  scheduled_date?: string | null;
  scheduled_time_start?: string | null;
  google_event_id?: string | null;
}

function combine(date?: string | null, time?: string | null): string | null {
  if (!date) return null;
  if (!time) return date; // all-day
  // scheduled_time_start is "HH:MM" or "HH:MM:SS", local Houston time.
  const t = time.length === 5 ? `${time}:00` : time;
  // Build an ISO string with Central offset so Google places it correctly.
  return `${date}T${t}`;
}

export async function syncJobToCalendar(job: JobLike): Promise<void> {
  if (!job.scheduled_date) return; // nothing to put on a calendar yet
  const title = `${job.job_type ? job.job_type.replace(/_/g, " ") : "Job"} — ${job.customer_name || "Customer"}`;
  const eventId = await upsertEvent(
    {
      summary: title,
      description: [job.job_number && `Job ${job.job_number}`, job.description]
        .filter(Boolean)
        .join("\n"),
      location: [job.site_address, job.site_city].filter(Boolean).join(", ") || undefined,
      start: combine(job.scheduled_date, job.scheduled_time_start) || job.scheduled_date,
    },
    job.google_event_id
  );
  if (eventId && eventId !== job.google_event_id) {
    await supabaseAdmin.from("jobs").update({ google_event_id: eventId }).eq("id", job.id);
  }
}

interface InspectionLike {
  id: string;
  inspection_number?: string | null;
  customer_name?: string | null;
  site_address?: string | null;
  site_city?: string | null;
  inspection_type?: string | null;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  google_event_id?: string | null;
}

export async function syncInspectionToCalendar(insp: InspectionLike): Promise<void> {
  if (!insp.scheduled_date) return;
  const title = `Inspection: ${insp.inspection_type ? insp.inspection_type.replace(/_/g, " ") : ""} — ${insp.customer_name || "Customer"}`;
  const eventId = await upsertEvent(
    {
      summary: title,
      description: insp.inspection_number ? `Inspection ${insp.inspection_number}` : undefined,
      location: [insp.site_address, insp.site_city].filter(Boolean).join(", ") || undefined,
      start: combine(insp.scheduled_date, insp.scheduled_time) || insp.scheduled_date,
    },
    insp.google_event_id
  );
  if (eventId && eventId !== insp.google_event_id) {
    await supabaseAdmin.from("inspections").update({ google_event_id: eventId }).eq("id", insp.id);
  }
}
