-- ============================================
-- Inspection & Deficiency Management Schema
-- ============================================
-- Supports fire alarm inspections, sprinkler monitoring,
-- deficiency tracking, and quote generation.

-- ============================================
-- INSPECTION TYPES ENUM
-- ============================================
CREATE TYPE inspection_type AS ENUM (
  'fire_alarm',
  'sprinkler_monitoring',
  'reinspection',
  'fire_marshal_pre'
);

CREATE TYPE inspection_status AS ENUM (
  'scheduled',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TYPE deficiency_severity AS ENUM (
  'minor',
  'major',
  'critical'
);

CREATE TYPE deficiency_status AS ENUM (
  'open',
  'quoted',
  'approved',
  'in_progress',
  'completed'
);

CREATE TYPE deficiency_category AS ENUM (
  'emergency_lighting',
  'duct_smoke',
  'fire_lane',
  'panel_trouble',
  'monitoring',
  'smoke_detector',
  'heat_detector',
  'pull_station',
  'horn_strobe',
  'sprinkler_head',
  'valve',
  'signage',
  'documentation',
  'other'
);

-- ============================================
-- INSPECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_number TEXT UNIQUE,

  -- Customer/Site Info
  customer_id UUID REFERENCES public.security_customers(id),
  customer_name TEXT NOT NULL,
  site_address TEXT NOT NULL,
  site_city TEXT,
  site_state TEXT DEFAULT 'TX',
  site_zip TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,

  -- Inspection Details
  inspection_type inspection_type NOT NULL,
  inspector_id UUID REFERENCES public.profiles(id),

  -- Scheduling
  scheduled_date DATE,
  scheduled_time TIME,
  duration_minutes INTEGER DEFAULT 60,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,

  -- Status & Results
  status inspection_status DEFAULT 'scheduled',
  passed BOOLEAN,
  pass_with_deficiencies BOOLEAN DEFAULT false,

  -- Notes & Documentation
  notes TEXT,
  internal_notes TEXT,
  fire_marshal_notes TEXT,

  -- Checklist Results (JSON for flexibility)
  checklist_results JSONB DEFAULT '[]'::jsonb,

  -- Related Records
  job_id UUID REFERENCES public.jobs(id),
  quote_id UUID,

  -- Metadata
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-generate inspection numbers
CREATE OR REPLACE FUNCTION generate_inspection_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.inspection_number IS NULL THEN
    NEW.inspection_number := 'INS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                            LPAD(CAST(FLOOR(RANDOM() * 10000) AS TEXT), 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_inspection_number
  BEFORE INSERT ON public.inspections
  FOR EACH ROW
  EXECUTE FUNCTION generate_inspection_number();

-- ============================================
-- DEFICIENCIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.deficiencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,

  -- Deficiency Details
  category deficiency_category NOT NULL,
  location TEXT,
  description TEXT NOT NULL,
  severity deficiency_severity NOT NULL DEFAULT 'minor',

  -- Recommended Action
  recommended_action TEXT,
  code_reference TEXT,

  -- Cost Estimates
  estimated_cost_low DECIMAL(10,2),
  estimated_cost_high DECIMAL(10,2),
  actual_cost DECIMAL(10,2),

  -- Status Tracking
  status deficiency_status DEFAULT 'open',
  quoted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Quote Integration
  quote_id UUID,
  quote_line_item_id TEXT,

  -- Metadata
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INSPECTION PHOTOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.inspection_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  deficiency_id UUID REFERENCES public.deficiencies(id) ON DELETE SET NULL,

  -- Photo Details
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  photo_type TEXT DEFAULT 'general' CHECK (photo_type IN ('general', 'deficiency', 'before', 'after', 'panel', 'device')),

  -- Location/Context
  location TEXT,
  device_tag TEXT,

  -- Metadata
  uploaded_by UUID REFERENCES public.profiles(id),
  taken_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INSPECTION CHECKLIST TEMPLATES
-- ============================================
CREATE TABLE IF NOT EXISTS public.inspection_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_type inspection_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_inspections_customer ON public.inspections(customer_id);
CREATE INDEX IF NOT EXISTS idx_inspections_inspector ON public.inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON public.inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_scheduled_date ON public.inspections(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_inspections_type ON public.inspections(inspection_type);
CREATE INDEX IF NOT EXISTS idx_deficiencies_inspection ON public.deficiencies(inspection_id);
CREATE INDEX IF NOT EXISTS idx_deficiencies_status ON public.deficiencies(status);
CREATE INDEX IF NOT EXISTS idx_deficiencies_severity ON public.deficiencies(severity);
CREATE INDEX IF NOT EXISTS idx_inspection_photos_inspection ON public.inspection_photos(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_photos_deficiency ON public.inspection_photos(deficiency_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_deficiencies_updated_at
  BEFORE UPDATE ON public.deficiencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_checklists ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INSPECTIONS RLS POLICIES
-- ============================================

-- Admin full access
CREATE POLICY "Admin full access to inspections"
  ON public.inspections FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Managers can manage all inspections
CREATE POLICY "Manager full access to inspections"
  ON public.inspections FOR ALL
  TO authenticated
  USING (get_user_role() = 'manager')
  WITH CHECK (get_user_role() = 'manager');

-- Inspectors/Techs can view and update assigned inspections
CREATE POLICY "Inspector view assigned inspections"
  ON public.inspections FOR SELECT
  TO authenticated
  USING (
    inspector_id = auth.uid() OR
    created_by = auth.uid()
  );

CREATE POLICY "Inspector update assigned inspections"
  ON public.inspections FOR UPDATE
  TO authenticated
  USING (inspector_id = auth.uid())
  WITH CHECK (inspector_id = auth.uid());

-- Inspectors/Techs can create inspections
CREATE POLICY "Tech create inspections"
  ON public.inspections FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role() IN ('technician', 'inspector', 'manager', 'admin')
  );

-- ============================================
-- DEFICIENCIES RLS POLICIES
-- ============================================

-- Admin full access
CREATE POLICY "Admin full access to deficiencies"
  ON public.deficiencies FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Manager full access
CREATE POLICY "Manager full access to deficiencies"
  ON public.deficiencies FOR ALL
  TO authenticated
  USING (get_user_role() = 'manager')
  WITH CHECK (get_user_role() = 'manager');

-- Inspectors/Techs can manage deficiencies on their inspections
CREATE POLICY "Inspector manage deficiencies"
  ON public.deficiencies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_id
      AND (i.inspector_id = auth.uid() OR i.created_by = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_id
      AND (i.inspector_id = auth.uid() OR i.created_by = auth.uid())
    )
  );

-- ============================================
-- INSPECTION PHOTOS RLS POLICIES
-- ============================================

-- Admin full access
CREATE POLICY "Admin full access to inspection_photos"
  ON public.inspection_photos FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Manager full access
CREATE POLICY "Manager full access to inspection_photos"
  ON public.inspection_photos FOR ALL
  TO authenticated
  USING (get_user_role() = 'manager')
  WITH CHECK (get_user_role() = 'manager');

-- Inspectors/Techs can manage photos on their inspections
CREATE POLICY "Inspector manage inspection_photos"
  ON public.inspection_photos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_id
      AND (i.inspector_id = auth.uid() OR i.created_by = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_id
      AND (i.inspector_id = auth.uid() OR i.created_by = auth.uid())
    )
  );

-- ============================================
-- CHECKLISTS RLS (Admin/Manager only for management)
-- ============================================

-- Everyone can view active checklists
CREATE POLICY "View active checklists"
  ON public.inspection_checklists FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admin can manage checklists
CREATE POLICY "Admin manage checklists"
  ON public.inspection_checklists FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- SEED DATA: DEFAULT CHECKLISTS
-- ============================================

-- Fire Alarm Inspection Checklist (NFPA 72)
INSERT INTO public.inspection_checklists (inspection_type, name, description, items) VALUES
('fire_alarm', 'NFPA 72 Fire Alarm Inspection', 'Standard fire alarm inspection checklist per NFPA 72', '[
  {"id": "panel_visual", "category": "Control Panel", "item": "Panel visual inspection", "description": "Check for physical damage, proper clearance, and accessibility", "required": true},
  {"id": "panel_trouble", "category": "Control Panel", "item": "Panel trouble signals", "description": "Verify no active trouble conditions", "required": true},
  {"id": "panel_supervision", "category": "Control Panel", "item": "Supervisory signals", "description": "Test supervisory signal transmission", "required": true},
  {"id": "battery_test", "category": "Control Panel", "item": "Battery load test", "description": "Perform 24-hour standby / 5-minute alarm load test", "required": true},
  {"id": "ground_fault", "category": "Control Panel", "item": "Ground fault test", "description": "Check for ground faults on SLC and NAC circuits", "required": true},
  {"id": "smoke_detectors", "category": "Initiating Devices", "item": "Smoke detector test", "description": "Functional test all smoke detectors", "required": true},
  {"id": "heat_detectors", "category": "Initiating Devices", "item": "Heat detector test", "description": "Functional test all heat detectors", "required": true},
  {"id": "pull_stations", "category": "Initiating Devices", "item": "Manual pull station test", "description": "Test all manual pull stations", "required": true},
  {"id": "duct_detectors", "category": "Initiating Devices", "item": "Duct detector test", "description": "Test duct smoke detectors and HVAC shutdown", "required": true},
  {"id": "horns_strobes", "category": "Notification Devices", "item": "Horn/strobe test", "description": "Verify all notification appliances activate", "required": true},
  {"id": "speaker_test", "category": "Notification Devices", "item": "Speaker/voice test", "description": "Test voice evacuation system if applicable", "required": false},
  {"id": "door_holders", "category": "Auxiliary Functions", "item": "Door holder release", "description": "Test magnetic door holder release on alarm", "required": false},
  {"id": "elevator_recall", "category": "Auxiliary Functions", "item": "Elevator recall", "description": "Test elevator recall function", "required": false},
  {"id": "monitoring", "category": "Communications", "item": "Central station test", "description": "Verify signal transmission to monitoring station", "required": true},
  {"id": "documentation", "category": "Documentation", "item": "Record of completion", "description": "Complete inspection documentation", "required": true}
]'::jsonb),

-- Sprinkler Monitoring Only Checklist
('sprinkler_monitoring', 'Sprinkler Monitoring Inspection', 'Monitoring-only inspection for fire sprinkler systems', '[
  {"id": "tamper_switches", "category": "Supervisory Devices", "item": "Tamper switch test", "description": "Test all valve tamper switches", "required": true},
  {"id": "flow_switches", "category": "Supervisory Devices", "item": "Water flow switch test", "description": "Test water flow alarm switches", "required": true},
  {"id": "low_air", "category": "Supervisory Devices", "item": "Low air pressure switch", "description": "Test low air pressure supervisory if dry system", "required": false},
  {"id": "panel_signals", "category": "Control Panel", "item": "Panel signal verification", "description": "Verify all supervisory and alarm signals at panel", "required": true},
  {"id": "monitoring_test", "category": "Communications", "item": "Central station test", "description": "Verify signal transmission to monitoring station", "required": true},
  {"id": "documentation", "category": "Documentation", "item": "Record of completion", "description": "Complete inspection documentation", "required": true}
]'::jsonb),

-- Reinspection Checklist
('reinspection', 'Reinspection Checklist', 'Follow-up inspection for previously noted deficiencies', '[
  {"id": "review_prior", "category": "Documentation", "item": "Review prior deficiencies", "description": "Review all deficiencies from prior inspection", "required": true},
  {"id": "verify_corrections", "category": "Verification", "item": "Verify corrections", "description": "Verify each deficiency has been properly corrected", "required": true},
  {"id": "functional_test", "category": "Testing", "item": "Functional test corrected items", "description": "Perform functional tests on corrected items", "required": true},
  {"id": "new_issues", "category": "Inspection", "item": "Check for new issues", "description": "Inspect for any new deficiencies", "required": true},
  {"id": "documentation", "category": "Documentation", "item": "Record of completion", "description": "Complete reinspection documentation", "required": true}
]'::jsonb),

-- Fire Marshal Pre-Inspection
('fire_marshal_pre', 'Fire Marshal Pre-Inspection', 'Pre-inspection checklist before Fire Marshal visit', '[
  {"id": "panel_access", "category": "Access", "item": "Panel accessibility", "description": "Verify 36\" clearance in front of panel", "required": true},
  {"id": "panel_labeling", "category": "Documentation", "item": "Panel labeling", "description": "Verify zone maps and device labels are current", "required": true},
  {"id": "trouble_clear", "category": "Control Panel", "item": "Clear all troubles", "description": "Resolve any active trouble conditions", "required": true},
  {"id": "record_drawings", "category": "Documentation", "item": "As-built drawings", "description": "Verify as-built drawings are available and current", "required": true},
  {"id": "inspection_records", "category": "Documentation", "item": "Inspection records", "description": "Have last inspection report available", "required": true},
  {"id": "fire_lanes", "category": "Site", "item": "Fire lane compliance", "description": "Verify fire lanes are clear and properly marked", "required": true},
  {"id": "exit_signs", "category": "Egress", "item": "Exit signage", "description": "Verify all exit signs illuminated and visible", "required": true},
  {"id": "emergency_lights", "category": "Egress", "item": "Emergency lighting", "description": "Test emergency lighting 30-second push test", "required": true},
  {"id": "extinguishers", "category": "Site", "item": "Fire extinguishers", "description": "Verify extinguishers serviced and accessible", "required": true},
  {"id": "knox_box", "category": "Access", "item": "Knox box", "description": "Verify Knox box present and contains current keys", "required": false}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON public.inspections TO authenticated;
GRANT ALL ON public.deficiencies TO authenticated;
GRANT ALL ON public.inspection_photos TO authenticated;
GRANT ALL ON public.inspection_checklists TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
