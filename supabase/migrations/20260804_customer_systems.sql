-- What each customer actually has on site.
--
-- Nothing in the database recorded this before: which panel is in which
-- building, how many extinguishers, what's monitored and for how much. It lived
-- in Howard's head, so the portal had nothing real to show and there was no way
-- to know what inspections were coming due.
--
-- One table backs three things:
--   * the customer portal's Services page
--   * inspection reminders (next_inspection_due)
--   * recurring monthly revenue (monitored + monthly_rate)

CREATE TABLE IF NOT EXISTS customer_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  system_type TEXT NOT NULL CHECK (system_type IN (
    'fire_alarm',
    'sprinkler',
    'extinguisher',
    'emergency_lighting',
    'fire_lane',
    'knox_box',
    'security_alarm',
    'video_surveillance',
    'access_control',
    'pa_system',
    'nurse_call',
    'gate_entry',
    'fiber_network',
    'other'
  )),

  -- What and where, in plain language: "Silent Knight 5820XL, main electrical room"
  description TEXT,
  location TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,

  install_date DATE,
  last_inspection_date DATE,
  inspection_frequency TEXT NOT NULL DEFAULT 'annual' CHECK (inspection_frequency IN (
    'monthly', 'quarterly', 'semi_annual', 'annual', 'biennial', 'five_year', 'none'
  )),
  -- Derived from last_inspection_date + frequency when either changes, but kept
  -- as a stored column so reminders can be queried by date directly.
  next_inspection_due DATE,

  -- Recurring monthly revenue
  monitored BOOLEAN NOT NULL DEFAULT false,
  monthly_rate NUMERIC(10,2),

  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'needs_service', 'inactive')),
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_systems_customer ON customer_systems(customer_id);
-- Drives "what's due in the next 30/60/90 days" without scanning everything.
CREATE INDEX IF NOT EXISTS idx_customer_systems_due
  ON customer_systems(next_inspection_due)
  WHERE next_inspection_due IS NOT NULL AND status <> 'inactive';
-- Drives the RMR roll-up.
CREATE INDEX IF NOT EXISTS idx_customer_systems_monitored
  ON customer_systems(monitored)
  WHERE monitored = true;

NOTIFY pgrst, 'reload schema';
