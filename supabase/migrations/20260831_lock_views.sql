-- Lock down every VIEW in the public schema.
--
-- The companion migration 20260831_enable_rls_all.sql enabled RLS on every
-- base table, but it looped over pg_tables — which does not include views.
-- Re-testing with the anon key showed two views (customers, security_leads)
-- still returned live rows: a view runs with its owner's privileges and
-- bypasses RLS on its underlying tables unless told otherwise, so RLS on the
-- base tables did nothing for anything reached through a view.
--
-- Two independent locks per view, either of which is sufficient:
--   • REVOKE removes the anon/authenticated roles' access to the view itself,
--     so PostgREST (which authenticates as those roles) can't read it at all.
--   • security_invoker = on makes the view evaluate underlying-table RLS as the
--     *caller* rather than the view owner, so even a future re-grant stays safe.
--
-- Server-side code uses the service role, which bypasses both — so the app is
-- unaffected.

do $$
declare
  v record;
begin
  for v in
    select table_name
    from information_schema.views
    where table_schema = 'public'
  loop
    execute format('revoke all on public.%I from anon, authenticated;', v.table_name);
    execute format('alter view public.%I set (security_invoker = on);', v.table_name);
  end loop;
end $$;
