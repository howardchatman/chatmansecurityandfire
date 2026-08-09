-- NFPA 72 Inspection and Testing Form (Figure 10.6.2.3).
--
-- One document per inspection, always read and written whole, never queried
-- field by field — so it lives as jsonb on the inspection rather than becoming
-- a table with two hundred columns.

ALTER TABLE inspections
  ADD COLUMN IF NOT EXISTS nfpa72_form jsonb;

COMMENT ON COLUMN inspections.nfpa72_form IS
  'NFPA 72 Fig. 10.6.2.3 Inspection & Testing Form. Shape defined by Nfpa72Form in src/lib/nfpa72.ts. Null means no report started.';

-- Finding the inspections that still need their report written is the one
-- query worth an index, and a partial index keeps it small.
CREATE INDEX IF NOT EXISTS inspections_missing_nfpa72_idx
  ON inspections (scheduled_date DESC)
  WHERE nfpa72_form IS NULL;
