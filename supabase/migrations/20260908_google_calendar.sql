-- Google Calendar two-way plumbing (phase 1: push jobs & inspections onto the
-- connected Google Calendar).
--
-- One business, one connected Google account, so the token store is a single
-- row. The refresh_token is the long-lived credential — it is what lets the
-- server mint a fresh access_token whenever it needs one, so it must never
-- leave the server. RLS is enabled with no policies: only the service role
-- (server) can touch it, never the anon/authenticated browser roles.

create table if not exists google_calendar_account (
  id text primary key default 'default',        -- singleton row
  google_email text,
  access_token text,
  refresh_token text,                            -- long-lived; server-only
  token_expiry timestamptz,
  calendar_id text not null default 'primary',
  connected_at timestamptz,
  connected_by uuid,                             -- admin_users.id who linked it
  updated_at timestamptz not null default now(),
  constraint google_calendar_account_singleton check (id = 'default')
);

alter table google_calendar_account enable row level security;
-- No policies: service role only.

-- Remember which Google event each job/inspection created, so a reschedule
-- updates that event and a cancel deletes it — instead of piling up duplicates.
alter table jobs        add column if not exists google_event_id text;
alter table inspections add column if not exists google_event_id text;
