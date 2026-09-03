-- Fix quote creation, which has never worked.
--
-- The app writes quotes to the `quotes` table (createQuote in src/lib/supabase.ts),
-- inserting quote_type, terms, and expires_at among other fields. But the
-- `quotes` table was created without those three columns — a full-schema copy
-- lives in the stale `security_quotes` table the code no longer uses. So every
-- save failed with PostgREST "Could not find the 'quote_type' column", surfaced
-- to the user as a generic "Failed to create quote", and the quotes table has
-- stayed empty. That's what pushed quoting into GoHighLevel.
--
-- Adding the three missing columns makes the whole chain work: Quote Builder →
-- quotes row → customer link → the customer's e-sign page.

alter table public.quotes
  add column if not exists quote_type text,
  add column if not exists terms text,
  add column if not exists expires_at timestamptz;
