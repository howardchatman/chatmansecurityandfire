-- /api/customer-links returned 500 (PGRST200) on the `quote:quotes(...)` embed.
--
-- Cause: customer_links.quote_id has a foreign key, but it points at the legacy
-- `security_quotes` table, while the application reads and writes `quotes`
-- (see createQuote/getQuotes in src/lib/supabase.ts). PostgREST resolves embeds
-- from foreign keys, so it could not relate customer_links to `quotes` and
-- suggested `security_quotes` instead.
--
-- Both tables are empty, so re-pointing the constraint cannot orphan any rows.

ALTER TABLE customer_links
  DROP CONSTRAINT IF EXISTS customer_links_quote_id_fkey;

ALTER TABLE customer_links
  ADD CONSTRAINT customer_links_quote_id_fkey
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_customer_links_quote_id ON customer_links(quote_id);

-- PostgREST caches the schema; make it pick up the new relationship immediately.
NOTIFY pgrst, 'reload schema';
