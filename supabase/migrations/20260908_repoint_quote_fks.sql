-- Repoint every foreign key that still references the legacy `security_quotes`
-- table at the live `quotes` table.
--
-- The app writes quotes to `quotes`, but some child-table foreign keys were
-- never migrated off the old `security_quotes` table. Concretely: signing a
-- quote inserts a quote_acceptances row, and quote_acceptances.quote_id's FK
-- still checked security_quotes — so every e-sign failed with
-- "violates foreign key constraint ... Key (quote_id) is not present in table
-- security_quotes", surfaced to the customer as "Failed to record acceptance".
-- That is the last thing blocking a customer from signing on the site.
--
-- Rather than fix only that one FK, this finds every FK still pointing at
-- security_quotes and repoints it to quotes, so the same drift can't bite the
-- payment/checkout path next.

do $$
declare
  fk record;
begin
  for fk in
    select con.conname,
           con.conrelid::regclass as tbl,
           att.attname            as col
    from pg_constraint con
    join pg_attribute att
      on att.attrelid = con.conrelid
     and att.attnum = con.conkey[1]
    where con.contype = 'f'
      and con.confrelid = 'public.security_quotes'::regclass
      and array_length(con.conkey, 1) = 1
  loop
    execute format('alter table %s drop constraint %I', fk.tbl, fk.conname);
    execute format(
      'alter table %s add constraint %I foreign key (%I) references public.quotes(id) on delete cascade',
      fk.tbl, fk.conname, fk.col
    );
    raise notice 'repointed % on % (%) -> quotes', fk.conname, fk.tbl, fk.col;
  end loop;
end $$;
