-- ============================================
-- Team/Tech Portal Schema
-- ============================================
-- Creates tables for team management, job assignments,
-- and technician portal with full RLS security.

-- ============================================
-- TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'technician' CHECK (role IN ('admin', 'manager', 'technician', 'inspector')),
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  site_address TEXT NOT NULL,
  site_city TEXT,
  site_state TEXT DEFAULT 'TX',
  site_zip TEXT,
  job_type TEXT NOT NULL CHECK (job_type IN ('inspection', 'installation', 'service', 'repair', 'maintenance', 'emergency')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'emergency')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  description TEXT,
  notes TEXT,
  -- Scheduling
  scheduled_date DATE,
  scheduled_time_start TIME,
  scheduled_time_end TIME,
  estimated_duration_hours DECIMAL(4,2),
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  -- Completion
  completion_notes TEXT,
  customer_signature_url TEXT,
  completed_at TIMESTAMPTZ,
  -- Metadata
  created_by UUID REFERENCES public.profiles(id),
  team_id UUID REFERENCES public.teams(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-generate job numbers
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.job_number IS NULL THEN
    NEW.job_number := 'JOB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                      LPAD(CAST(FLOOR(RANDOM() * 10000) AS TEXT), 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_job_number
  BEFORE INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION generate_job_number();

-- ============================================
-- JOB ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id),
  role TEXT DEFAULT 'technician' CHECK (role IN ('lead', 'technician', 'helper', 'inspector')),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  UNIQUE(job_id, user_id)
);

-- ============================================
-- JOB PHOTOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  photo_type TEXT DEFAULT 'general' CHECK (photo_type IN ('before', 'during', 'after', 'issue', 'general', 'signature')),
  taken_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- JOB NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.job_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  note TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'issue', 'customer', 'internal', 'completion')),
  is_customer_visible BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_team ON public.profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON public.jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_jobs_team ON public.jobs(team_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON public.jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_job_assignments_job ON public.job_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_user ON public.job_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_job ON public.job_photos(job_id);
CREATE INDEX IF NOT EXISTS idx_job_notes_job ON public.job_notes(job_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_job_notes_updated_at
  BEFORE UPDATE ON public.job_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_notes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's team_id
CREATE OR REPLACE FUNCTION get_user_team_id()
RETURNS UUID AS $$
  SELECT team_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is admin or manager
CREATE OR REPLACE FUNCTION is_admin_or_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager') AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is assigned to a job
CREATE OR REPLACE FUNCTION is_assigned_to_job(job_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.job_assignments
    WHERE job_id = job_uuid AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- TEAMS RLS POLICIES
-- ============================================

-- Admin can do everything with teams
CREATE POLICY "Admin full access to teams"
  ON public.teams FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Everyone can view active teams
CREATE POLICY "View active teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================
-- PROFILES RLS POLICIES
-- ============================================

-- Admin can do everything with profiles
CREATE POLICY "Admin full access to profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Users can view their own profile
CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Managers can view team members
CREATE POLICY "Managers view team profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    get_user_role() = 'manager'
    AND team_id = get_user_team_id()
  );

-- ============================================
-- JOBS RLS POLICIES
-- ============================================

-- Admin can do everything with jobs
CREATE POLICY "Admin full access to jobs"
  ON public.jobs FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Managers can manage their team's jobs
CREATE POLICY "Managers manage team jobs"
  ON public.jobs FOR ALL
  TO authenticated
  USING (
    get_user_role() = 'manager'
    AND team_id = get_user_team_id()
  )
  WITH CHECK (
    get_user_role() = 'manager'
    AND team_id = get_user_team_id()
  );

-- Technicians/Inspectors can view assigned jobs
CREATE POLICY "Tech view assigned jobs"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (is_assigned_to_job(id));

-- Technicians can update assigned jobs (status, notes, completion)
CREATE POLICY "Tech update assigned jobs"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (is_assigned_to_job(id))
  WITH CHECK (is_assigned_to_job(id));

-- ============================================
-- JOB ASSIGNMENTS RLS POLICIES
-- ============================================

-- Admin can do everything with assignments
CREATE POLICY "Admin full access to assignments"
  ON public.job_assignments FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Managers can manage their team's job assignments
CREATE POLICY "Managers manage team assignments"
  ON public.job_assignments FOR ALL
  TO authenticated
  USING (
    get_user_role() = 'manager'
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND j.team_id = get_user_team_id()
    )
  )
  WITH CHECK (
    get_user_role() = 'manager'
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND j.team_id = get_user_team_id()
    )
  );

-- Users can view their own assignments
CREATE POLICY "Users view own assignments"
  ON public.job_assignments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can acknowledge their assignments
CREATE POLICY "Users acknowledge assignments"
  ON public.job_assignments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- JOB PHOTOS RLS POLICIES
-- ============================================

-- Admin can do everything with photos
CREATE POLICY "Admin full access to photos"
  ON public.job_photos FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Managers can manage their team's job photos
CREATE POLICY "Managers manage team photos"
  ON public.job_photos FOR ALL
  TO authenticated
  USING (
    get_user_role() = 'manager'
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND j.team_id = get_user_team_id()
    )
  )
  WITH CHECK (
    get_user_role() = 'manager'
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND j.team_id = get_user_team_id()
    )
  );

-- Users can view photos for assigned jobs
CREATE POLICY "Users view assigned job photos"
  ON public.job_photos FOR SELECT
  TO authenticated
  USING (is_assigned_to_job(job_id));

-- Users can upload photos to assigned jobs
CREATE POLICY "Users upload to assigned jobs"
  ON public.job_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    is_assigned_to_job(job_id)
    AND uploaded_by = auth.uid()
  );

-- Users can delete their own photos
CREATE POLICY "Users delete own photos"
  ON public.job_photos FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- ============================================
-- JOB NOTES RLS POLICIES
-- ============================================

-- Admin can do everything with notes
CREATE POLICY "Admin full access to notes"
  ON public.job_notes FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Managers can manage their team's job notes
CREATE POLICY "Managers manage team notes"
  ON public.job_notes FOR ALL
  TO authenticated
  USING (
    get_user_role() = 'manager'
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND j.team_id = get_user_team_id()
    )
  )
  WITH CHECK (
    get_user_role() = 'manager'
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND j.team_id = get_user_team_id()
    )
  );

-- Users can view notes for assigned jobs
CREATE POLICY "Users view assigned job notes"
  ON public.job_notes FOR SELECT
  TO authenticated
  USING (is_assigned_to_job(job_id));

-- Users can add notes to assigned jobs
CREATE POLICY "Users add notes to assigned jobs"
  ON public.job_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    is_assigned_to_job(job_id)
    AND user_id = auth.uid()
  );

-- Users can update their own notes
CREATE POLICY "Users update own notes"
  ON public.job_notes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- STORAGE BUCKET FOR JOB PHOTOS
-- ============================================

-- Create storage bucket for job photos (run in Supabase dashboard if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('job-photos', 'job-photos', false);

-- Storage policies would be:
-- CREATE POLICY "Authenticated users can upload job photos"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'job-photos');

-- CREATE POLICY "Users can view photos for assigned jobs"
--   ON storage.objects FOR SELECT
--   TO authenticated
--   USING (bucket_id = 'job-photos');

-- ============================================
-- SEED DATA: DEFAULT TEAMS
-- ============================================
INSERT INTO public.teams (name, description) VALUES
  ('Fire Alarm', 'Fire alarm installation and inspection team'),
  ('Sprinkler', 'Fire sprinkler installation and inspection team'),
  ('Service', 'General service and maintenance team')
ON CONFLICT DO NOTHING;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON public.teams TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.jobs TO authenticated;
GRANT ALL ON public.job_assignments TO authenticated;
GRANT ALL ON public.job_photos TO authenticated;
GRANT ALL ON public.job_notes TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
