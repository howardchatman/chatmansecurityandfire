-- customer_links.quote_id has always pointed at quotes(id), but no foreign key
-- constraint was ever declared. PostgREST resolves embeds from foreign keys, so
-- `quote:quotes(...)` in /api/customer-links failed with PGRST200
-- ("Could not find a relationship between 'customer_links' and 'quotes'") and
-- the whole endpoint returned 500. Declaring the FK fixes the embed.
--
-- ON DELETE CASCADE: a customer link is meaningless once its quote is gone.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customer_links_quote_id_fkey'
  ) THEN
    ALTER TABLE customer_links
      ADD CONSTRAINT customer_links_quote_id_fkey
      FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_customer_links_quote_id ON customer_links(quote_id);
