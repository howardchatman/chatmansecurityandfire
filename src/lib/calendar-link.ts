// "Add to Google Calendar" links.
//
// Deliberately a link, not an integration: it needs no OAuth, no Google Cloud
// project and no stored tokens, and it works from any device the moment you
// click it. Real two-way sync (events appearing automatically, edits flowing
// both directions) is a separate piece of work — see the note at the bottom.

interface CalendarEvent {
  title: string;
  details?: string;
  location?: string;
  /** Date-only (YYYY-MM-DD) makes an all-day event; include a time for a slot. */
  start: string;
  /** Defaults to one hour after start for timed events, same day for all-day. */
  end?: string;
}

function isDateOnly(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

/** Google wants YYYYMMDD for all-day, YYYYMMDDTHHmmssZ for timed. */
function fmt(value: string, allDay: boolean): string {
  if (allDay) return value.replace(/-/g, "");
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const allDay = isDateOnly(event.start);

  let end = event.end;
  if (!end) {
    if (allDay) {
      // Google treats the end of an all-day event as exclusive, so a one-day
      // event ends the following day — without this it renders as zero-length.
      const d = new Date(event.start + "T00:00:00");
      d.setDate(d.getDate() + 1);
      end = d.toISOString().slice(0, 10);
    } else {
      end = new Date(new Date(event.start).getTime() + 60 * 60 * 1000).toISOString();
    }
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${fmt(event.start, allDay)}/${fmt(end, allDay)}`,
  });
  if (event.details) params.set("details", event.details);
  if (event.location) params.set("location", event.location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Outlook / Microsoft 365 deep link.
 *
 * office.com is the work-account host (Microsoft 365, which is what this
 * business runs on). Personal outlook.com accounts use outlook.live.com — if
 * the link ever opens the wrong mailbox, that's the host to swap.
 */
export function outlookCalendarUrl(event: CalendarEvent): string {
  const allDay = isDateOnly(event.start);

  let end = event.end;
  if (!end) {
    if (allDay) {
      const d = new Date(event.start + "T00:00:00");
      d.setDate(d.getDate() + 1);
      end = d.toISOString().slice(0, 10);
    } else {
      end = new Date(new Date(event.start).getTime() + 60 * 60 * 1000).toISOString();
    }
  }

  // Outlook wants ISO 8601, unlike Google's compacted form.
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    startdt: allDay ? event.start : new Date(event.start).toISOString(),
    enddt: allDay ? end : new Date(end).toISOString(),
  });
  if (allDay) params.set("allday", "true");
  if (event.details) params.set("body", event.details);
  if (event.location) params.set("location", event.location);

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/** Convenience wrapper for a scheduled job. */
function jobEvent(job: {
  job_number: string;
  job_type?: string | null;
  customer_name?: string | null;
  description?: string | null;
  site_address?: string | null;
  site_city?: string | null;
  scheduled_date?: string | null;
  scheduled_time_start?: string | null;
}): CalendarEvent | null {
  if (!job.scheduled_date) return null;
  const start = job.scheduled_time_start
    ? `${job.scheduled_date}T${job.scheduled_time_start}`
    : job.scheduled_date;
  const type = (job.job_type || "Service").replace(/_/g, " ");
  return {
    title: `${type} — ${job.customer_name || "Customer"} (${job.job_number})`,
    details: [job.description, `Job ${job.job_number}`].filter(Boolean).join("\n"),
    location: [job.site_address, job.site_city].filter(Boolean).join(", "),
    start,
  };
}

/** Outlook / Microsoft 365 link for a scheduled job. */
export function jobOutlookUrl(job: Parameters<typeof jobEvent>[0]): string | null {
  const e = jobEvent(job);
  return e ? outlookCalendarUrl(e) : null;
}

export function jobCalendarUrl(job: {
  job_number: string;
  job_type?: string | null;
  customer_name?: string | null;
  description?: string | null;
  site_address?: string | null;
  site_city?: string | null;
  scheduled_date?: string | null;
  scheduled_time_start?: string | null;
}): string | null {
  if (!job.scheduled_date) return null;

  const start =
    job.scheduled_time_start
      ? `${job.scheduled_date}T${job.scheduled_time_start}`
      : job.scheduled_date;

  const type = (job.job_type || "Service").replace(/_/g, " ");
  return googleCalendarUrl({
    title: `${type} — ${job.customer_name || "Customer"} (${job.job_number})`,
    details: [job.description, `Job ${job.job_number}`].filter(Boolean).join("\n"),
    location: [job.site_address, job.site_city].filter(Boolean).join(", "),
    start,
  });
}
