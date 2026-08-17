-- Photo and document uploads for jobs and inspections.
--
-- Photos are public buckets: they render inline in the app with plain URLs,
-- and a leaked photo of a fire alarm panel is not a secret. Documents are the
-- opposite — test forms, signed paperwork — so that bucket is private and the
-- app hands out short-lived signed URLs, the same pattern as résumés.

insert into storage.buckets (id, name, public)
values
  ('inspection-photos', 'inspection-photos', true),
  ('job-photos', 'job-photos', true),
  ('tech-documents', 'tech-documents', false)
on conflict (id) do nothing;

-- One table for uploaded forms/documents, attachable to a job or an
-- inspection. A document belongs to at least one of the two.
create table if not exists uploaded_documents (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  inspection_id uuid references inspections(id) on delete cascade,
  file_path text not null,        -- object path inside the tech-documents bucket
  file_name text not null,        -- original filename, shown in the list
  mime_type text,
  size_bytes bigint,
  label text,                     -- what the tech calls it: "Backflow test form"
  uploaded_by uuid,
  uploaded_by_name text,
  created_at timestamptz not null default now(),
  constraint uploaded_documents_parent check (job_id is not null or inspection_id is not null)
);

create index if not exists uploaded_documents_job_idx on uploaded_documents (job_id) where job_id is not null;
create index if not exists uploaded_documents_inspection_idx on uploaded_documents (inspection_id) where inspection_id is not null;

alter table uploaded_documents enable row level security;
-- No policies on purpose: all access goes through the API with the service
-- role. Anon-key access stays blocked.
