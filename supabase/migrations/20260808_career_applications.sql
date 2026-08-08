-- Job applications from the careers pages.
--
-- Separate from `leads` on purpose: a leads table holds people who want to buy
-- from us, and mixing applicants into it would put résumés in the sales
-- pipeline and hiring data in front of anyone reviewing leads.

CREATE TABLE IF NOT EXISTS career_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which posting they applied to, by slug from src/lib/careers.ts
  role_slug TEXT NOT NULL,
  role_title TEXT NOT NULL,

  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,

  years_experience TEXT,
  -- What they actually work on; may differ from the role applied for
  disciplines TEXT[] DEFAULT '{}',
  licenses TEXT,
  message TEXT,

  resume_url TEXT,
  resume_filename TEXT,

  -- Applicant chose to keep a profile on file for future openings. Consent is
  -- explicit and stored, so we can show why we still hold their details.
  wants_profile BOOLEAN NOT NULL DEFAULT false,

  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new', 'reviewing', 'interviewing', 'offered', 'hired', 'not_a_fit', 'archived'
  )),
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_apps_status ON career_applications(status);
CREATE INDEX IF NOT EXISTS idx_career_apps_role ON career_applications(role_slug);
CREATE INDEX IF NOT EXISTS idx_career_apps_created ON career_applications(created_at DESC);
-- Talent pool: everyone who opted in to be kept on file.
CREATE INDEX IF NOT EXISTS idx_career_apps_profile
  ON career_applications(wants_profile) WHERE wants_profile = true;

NOTIFY pgrst, 'reload schema';
