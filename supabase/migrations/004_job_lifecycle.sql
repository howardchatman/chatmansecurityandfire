-- ============================================
-- Job Lifecycle / Work Order Extensions
-- ============================================
-- Extends the jobs system with full lifecycle tracking,
-- checklists, audit logs, and quote integration.

-- ============================================
-- EXTEND JOBS TABLE
-- ============================================

-- Add new columns to jobs table
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES public.security_quotes(id),
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS scope_summary TEXT,
  ADD COLUMN IF NOT EXISTS billing_notes TEXT,
  ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS invoiced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Update status constraint to include full lifecycle
-- First drop the old constraint and add new one
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check
  CHECK (status IN (
    'lead',
    'quoted',
    'approved',
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

-- Update photo_type constraint to include more categories
ALTER TABLE public.job_photos DROP CONSTRAINT IF EXISTS job_photos_photo_type_check;
ALTER TABLE public.job_photos ADD CONSTRAINT job_photos_photo_type_check
  CHECK (photo_type IN (
    'before',
    'during',
    'after',
    'deficiency',
    'fire_lane',
    'panel',
    'rtu',
    'device',
    'issue',
    'general',
    'signature',
    'other'
  ));

-- ============================================
-- JOB CHECKLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.job_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  checklist_type TEXT NOT NULL CHECK (checklist_type IN (
    'service',
    'installation',
    'inspection',
    'fire_marshal',
    'commissioning',
    'maintenance',
    'custom'
  )),
  name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Each item: { id, label, status: 'pending'|'passed'|'failed'|'na', note, completed_at, completed_by }
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- JOB EVENTS AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.job_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created',
    'status_change',
    'assignment_added',
    'assignment_removed',
    'photo_uploaded',
    'note_added',
    'checklist_updated',
    'checklist_completed',
    'scheduled',
    'rescheduled',
    'started',
    'paused',
    'completed',
    'invoiced',
    'paid',
    'converted_from_quote',
    'custom'
  )),
  payload JSONB DEFAULT '{}'::jsonb,
  -- payload examples:
  -- status_change: { from: 'scheduled', to: 'in_progress' }
  -- assignment_added: { user_id, user_name, role }
  -- photo_uploaded: { photo_id, photo_type }
  -- note_added: { note_id, preview }
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CHECKLIST TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.job_checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Each item: { id, label, description, required }
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_jobs_quote ON public.jobs(quote_id);
CREATE INDEX IF NOT EXISTS idx_jobs_full_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_job_checklists_job ON public.job_checklists(job_id);
CREATE INDEX IF NOT EXISTS idx_job_checklists_type ON public.job_checklists(checklist_type);
CREATE INDEX IF NOT EXISTS idx_job_events_job ON public.job_events(job_id);
CREATE INDEX IF NOT EXISTS idx_job_events_type ON public.job_events(event_type);
CREATE INDEX IF NOT EXISTS idx_job_events_created ON public.job_events(created_at);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE TRIGGER update_job_checklists_updated_at
  BEFORE UPDATE ON public.job_checklists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_job_checklist_templates_updated_at
  BEFORE UPDATE ON public.job_checklist_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- AUTO-CREATE JOB EVENT ON STATUS CHANGE
-- ============================================
CREATE OR REPLACE FUNCTION log_job_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.job_events (job_id, event_type, payload, created_by)
    VALUES (
      NEW.id,
      'status_change',
      jsonb_build_object('from', OLD.status, 'to', NEW.status),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER job_status_change_trigger
  AFTER UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION log_job_status_change();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.job_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_checklist_templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- JOB CHECKLISTS RLS POLICIES
-- ============================================

-- Admin full access
CREATE POLICY "Admin full access to job_checklists"
  ON public.job_checklists FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Managers can manage checklists for their team's jobs
CREATE POLICY "Manager manage team job_checklists"
  ON public.job_checklists FOR ALL
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

-- Techs can view and update checklists for assigned jobs
CREATE POLICY "Tech view assigned job_checklists"
  ON public.job_checklists FOR SELECT
  TO authenticated
  USING (is_assigned_to_job(job_id));

CREATE POLICY "Tech update assigned job_checklists"
  ON public.job_checklists FOR UPDATE
  TO authenticated
  USING (is_assigned_to_job(job_id))
  WITH CHECK (is_assigned_to_job(job_id));

-- ============================================
-- JOB EVENTS RLS POLICIES
-- ============================================

-- Admin full access
CREATE POLICY "Admin full access to job_events"
  ON public.job_events FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Managers can view and create events for their team's jobs
CREATE POLICY "Manager access team job_events"
  ON public.job_events FOR ALL
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

-- Techs can view events for assigned jobs
CREATE POLICY "Tech view assigned job_events"
  ON public.job_events FOR SELECT
  TO authenticated
  USING (is_assigned_to_job(job_id));

-- Techs can create events for assigned jobs
CREATE POLICY "Tech create assigned job_events"
  ON public.job_events FOR INSERT
  TO authenticated
  WITH CHECK (
    is_assigned_to_job(job_id)
    AND created_by = auth.uid()
  );

-- ============================================
-- CHECKLIST TEMPLATES RLS POLICIES
-- ============================================

-- Everyone can view active templates
CREATE POLICY "View active checklist_templates"
  ON public.job_checklist_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admin can manage templates
CREATE POLICY "Admin manage checklist_templates"
  ON public.job_checklist_templates FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- SEED DATA: DEFAULT CHECKLIST TEMPLATES
-- ============================================

INSERT INTO public.job_checklist_templates (checklist_type, name, description, items) VALUES
-- Service Call Checklist
('service', 'Standard Service Call', 'Basic service call checklist for fire alarm systems', '[
  {"id": "arrive", "label": "Arrived on site", "description": "Confirm arrival and check in with customer", "required": true},
  {"id": "identify", "label": "Identify reported issue", "description": "Verify the issue reported by customer", "required": true},
  {"id": "diagnose", "label": "Diagnose root cause", "description": "Determine the underlying cause of the issue", "required": true},
  {"id": "repair", "label": "Complete repair/replacement", "description": "Perform necessary repairs or replacements", "required": true},
  {"id": "test", "label": "Test system operation", "description": "Verify system operates correctly after repair", "required": true},
  {"id": "panel_clear", "label": "Clear panel troubles", "description": "Ensure no trouble signals remain on panel", "required": true},
  {"id": "customer_demo", "label": "Demonstrate to customer", "description": "Show customer the repair and system operation", "required": false},
  {"id": "photos", "label": "Take completion photos", "description": "Document completed work with photos", "required": true},
  {"id": "signature", "label": "Obtain customer signature", "description": "Get customer sign-off on completed work", "required": true}
]'::jsonb),

-- Installation Checklist
('installation', 'Fire Alarm Installation', 'Comprehensive checklist for new fire alarm installations', '[
  {"id": "permits", "label": "Verify permits obtained", "description": "Confirm all required permits are in place", "required": true},
  {"id": "site_survey", "label": "Complete site survey", "description": "Verify installation locations match plans", "required": true},
  {"id": "rough_in", "label": "Complete rough-in wiring", "description": "Install all cables and junction boxes", "required": true},
  {"id": "device_mount", "label": "Mount all devices", "description": "Install smoke detectors, pull stations, horn/strobes", "required": true},
  {"id": "panel_install", "label": "Install control panel", "description": "Mount and wire fire alarm control panel", "required": true},
  {"id": "program", "label": "Program system", "description": "Configure zones, devices, and monitoring", "required": true},
  {"id": "test_devices", "label": "Test all devices", "description": "Functional test every initiating and notification device", "required": true},
  {"id": "monitoring", "label": "Verify monitoring connection", "description": "Confirm signals reach central station", "required": true},
  {"id": "documentation", "label": "Complete as-built drawings", "description": "Update drawings with actual installation", "required": true},
  {"id": "customer_training", "label": "Train customer", "description": "Instruct customer on system operation", "required": true},
  {"id": "final_inspection", "label": "Schedule final inspection", "description": "Coordinate Fire Marshal inspection", "required": true}
]'::jsonb),

-- Fire Marshal Inspection Prep
('fire_marshal', 'Fire Marshal Prep Checklist', 'Preparation checklist before Fire Marshal inspection', '[
  {"id": "panel_clear", "label": "Panel shows no troubles", "description": "All trouble signals resolved", "required": true},
  {"id": "zone_maps", "label": "Zone maps posted", "description": "Current zone map displayed at panel", "required": true},
  {"id": "as_builts", "label": "As-built drawings available", "description": "Current drawings on site", "required": true},
  {"id": "battery_test", "label": "Battery test completed", "description": "Secondary power test performed", "required": true},
  {"id": "device_test", "label": "All devices tested", "description": "100% device test completed within 30 days", "required": true},
  {"id": "monitoring_test", "label": "Monitoring test completed", "description": "Central station signal verified", "required": true},
  {"id": "exit_signs", "label": "Exit signs illuminated", "description": "All exit signs working", "required": true},
  {"id": "emergency_lights", "label": "Emergency lights working", "description": "90-minute test completed", "required": true},
  {"id": "fire_extinguishers", "label": "Extinguishers current", "description": "Tags current, proper placement", "required": true},
  {"id": "fire_lanes", "label": "Fire lanes clear", "description": "Access lanes unobstructed", "required": true},
  {"id": "knox_box", "label": "Knox box verified", "description": "Contains current keys", "required": false}
]'::jsonb),

-- Commissioning Checklist
('commissioning', 'System Commissioning', 'Final commissioning checklist for new installations', '[
  {"id": "visual_inspect", "label": "Visual inspection complete", "description": "All devices properly installed and labeled", "required": true},
  {"id": "wiring_verify", "label": "Wiring verification", "description": "All connections verified per drawings", "required": true},
  {"id": "ground_fault", "label": "Ground fault test", "description": "No ground faults on any circuit", "required": true},
  {"id": "device_test_100", "label": "100% device test", "description": "Every device functionally tested", "required": true},
  {"id": "nac_test", "label": "NAC circuit test", "description": "Notification appliances verified", "required": true},
  {"id": "battery_calc", "label": "Battery calculation verified", "description": "Secondary power meets requirements", "required": true},
  {"id": "programming_verify", "label": "Programming verified", "description": "All zones and responses correct", "required": true},
  {"id": "monitoring_both", "label": "Monitoring test (alarm & trouble)", "description": "Both signal types received by central station", "required": true},
  {"id": "documentation_complete", "label": "Documentation package complete", "description": "All required documents assembled", "required": true}
]'::jsonb),

-- Maintenance Checklist
('maintenance', 'Annual Maintenance', 'Annual maintenance inspection checklist', '[
  {"id": "visual", "label": "Visual inspection", "description": "Check all devices for damage or obstruction", "required": true},
  {"id": "panel_inspect", "label": "Panel inspection", "description": "Check for troubles, verify programming", "required": true},
  {"id": "battery_test", "label": "Battery load test", "description": "24-hour standby / 5-minute alarm test", "required": true},
  {"id": "smoke_sensitivity", "label": "Smoke detector sensitivity", "description": "Test or replace per manufacturer specs", "required": true},
  {"id": "device_sample", "label": "Device sample test", "description": "Test required percentage of devices", "required": true},
  {"id": "waterflow", "label": "Waterflow test", "description": "If applicable, test waterflow switches", "required": false},
  {"id": "tamper", "label": "Tamper switch test", "description": "If applicable, test valve tampers", "required": false},
  {"id": "monitoring", "label": "Monitoring test", "description": "Verify signals to central station", "required": true},
  {"id": "documentation", "label": "Complete inspection report", "description": "Document all findings", "required": true}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON public.job_checklists TO authenticated;
GRANT ALL ON public.job_events TO authenticated;
GRANT ALL ON public.job_checklist_templates TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
