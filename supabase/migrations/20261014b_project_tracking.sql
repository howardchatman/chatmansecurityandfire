-- Project tracking for long jobs: milestones, payment draws, daily crew log,
-- percent complete, and a link from the job to its customer record.
-- Paste into Supabase > SQL Editor and Run. Safe to run more than once.
-- (Run 20261014_multi_day_jobs.sql first if you haven't.)

-- The job's customer record, so a draw can be invoiced to the right account.
alter table jobs add column if not exists customer_id uuid references customers(id) on delete set null;
alter table jobs add column if not exists percent_complete integer not null default 0;
alter table jobs add column if not exists contract_value numeric(12,2);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'jobs_percent_complete_range') then
    alter table jobs add constraint jobs_percent_complete_range check (percent_complete between 0 and 100);
  end if;
end $$;

create table if not exists project_milestones (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  title text not null,
  target_date date,
  done boolean not null default false,
  done_at timestamptz,
  sort integer not null default 0,
  google_event_id text,
  created_at timestamptz not null default now()
);
create index if not exists project_milestones_job_idx on project_milestones (job_id, sort);

create table if not exists project_draws (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  label text not null,
  amount numeric(12,2) not null default 0,
  due_date date,
  status text not null default 'planned' check (status in ('planned', 'invoiced', 'paid')),
  invoice_id uuid references invoices(id) on delete set null,
  google_event_id text,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists project_draws_job_idx on project_draws (job_id, sort);

-- One row per person per day on a job.
create table if not exists project_daily_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  log_date date not null,
  user_id uuid references profiles(id) on delete set null,
  worker_name text not null,
  hours numeric(6,2) not null default 0,
  notes text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists project_daily_logs_one_per_day
  on project_daily_logs (job_id, log_date, user_id);
create index if not exists project_daily_logs_job_idx on project_daily_logs (job_id, log_date desc);

-- Owner updates: emails to the project owner (the job's customer_email),
-- sent by hand or automatically every weekday evening.
alter table jobs add column if not exists owner_updates_daily boolean not null default false;
alter table jobs add column if not exists update_cc text; -- extra recipients, comma-separated

-- Subcontracts: the prime contractor we work under (e.g. Alarmmasters), and
-- the project contact who receives updates (their PM). When a job has a prime
-- contractor, updates never fall back to the end customer's email.
alter table jobs add column if not exists prime_contractor text;
alter table jobs add column if not exists contact_name text;
alter table jobs add column if not exists contact_email text;
alter table jobs add column if not exists contact_phone text;

create table if not exists project_updates (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  sent_at timestamptz not null default now(),
  update_date date not null,
  recipients text not null,
  subject text not null,
  message text,
  body_html text, -- the email as sent, shown in the customer portal
  kind text not null default 'manual' check (kind in ('manual', 'auto')),
  sent_by uuid
);
create index if not exists project_updates_job_idx on project_updates (job_id, sent_at desc);

-- Server-side access only (the site's service role), like every other table.
alter table project_milestones enable row level security;
alter table project_draws enable row level security;
alter table project_daily_logs enable row level security;
alter table project_updates enable row level security;
revoke all on project_milestones, project_draws, project_daily_logs, project_updates from anon, authenticated;

notify pgrst, 'reload schema';
