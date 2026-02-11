-- Proposal Agent tables for Chatman Security & Fire

-- Proposal Inventory (pricing catalog for proposals)
CREATE TABLE IF NOT EXISTS proposal_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'each',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Proposal Procedures (SOPs)
CREATE TABLE IF NOT EXISTS proposal_procedures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  steps TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Proposal Clients
CREATE TABLE IF NOT EXISTS proposal_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_title TEXT,
  contact_email TEXT,
  org_type TEXT,
  num_facilities INTEGER DEFAULT 1,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Proposal History
CREATE TABLE IF NOT EXISTS proposal_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES proposal_clients(id) ON DELETE SET NULL,
  client_name TEXT,
  tier TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','won','lost')),
  total_low NUMERIC(12,2),
  total_high NUMERIC(12,2),
  filename TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default inventory (58 items)
INSERT INTO proposal_inventory (name, category, unit_cost, unit, description) VALUES
  ('Fire Alarm Panel (Addressable)', 'Fire Alarm', 4500, 'per panel', 'Addressable fire alarm control panel, supports up to 250 devices'),
  ('Smoke Detector (Photoelectric)', 'Fire Alarm', 85, 'per device', 'Photoelectric smoke detector, ceiling mount'),
  ('Pull Station', 'Fire Alarm', 120, 'per device', 'Manual fire alarm pull station, dual action'),
  ('Horn/Strobe Combo', 'Fire Alarm', 150, 'per device', 'Wall-mount horn/strobe notification appliance, ADA compliant'),
  ('Sprinkler Head (Pendant)', 'Sprinkler', 45, 'per head', 'Standard pendant sprinkler head, 155°F rating'),
  ('Sprinkler Head (Sidewall)', 'Sprinkler', 65, 'per head', 'Sidewall sprinkler head for corridor applications'),
  ('Fire Extinguisher (ABC, 10lb)', 'Extinguisher', 75, 'each', 'Multi-purpose ABC dry chemical, 10lb capacity'),
  ('Exit Sign (LED, Battery Backup)', 'Egress', 95, 'each', 'LED exit sign with 90-min battery backup'),
  ('Emergency Light (LED)', 'Egress', 110, 'each', 'Dual-head LED emergency light, 90-min backup'),
  ('Kitchen Hood Suppression System', 'Suppression', 8500, 'per system', 'Wet chemical kitchen hood fire suppression, includes installation'),
  ('Fire Door (3hr rated)', 'Passive', 1800, 'per door', '3-hour fire rated door assembly with closer and hardware'),
  ('Fire Caulk / Firestop', 'Passive', 35, 'per penetration', 'Intumescent firestop sealant for wall/floor penetrations'),
  ('Monitoring Service (Annual)', 'Monitoring', 600, 'per year', '24/7 UL-listed central station fire alarm monitoring'),
  ('Fire Alarm Inspection (Annual)', 'Inspection', 450, 'per visit', 'NFPA 72 compliant annual fire alarm inspection and testing'),
  ('Sprinkler Inspection (Annual)', 'Inspection', 350, 'per visit', 'NFPA 25 compliant annual sprinkler system inspection'),
  ('Intrusion Alarm Panel', 'Security Alarm', 3200, 'per panel', 'Commercial intrusion alarm control panel, 64-zone expandable'),
  ('Motion Detector (PIR)', 'Security Alarm', 95, 'per device', 'Passive infrared motion detector, pet-immune, wall/ceiling mount'),
  ('Door/Window Contact Sensor', 'Security Alarm', 45, 'per device', 'Surface-mount magnetic door/window contact, hardwired'),
  ('Glass Break Detector', 'Security Alarm', 110, 'per device', 'Acoustic glass break sensor, 25ft range'),
  ('Keypad (Touchscreen)', 'Security Alarm', 275, 'each', 'Color touchscreen alarm keypad with proximity reader'),
  ('Siren (Interior)', 'Security Alarm', 65, 'each', 'Interior piezo siren, 110dB output'),
  ('Siren (Exterior Strobe)', 'Security Alarm', 185, 'each', 'Weatherproof exterior siren with strobe, tamper-proof'),
  ('Security Monitoring (Annual)', 'Security Alarm', 480, 'per year', '24/7 UL-listed central station intrusion monitoring'),
  ('IP Camera (4MP Dome)', 'Cameras', 320, 'each', '4MP indoor dome IP camera, IR night vision, PoE'),
  ('IP Camera (4MP Bullet)', 'Cameras', 350, 'each', '4MP outdoor bullet IP camera, IP67 weatherproof, IR 100ft'),
  ('IP Camera (4K Turret)', 'Cameras', 480, 'each', '8MP 4K turret camera, wide angle, built-in mic, PoE'),
  ('PTZ Camera (4MP)', 'Cameras', 1200, 'each', '4MP pan-tilt-zoom camera, 25x optical zoom, auto-tracking'),
  ('NVR (16-Channel)', 'Cameras', 850, 'each', '16-channel network video recorder, 4TB HDD, H.265+'),
  ('NVR (32-Channel)', 'Cameras', 1400, 'each', '32-channel NVR, 8TB HDD, RAID support, remote viewing'),
  ('Camera License Plate Reader (LPR)', 'Cameras', 1800, 'each', 'Dedicated LPR camera with analytics, vehicle logging'),
  ('Camera Installation (per camera)', 'Cameras', 250, 'per camera', 'Professional camera installation, includes cabling up to 200ft, mounting, and configuration'),
  ('Video Monitoring Service (Annual)', 'Cameras', 720, 'per year', 'Remote video monitoring and verification service, 24/7'),
  ('Access Control Panel (2-Door)', 'Access Control', 1100, 'per panel', '2-door access controller, supports card + PIN + mobile credentials'),
  ('Access Control Panel (4-Door)', 'Access Control', 1800, 'per panel', '4-door access controller, TCP/IP, battery backup'),
  ('Card Reader (Proximity)', 'Access Control', 175, 'each', 'Proximity card/fob reader, Wiegand output, weatherproof'),
  ('Card Reader (Smart/Mobile)', 'Access Control', 350, 'each', 'Multi-technology reader: smart card, fob, mobile credential, Bluetooth'),
  ('Electric Strike', 'Access Control', 220, 'each', 'Fail-secure electric strike for access-controlled doors'),
  ('Magnetic Door Lock (600lb)', 'Access Control', 280, 'each', '600lb holding force electromagnetic lock with LED status'),
  ('Request-to-Exit (REX) Sensor', 'Access Control', 85, 'each', 'Passive infrared request-to-exit motion sensor'),
  ('Access Control Software License', 'Access Control', 1500, 'per site', 'Cloud-based access control management software, annual license'),
  ('Visitor Management Kiosk', 'Access Control', 2800, 'each', 'Tablet-based visitor check-in kiosk with badge printing and ID scanning'),
  ('Fire Lane Striping (per linear ft)', 'Fire Lane', 4, 'per linear ft', 'Red curb striping with reflective paint, includes surface prep'),
  ('Fire Lane Sign (post-mounted)', 'Fire Lane', 175, 'each', 'Regulatory fire lane sign on galvanized post, meets local code'),
  ('Fire Lane Sign (wall-mounted)', 'Fire Lane', 85, 'each', 'Wall-mounted fire lane / no parking sign, aluminum'),
  ('Fire Lane Stencil Marking', 'Fire Lane', 65, 'each', 'FIRE LANE stencil lettering on pavement, reflective thermoplastic'),
  ('Fire Lane Bollard', 'Fire Lane', 450, 'each', 'Steel bollard with reflective tape, concrete-set, protects fire connections'),
  ('Fire Lane Assessment & Mapping', 'Fire Lane', 500, 'per facility', 'Survey and map all fire lanes, hydrant access, and FDC zones per facility'),
  ('Initial Compliance Consultation', 'Consulting', 500, 'per session', '2-hour initial consultation including document review and scope discussion'),
  ('On-Site Compliance Assessment (Small)', 'Consulting', 2000, 'per facility', 'Full compliance walkthrough for small facility (<20,000 sq ft)'),
  ('On-Site Compliance Assessment (Mid)', 'Consulting', 3000, 'per facility', 'Full compliance walkthrough for mid-size facility (20,000-60,000 sq ft)'),
  ('On-Site Compliance Assessment (Large)', 'Consulting', 4000, 'per facility', 'Full compliance walkthrough for large/complex facility (60,000+ sq ft)'),
  ('Fire Marshal Coordination Fee', 'Consulting', 1500, 'per facility', 'Fire Marshal liaison services: scheduling, inspection attendance, advocacy'),
  ('Compliance Report Generation', 'Consulting', 750, 'per report', 'Individual facility compliance report with photos, code references, and prioritized findings'),
  ('Master Compliance Summary', 'Consulting', 2500, 'per district', 'District-wide master compliance summary with executive overview and cost estimates'),
  ('Project Management Fee', 'Consulting', 125, 'per hour', 'Remediation project management and oversight, billed hourly'),
  ('Code Consultation / Expert Witness', 'Consulting', 200, 'per hour', 'Fire code consultation, code interpretation, or expert witness services'),
  ('Business Continuity Planning', 'Consulting', 3500, 'per plan', 'Fire safety business continuity plan development for commercial clients'),
  ('Staff Fire Safety Training', 'Consulting', 800, 'per session', 'On-site fire safety training for staff, up to 30 attendees, includes materials');

-- Seed default procedures (6 SOPs)
INSERT INTO proposal_procedures (name, category, steps, notes) VALUES
  ('Initial Site Assessment', 'Assessment', '1. Request all existing fire safety documentation from client
2. Review previous Fire Marshal inspection reports
3. Obtain building blueprints and floor plans
4. Identify building occupancy classification
5. Determine applicable fire codes (IFC, NFPA)
6. Schedule on-site walkthrough', 'Allow 2-3 hours for initial document review per facility'),
  ('On-Site Compliance Walkthrough', 'Assessment', '1. Fire alarm system test (pull stations, detectors, notification)
2. Sprinkler system visual inspection (heads, valves, risers)
3. Emergency exit route verification (signage, lighting, clearance)
4. Fire extinguisher check (placement, certification, accessibility)
5. Fire door inspection (closers, latches, gaps, rating labels)
6. Electrical panel clearance verification (36" minimum)
7. Kitchen hood suppression inspection
8. Occupancy load verification
9. Stairwell pressurization test (if applicable)
10. Fire pump test (if applicable)
11. Document all deficiencies with photos
12. Rate each finding by priority (Critical/High/Medium/Low)', 'Typical walkthrough: 1-2 hours for small facility, 3-4 hours for large/complex. Bring camera, clipboard, PPE.'),
  ('Fire Marshal Coordination', 'Coordination', '1. Compile assessment findings into Fire Marshal-ready format
2. Schedule pre-inspection meeting with FM office
3. Present compliance plan and remediation timeline
4. Negotiate reasonable compliance deadlines
5. Attend formal inspection as client representative
6. Document all FM requirements and action items
7. Provide written summary to client within 24 hours', 'Always establish rapport with FM early. Position as their ally in getting the building compliant.'),
  ('Compliance Report Generation', 'Reporting', '1. Organize findings by system category
2. Assign priority ratings to each deficiency
3. Include photo documentation for each finding
4. Reference specific code sections for each violation
5. Provide remediation recommendations with cost estimates
6. Create executive summary for leadership
7. Generate facility compliance score (0-100%)
8. Deliver digital report within 5 business days of assessment', 'Use Chatman report template. Always include the consulting fee offset mention in recommendations.'),
  ('Cost Estimation Process', 'Estimating', '1. List all required remediation items from assessment
2. Pull current pricing from inventory database
3. Calculate labor hours per item
4. Apply volume discounts for multi-facility contracts
5. Add project management overhead (12-15%)
6. Include permit and inspection fees
7. Break down by priority tier (Critical/High/Medium/Low)
8. Present phased payment options
9. Include consulting fee offset calculation', 'Standard markup on equipment: 25-35%. Labor rate: $85-$125/hr depending on trade. Always show the offset value prominently.'),
  ('Remediation Project Management', 'Project Mgmt', '1. Develop master project schedule
2. Secure necessary permits
3. Coordinate subcontractor scheduling
4. Conduct weekly progress meetings with client
5. Perform quality inspections at each milestone
6. Document all work with photos and sign-offs
7. Schedule Fire Marshal re-inspection
8. Obtain certificate of compliance
9. Deliver final project close-out package', 'This is where the real revenue is. Consulting fee offset makes us the natural choice for the remediation work.');
