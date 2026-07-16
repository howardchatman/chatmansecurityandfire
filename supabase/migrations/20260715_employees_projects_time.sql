-- Migration: Employee phone, real Projects, GPS time tracking
-- 1. admin_users.phone — store employee phone numbers
-- 2. projects — real project management (replaces jobs-as-projects hack)
-- 3. time_entries — employee clock in/out with GPS stamps (mobile field use)

-- ============================================================================
-- 1. EMPLOYEE PHONE
-- ============================================================================
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS phone TEXT;

-- ============================================================================
-- 2. PROJECTS (real project management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_number TEXT UNIQUE,
    name TEXT NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    site_address TEXT,
    site_city TEXT,
    site_state TEXT DEFAULT 'TX',
    site_zip TEXT,
    service_category TEXT, -- fire_alarm, fire_sprinkler, fiber_optics, wireless, security_alarm, multi...
    status TEXT NOT NULL DEFAULT 'planning', -- planning, bidding, awarded, in_progress, on_hold, punch_list, completed, closed, lost
    contract_value NUMERIC(12,2),
    amount_invoiced NUMERIC(12,2) DEFAULT 0,
    amount_paid NUMERIC(12,2) DEFAULT 0,
    start_date DATE,
    target_end_date DATE,
    completed_at TIMESTAMPTZ,
    general_contractor TEXT,
    permit_number TEXT,
    description TEXT,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects(customer_id);

-- Auto project number: PRJ-YYYY-0001
CREATE SEQUENCE IF NOT EXISTS project_number_seq;
CREATE OR REPLACE FUNCTION set_project_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.project_number IS NULL THEN
        NEW.project_number := 'PRJ-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
            LPAD(nextval('project_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_project_number ON projects;
CREATE TRIGGER trg_project_number
    BEFORE INSERT ON projects
    FOR EACH ROW EXECUTE FUNCTION set_project_number();

-- Project tasks (checklist / phases within a project)
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo', -- todo, in_progress, blocked, done
    assigned_to UUID, -- admin_users.id
    due_date DATE,
    sort_order INT DEFAULT 0,
    notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);

-- ============================================================================
-- 3. TIME TRACKING with GPS (employee mobile clock in/out)
-- ============================================================================
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL, -- admin_users.id
    employee_name TEXT,
    job_id UUID,      -- optional link to jobs
    project_id UUID,  -- optional link to projects
    clock_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    clock_in_lat DOUBLE PRECISION,
    clock_in_lng DOUBLE PRECISION,
    clock_in_accuracy DOUBLE PRECISION, -- meters, from the device
    clock_out TIMESTAMPTZ,
    clock_out_lat DOUBLE PRECISION,
    clock_out_lng DOUBLE PRECISION,
    clock_out_accuracy DOUBLE PRECISION,
    minutes INT GENERATED ALWAYS AS (
        CASE WHEN clock_out IS NULL THEN NULL
             ELSE GREATEST(0, EXTRACT(EPOCH FROM (clock_out - clock_in)) / 60)::INT
        END
    ) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_in ON time_entries(clock_in);
