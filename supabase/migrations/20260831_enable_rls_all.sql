-- Lock down every public table with Row Level Security.
--
-- WHY THIS EXISTS: Supabase's Security Advisor found — and a curl with the
-- public anon key confirmed — that 29 tables were readable by anyone. The anon
-- key ships in every visitor's browser, so "anyone with the key" means the
-- whole internet. What was exposed included every lead and customer (names,
-- emails, phones, addresses), all call logs, and admin_users — including the
-- bcrypt password_hash of all five logins.
--
-- HOW THE FIX WORKS: this app never talks to the database from the browser.
-- Every read and write goes through a Next.js API route using the SERVICE ROLE
-- client (supabaseAdmin), and the service role has the BYPASSRLS attribute — it
-- ignores RLS entirely. Enabling RLS with NO policies therefore:
--   • blocks the anon and authenticated roles completely (the browser), and
--   • leaves the server (service role) with full access, unchanged.
-- Net effect on the app: none. Net effect on the leak: closed.
--
-- Before this runs, the API routes that were still using the anon client for
-- writes (job_events, payments, customer_link_access_log, job deletes, …) were
-- switched to supabaseAdmin — otherwise those writes would start silently
-- failing the moment RLS turned on.

do $$
declare
  t record;
begin
  for t in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security;', t.tablename);
  end loop;
end $$;

-- No CREATE POLICY statements on purpose. With RLS enabled and zero policies,
-- the anon and authenticated roles are denied everything; the service role
-- (server-side) is unaffected because it bypasses RLS. If a table ever needs
-- to be readable directly from the browser, add a scoped policy for exactly
-- that table and exactly those rows — never turn RLS back off.
