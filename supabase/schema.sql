-- ============================================
-- SECURITY PLATFORM DATABASE SCHEMA
-- All tables prefixed with 'security_' to avoid conflicts
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- LEADS TABLE
-- Captures potential customers from website, chat, calls
-- ============================================
CREATE TABLE IF NOT EXISTS security_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT,
    preferred_contact VARCHAR(20) DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'text')),
    source VARCHAR(50) DEFAULT 'website' CHECK (source IN ('website', 'chat', 'phone', 'referral', 'ad', 'other')),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
    assigned_to UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_leads_email ON security_leads(email);
CREATE INDEX IF NOT EXISTS idx_security_leads_status ON security_leads(status);
CREATE INDEX IF NOT EXISTS idx_security_leads_created_at ON security_leads(created_at DESC);

-- ============================================
-- CUSTOMERS TABLE
-- Converted leads and active customers
-- ============================================
CREATE TABLE IF NOT EXISTS security_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    lead_id UUID REFERENCES security_leads(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_customers_email ON security_customers(email);
CREATE INDEX IF NOT EXISTS idx_security_customers_auth_user ON security_customers(auth_user_id);

-- ============================================
-- PROPERTIES TABLE
-- Customer locations/properties
-- ============================================
CREATE TABLE IF NOT EXISTS security_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES security_customers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    property_type VARCHAR(50) DEFAULT 'residential' CHECK (property_type IN ('residential', 'commercial', 'industrial', 'mixed')),
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    notes TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_properties_customer ON security_properties(customer_id);

-- ============================================
-- ALARM SYSTEMS TABLE
-- Installed security systems per property
-- ============================================
CREATE TABLE IF NOT EXISTS security_alarm_systems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES security_properties(id) ON DELETE CASCADE,
    system_type VARCHAR(50) NOT NULL CHECK (system_type IN ('security', 'fire', 'combined', 'surveillance', 'access_control')),
    panel_model VARCHAR(100),
    panel_serial VARCHAR(100),
    install_date DATE,
    warranty_end DATE,
    monitoring_plan VARCHAR(50),
    monthly_rate DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_alarm_systems_property ON security_alarm_systems(property_id);

-- ============================================
-- ZONES TABLE
-- Alarm zones per system
-- ============================================
CREATE TABLE IF NOT EXISTS security_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_id UUID NOT NULL REFERENCES security_alarm_systems(id) ON DELETE CASCADE,
    zone_number INTEGER NOT NULL,
    zone_name VARCHAR(100) NOT NULL,
    zone_type VARCHAR(50) CHECK (zone_type IN ('door', 'window', 'motion', 'glass_break', 'smoke', 'heat', 'co', 'water', 'panic', 'other')),
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    bypass_allowed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_zones_system ON security_zones(system_id);

-- ============================================
-- EMPLOYEES TABLE
-- Company employees/technicians
-- ============================================
CREATE TABLE IF NOT EXISTS security_employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    employee_number VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'technician' CHECK (role IN ('admin', 'manager', 'dispatcher', 'technician', 'sales', 'accounting')),
    department VARCHAR(100),
    hire_date DATE,
    hourly_rate DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    skills JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_employees_email ON security_employees(email);
CREATE INDEX IF NOT EXISTS idx_security_employees_role ON security_employees(role);

-- ============================================
-- SERVICE TICKETS TABLE
-- Service/maintenance requests
-- ============================================
CREATE TABLE IF NOT EXISTS security_service_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE,
    customer_id UUID NOT NULL REFERENCES security_customers(id),
    property_id UUID REFERENCES security_properties(id),
    system_id UUID REFERENCES security_alarm_systems(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('emergency', 'urgent', 'normal', 'low')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'scheduled', 'in_progress', 'completed', 'cancelled')),
    ticket_type VARCHAR(50) DEFAULT 'service' CHECK (ticket_type IN ('service', 'installation', 'inspection', 'repair', 'upgrade', 'other')),
    assigned_to UUID REFERENCES security_employees(id),
    scheduled_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    resolution TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_tickets_customer ON security_service_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_security_tickets_status ON security_service_tickets(status);
CREATE INDEX IF NOT EXISTS idx_security_tickets_assigned ON security_service_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_security_tickets_scheduled ON security_service_tickets(scheduled_date);

-- Auto-generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('security_ticket_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS security_ticket_seq START 1;

DROP TRIGGER IF EXISTS set_ticket_number ON security_service_tickets;
CREATE TRIGGER set_ticket_number
    BEFORE INSERT ON security_service_tickets
    FOR EACH ROW
    WHEN (NEW.ticket_number IS NULL)
    EXECUTE FUNCTION generate_ticket_number();

-- ============================================
-- APPOINTMENTS TABLE
-- Scheduled appointments
-- ============================================
CREATE TABLE IF NOT EXISTS security_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES security_service_tickets(id),
    customer_id UUID NOT NULL REFERENCES security_customers(id),
    property_id UUID REFERENCES security_properties(id),
    technician_id UUID REFERENCES security_employees(id),
    appointment_type VARCHAR(50) CHECK (appointment_type IN ('installation', 'service', 'inspection', 'consultation', 'other')),
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_appointments_technician ON security_appointments(technician_id);
CREATE INDEX IF NOT EXISTS idx_security_appointments_date ON security_appointments(scheduled_start);

-- ============================================
-- TIME ENTRIES TABLE
-- Employee time tracking
-- ============================================
CREATE TABLE IF NOT EXISTS security_time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES security_employees(id),
    ticket_id UUID REFERENCES security_service_tickets(id),
    appointment_id UUID REFERENCES security_appointments(id),
    clock_in TIMESTAMPTZ NOT NULL,
    clock_out TIMESTAMPTZ,
    break_minutes INTEGER DEFAULT 0,
    entry_type VARCHAR(20) DEFAULT 'regular' CHECK (entry_type IN ('regular', 'overtime', 'travel', 'training')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_time_employee ON security_time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_security_time_date ON security_time_entries(clock_in);

-- ============================================
-- INVOICES TABLE
-- Customer invoices
-- ============================================
CREATE TABLE IF NOT EXISTS security_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE,
    customer_id UUID NOT NULL REFERENCES security_customers(id),
    ticket_id UUID REFERENCES security_service_tickets(id),
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5, 4) DEFAULT 0.0825,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled')),
    due_date DATE,
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_invoices_customer ON security_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_security_invoices_status ON security_invoices(status);

-- Auto-generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('security_invoice_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS security_invoice_seq START 1;

DROP TRIGGER IF EXISTS set_invoice_number ON security_invoices;
CREATE TRIGGER set_invoice_number
    BEFORE INSERT ON security_invoices
    FOR EACH ROW
    WHEN (NEW.invoice_number IS NULL)
    EXECUTE FUNCTION generate_invoice_number();

-- ============================================
-- INVOICE ITEMS TABLE
-- Line items per invoice
-- ============================================
CREATE TABLE IF NOT EXISTS security_invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES security_invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    item_type VARCHAR(20) DEFAULT 'service' CHECK (item_type IN ('service', 'equipment', 'labor', 'monitoring', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_invoice_items_invoice ON security_invoice_items(invoice_id);

-- ============================================
-- PAYMENTS TABLE
-- Payment records
-- ============================================
CREATE TABLE IF NOT EXISTS security_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES security_invoices(id),
    customer_id UUID NOT NULL REFERENCES security_customers(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('credit_card', 'debit_card', 'ach', 'check', 'cash', 'other')),
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    transaction_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_payments_invoice ON security_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_security_payments_customer ON security_payments(customer_id);

-- ============================================
-- INVENTORY ITEMS TABLE
-- Parts/equipment catalog
-- ============================================
CREATE TABLE IF NOT EXISTS security_inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    unit_cost DECIMAL(10, 2),
    unit_price DECIMAL(10, 2),
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_inventory_sku ON security_inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_security_inventory_category ON security_inventory_items(category);

-- ============================================
-- INVENTORY STOCK TABLE
-- Stock levels per location
-- ============================================
CREATE TABLE IF NOT EXISTS security_inventory_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES security_inventory_items(id),
    location VARCHAR(100) DEFAULT 'warehouse',
    quantity INTEGER NOT NULL DEFAULT 0,
    last_counted TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, location)
);

CREATE INDEX IF NOT EXISTS idx_security_stock_item ON security_inventory_stock(item_id);

-- ============================================
-- ESTIMATES TABLE
-- Job estimates/proposals
-- ============================================
CREATE TABLE IF NOT EXISTS security_estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimate_number VARCHAR(50) UNIQUE,
    lead_id UUID REFERENCES security_leads(id),
    customer_id UUID REFERENCES security_customers(id),
    property_id UUID REFERENCES security_properties(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired')),
    valid_until DATE,
    accepted_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_estimates_customer ON security_estimates(customer_id);
CREATE INDEX IF NOT EXISTS idx_security_estimates_lead ON security_estimates(lead_id);

-- Auto-generate estimate numbers
CREATE OR REPLACE FUNCTION generate_estimate_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.estimate_number := 'EST-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('security_estimate_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS security_estimate_seq START 1;

DROP TRIGGER IF EXISTS set_estimate_number ON security_estimates;
CREATE TRIGGER set_estimate_number
    BEFORE INSERT ON security_estimates
    FOR EACH ROW
    WHEN (NEW.estimate_number IS NULL)
    EXECUTE FUNCTION generate_estimate_number();

-- ============================================
-- ESTIMATE ITEMS TABLE
-- Line items per estimate
-- ============================================
CREATE TABLE IF NOT EXISTS security_estimate_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimate_id UUID NOT NULL REFERENCES security_estimates(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES security_inventory_items(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    item_type VARCHAR(20) DEFAULT 'equipment' CHECK (item_type IN ('equipment', 'labor', 'monitoring', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_estimate_items_estimate ON security_estimate_items(estimate_id);

-- ============================================
-- CALL LOGS TABLE
-- Phone call records (AIVA integration)
-- ============================================
CREATE TABLE IF NOT EXISTS security_call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES security_leads(id),
    customer_id UUID REFERENCES security_customers(id),
    caller_name VARCHAR(255),
    caller_phone VARCHAR(50),
    duration_seconds INTEGER,
    call_type VARCHAR(20) DEFAULT 'inbound' CHECK (call_type IN ('inbound', 'outbound')),
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    summary TEXT,
    transcript JSONB,
    retell_call_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_calls_lead ON security_call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_security_calls_customer ON security_call_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_security_calls_date ON security_call_logs(created_at DESC);

-- ============================================
-- CHAT CONVERSATIONS TABLE
-- AIVA chat history
-- ============================================
CREATE TABLE IF NOT EXISTS security_chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES security_leads(id),
    customer_id UUID REFERENCES security_customers(id),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_chat_session ON security_chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_security_chat_lead ON security_chat_conversations(lead_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- System notifications
-- ============================================
CREATE TABLE IF NOT EXISTS security_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    customer_id UUID REFERENCES security_customers(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) CHECK (notification_type IN ('alert', 'reminder', 'system', 'billing', 'service')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_notifications_user ON security_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_security_notifications_customer ON security_notifications(customer_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE security_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alarm_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_inventory_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_notifications ENABLE ROW LEVEL SECURITY;

-- Public policies for demo (allow anonymous insert/select)
-- In production, these would be more restrictive

-- Leads: Allow public insert (for lead capture)
CREATE POLICY "Allow public insert on leads" ON security_leads
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public select on leads" ON security_leads
    FOR SELECT TO anon USING (true);

-- Service role has full access
CREATE POLICY "Service role full access to leads" ON security_leads
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to customers" ON security_customers
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to properties" ON security_properties
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to alarm_systems" ON security_alarm_systems
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to zones" ON security_zones
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to employees" ON security_employees
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to tickets" ON security_service_tickets
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to appointments" ON security_appointments
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to time_entries" ON security_time_entries
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to invoices" ON security_invoices
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to invoice_items" ON security_invoice_items
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to payments" ON security_payments
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to inventory_items" ON security_inventory_items
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to inventory_stock" ON security_inventory_stock
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to estimates" ON security_estimates
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to estimate_items" ON security_estimate_items
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to call_logs" ON security_call_logs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to chat_conversations" ON security_chat_conversations
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to notifications" ON security_notifications
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_security_leads_updated_at
    BEFORE UPDATE ON security_leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_security_customers_updated_at
    BEFORE UPDATE ON security_customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_security_properties_updated_at
    BEFORE UPDATE ON security_properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_security_alarm_systems_updated_at
    BEFORE UPDATE ON security_alarm_systems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_security_employees_updated_at
    BEFORE UPDATE ON security_employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_security_tickets_updated_at
    BEFORE UPDATE ON security_service_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_security_appointments_updated_at
    BEFORE UPDATE ON security_appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_security_invoices_updated_at
    BEFORE UPDATE ON security_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_security_inventory_items_updated_at
    BEFORE UPDATE ON security_inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_security_inventory_stock_updated_at
    BEFORE UPDATE ON security_inventory_stock
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_security_estimates_updated_at
    BEFORE UPDATE ON security_estimates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_security_chat_updated_at
    BEFORE UPDATE ON security_chat_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ADMIN USERS TABLE
-- Custom auth (bypasses Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS security_admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('admin', 'manager', 'customer')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_admin_users_email ON security_admin_users(email);

-- RLS policies
ALTER TABLE security_admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to admin_users" ON security_admin_users
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER update_security_admin_users_updated_at
    BEFORE UPDATE ON security_admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
