-- Fire extinguisher and kitchen hood inspections, and the per-device
-- equipment log the extinguisher report is built from.
--
-- Postgres refuses to use a new enum value inside the transaction that added
-- it, so the checklists for the new types are seeded in the next migration
-- file rather than here.

ALTER TYPE inspection_type ADD VALUE IF NOT EXISTS 'fire_extinguisher';
ALTER TYPE inspection_type ADD VALUE IF NOT EXISTS 'kitchen_hood';

-- One row per extinguisher (or per suppression system): where it is, what it
-- is, its hydro/six-year dates, and whether it passed. Read and written whole
-- with the inspection, so jsonb — the same reasoning as nfpa72_form.
ALTER TABLE inspections
  ADD COLUMN IF NOT EXISTS equipment jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN inspections.equipment IS
  'Per-device rows for the printed report. Shape defined by EquipmentRow in src/lib/inspection-report.ts.';
