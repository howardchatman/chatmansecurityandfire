-- The definitive lockdown: strip anon/authenticated access from every relation.
--
-- Re-testing after 20260831_enable_rls_all.sql showed `customers` and
-- `security_leads` still returned live rows to the anon key. `customers` is a
-- base table (relkind 'r') with RLS enabled — so the only way it still reads is
-- a leftover permissive policy (USING (true)) granting the public/anon role.
--
-- Rather than hunt individual policies, this removes the capability at the
-- root: the app never queries the database as anon or authenticated — every
-- read and write is server-side via the service role, which is unaffected by
-- GRANTs and RLS both. So the anon and authenticated roles need no table
-- access at all. PostgREST authenticates as those roles, so revoking their
-- grants means the public REST surface can read nothing, regardless of RLS
-- policies or whether a relation is a table or a view.
--
-- This supersedes the earlier per-view migration (which assumed the leak was
-- view-only; it was not).

do $$
declare r record;
begin
  for r in
    select table_name from information_schema.tables where table_schema = 'public'
  loop
    execute format('revoke all on public.%I from anon, authenticated;', r.table_name);
  end loop;
end $$;

-- Drop any policy that named the browser roles or public, so nothing re-opens
-- a path even if a future GRANT is added back.
do $$
declare p record;
begin
  for p in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and ('anon' = any(roles) or 'authenticated' = any(roles) or roles = '{public}')
  loop
    execute format('drop policy if exists %I on public.%I;', p.policyname, p.tablename);
  end loop;
end $$;
