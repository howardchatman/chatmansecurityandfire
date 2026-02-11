-- Migration 007: Inventory and Invoices
-- Adds inventory management and full invoice tracking with line items

-- ============================================================================
-- INVENTORY MANAGEMENT
-- ============================================================================

-- Inventory categories for organization
CREATE TABLE IF NOT EXISTS inventory_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6B7280', -- For UI display
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO inventory_categories (name, description, color) VALUES
    ('Panels', 'Control panels and main units', '#3B82F6'),
    ('Sensors', 'Motion sensors, glass break, door/window contacts', '#10B981'),
    ('Cameras', 'IP cameras, DVRs, NVRs', '#8B5CF6'),
    ('Fire', 'Smoke detectors, heat detectors, pull stations', '#EF4444'),
    ('Keypads', 'User interface keypads and touchscreens', '#F59E0B'),
    ('Sirens', 'Indoor and outdoor sirens, strobes', '#EC4899'),
    ('Power', 'Batteries, transformers, power supplies', '#6366F1'),
    ('Wire & Cable', 'All wiring and cable types', '#64748B'),
    ('Sprinkler', 'Sprinkler heads, valves, fittings', '#0EA5E9'),
    ('Monitoring', 'Communicators, cellular modules', '#14B8A6')
ON CONFLICT (name) DO NOTHING;

-- Main inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES inventory_categories(id),
    manufacturer TEXT,
    model_number TEXT,

    -- Pricing
    cost DECIMAL(10,2) NOT NULL DEFAULT 0, -- What we pay
    price DECIMAL(10,2) NOT NULL DEFAULT 0, -- What we charge

    -- Stock management
    quantity_in_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER NOT NULL DEFAULT 5,
    reorder_point INTEGER DEFAULT 10,

    -- Location tracking
    warehouse_location TEXT,
    bin_number TEXT,

    -- Additional info
    unit_of_measure TEXT DEFAULT 'each', -- each, foot, box, etc.
    weight_lbs DECIMAL(8,2),

    -- Image
    image_url TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    discontinued BOOLEAN DEFAULT FALSE,

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory transactions for tracking stock changes
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,

    transaction_type TEXT NOT NULL CHECK (transaction_type IN (
        'received',      -- Stock received from supplier
        'sold',          -- Sold to customer
        'used_job',      -- Used on a job
        'returned',      -- Returned from customer/job
        'adjustment',    -- Manual adjustment
        'damaged',       -- Damaged/written off
        'transferred'    -- Transferred between locations
    )),

    quantity INTEGER NOT NULL, -- Positive for additions, negative for removals
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,

    -- Reference to related records
    job_id UUID REFERENCES jobs(id),
    invoice_id UUID, -- Will reference invoices table below

    -- Cost tracking
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),

    -- Who and why
    performed_by UUID REFERENCES profiles(id),
    reason TEXT,
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INVOICES AND LINE ITEMS
-- ============================================================================

-- Main invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Invoice identification
    invoice_number TEXT UNIQUE NOT NULL,

    -- Customer reference
    customer_id UUID REFERENCES security_customers(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    customer_address TEXT,

    -- Related records
    job_id UUID REFERENCES jobs(id),
    quote_id UUID REFERENCES security_quotes(id),

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft',      -- Being prepared
        'sent',       -- Sent to customer
        'viewed',     -- Customer viewed it
        'partial',    -- Partially paid
        'paid',       -- Fully paid
        'overdue',    -- Past due date
        'cancelled',  -- Cancelled
        'refunded'    -- Refunded
    )),

    -- Dates
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    sent_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,

    -- Amounts (calculated from line items)
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0.0825, -- Default 8.25% Texas sales tax
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    balance_due DECIMAL(12,2) NOT NULL DEFAULT 0,

    -- Payment info
    payment_terms TEXT DEFAULT 'Net 30',
    accepted_payment_methods TEXT[] DEFAULT ARRAY['card', 'ach', 'check'],

    -- Stripe integration
    stripe_invoice_id TEXT,
    stripe_invoice_url TEXT,
    stripe_pdf_url TEXT,

    -- Additional content
    notes TEXT,
    terms_and_conditions TEXT,
    internal_notes TEXT,

    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice line items
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

    -- Line item order
    line_number INTEGER NOT NULL,

    -- Item reference (optional - can be custom line items)
    inventory_item_id UUID REFERENCES inventory_items(id),

    -- Item details
    item_type TEXT NOT NULL DEFAULT 'product' CHECK (item_type IN (
        'product',    -- Physical product from inventory
        'labor',      -- Labor charges
        'service',    -- Service charges
        'permit',     -- Permit fees
        'monitoring', -- Monitoring fees
        'other'       -- Miscellaneous
    )),

    sku TEXT,
    description TEXT NOT NULL,

    -- Quantities and pricing
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_of_measure TEXT DEFAULT 'each',
    unit_price DECIMAL(12,2) NOT NULL,

    -- Discounts per line
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,

    -- Calculated
    line_total DECIMAL(12,2) NOT NULL,

    -- Tax handling
    is_taxable BOOLEAN DEFAULT TRUE,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice payments tracking
CREATE TABLE IF NOT EXISTS invoice_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

    amount DECIMAL(12,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN (
        'card',
        'ach',
        'check',
        'cash',
        'wire',
        'other'
    )),

    -- Payment details
    reference_number TEXT, -- Check number, transaction ID, etc.
    stripe_payment_id TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN (
        'pending',
        'completed',
        'failed',
        'refunded'
    )),

    notes TEXT,
    received_by UUID REFERENCES profiles(id),
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice activity log
CREATE TABLE IF NOT EXISTS invoice_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

    event_type TEXT NOT NULL CHECK (event_type IN (
        'created',
        'updated',
        'sent',
        'viewed',
        'payment_received',
        'payment_failed',
        'reminder_sent',
        'marked_overdue',
        'cancelled',
        'refunded'
    )),

    description TEXT,
    metadata JSONB,

    performed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUTO-GENERATE INVOICE NUMBERS
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix TEXT;
    next_number INTEGER;
BEGIN
    year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)
    ), 0) + 1
    INTO next_number
    FROM invoices
    WHERE invoice_number LIKE year_prefix || '%';

    NEW.invoice_number := year_prefix || LPAD(next_number::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number
    BEFORE INSERT ON invoices
    FOR EACH ROW
    WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
    EXECUTE FUNCTION generate_invoice_number();

-- ============================================================================
-- AUTO-UPDATE INVOICE TOTALS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
    inv_subtotal DECIMAL(12,2);
    inv_tax DECIMAL(12,2);
    inv_total DECIMAL(12,2);
    inv_paid DECIMAL(12,2);
    inv_tax_rate DECIMAL(5,4);
    inv_discount DECIMAL(12,2);
BEGIN
    -- Get the invoice tax rate and discount
    SELECT tax_rate, COALESCE(discount_amount, 0)
    INTO inv_tax_rate, inv_discount
    FROM invoices
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    -- Calculate subtotal from line items
    SELECT COALESCE(SUM(line_total), 0)
    INTO inv_subtotal
    FROM invoice_line_items
    WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    -- Calculate tax on taxable items only
    SELECT COALESCE(SUM(line_total), 0) * inv_tax_rate
    INTO inv_tax
    FROM invoice_line_items
    WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    AND is_taxable = TRUE;

    -- Calculate total
    inv_total := inv_subtotal + inv_tax - inv_discount;

    -- Get amount paid
    SELECT COALESCE(SUM(amount), 0)
    INTO inv_paid
    FROM invoice_payments
    WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    AND status = 'completed';

    -- Update the invoice
    UPDATE invoices
    SET
        subtotal = inv_subtotal,
        tax_amount = inv_tax,
        total = inv_total,
        amount_paid = inv_paid,
        balance_due = inv_total - inv_paid,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on line items changes
CREATE TRIGGER update_invoice_on_line_item
    AFTER INSERT OR UPDATE OR DELETE ON invoice_line_items
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_totals();

-- Trigger on payment changes
CREATE TRIGGER update_invoice_on_payment
    AFTER INSERT OR UPDATE OR DELETE ON invoice_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_totals();

-- ============================================================================
-- UPDATE TIMESTAMPS
-- ============================================================================

CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_inventory_categories_updated_at
    BEFORE UPDATE ON inventory_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_active ON inventory_items(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_inventory_items_low_stock ON inventory_items(quantity_in_stock, minimum_stock)
    WHERE quantity_in_stock <= minimum_stock;

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_job ON invoices(job_id);

CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_events_invoice ON invoice_events(invoice_id);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_job ON inventory_transactions(job_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);

-- ============================================================================
-- ROW LEVEL SECURITY (Optional - enable when ready)
-- ============================================================================

-- ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoice_events ENABLE ROW LEVEL SECURITY;

-- Policies would go here when RLS is enabled
