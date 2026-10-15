-- Multi-day jobs (projects that run for weeks or months).
-- Paste into Supabase > SQL Editor and Run. Safe to run more than once.
--
-- 1. scheduled_end_date: the last day of work. A job runs from scheduled_date
--    through scheduled_end_date; leave it empty for a one-day job.
-- 2. estimated_duration_hours was numeric(4,2), which tops out at 99.99 hours,
--    far short of a two-month install. Widen it.

alter table jobs add column if not exists scheduled_end_date date;

alter table jobs alter column estimated_duration_hours type numeric(8,2);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'jobs_end_on_or_after_start') then
    alter table jobs
      add constraint jobs_end_on_or_after_start
      check (scheduled_end_date is null or scheduled_date is null or scheduled_end_date >= scheduled_date);
  end if;
end $$;

create index if not exists jobs_scheduled_range_idx on jobs (scheduled_date, scheduled_end_date);

notify pgrst, 'reload schema';
