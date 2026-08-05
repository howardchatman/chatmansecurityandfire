-- Three gaps in the job lifecycle:
--   consultation_scheduled — a site visit is booked but nothing is quoted yet
--   agreement_sent         — quote accepted in principle, waiting on signature
--   permit_submitted /
--   permit_approved        — plans are with the AHJ. This is the important one:
--                            a job can sit here for one to two weeks with
--                            nothing visibly happening, and without a status
--                            for it the job looks stalled to everyone,
--                            including the customer.

ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

ALTER TABLE jobs ADD CONSTRAINT jobs_status_check CHECK (status IN (
  'lead',
  'consultation_scheduled',
  'quoted',
  'agreement_sent',
  'approved',
  'permit_submitted',
  'permit_approved',
  'pending',
  'scheduled',
  'in_progress',
  'awaiting_inspection',
  'corrections_required',
  'passed',
  'on_hold',
  'completed',
  'invoiced',
  'paid',
  'closed',
  'cancelled'
));

NOTIFY pgrst, 'reload schema';
