-- Customer Portal: Magic Links, Quote Acceptance, Payments
-- Migration: 005_customer_portal.sql

-- ============================================================================
-- CUSTOMER LINKS TABLE
-- Tokenized secure links for customer access (magic links)
-- ============================================================================
CREATE TABLE IF NOT EXISTS customer_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Link token (URL-safe, cryptographically random)
    token TEXT NOT NULL UNIQUE,

    -- Link can be associated with quote, job, or both
    quote_id UUID REFERENCES security_quotes(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,

    -- Customer info (denormalized for convenience)
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,

    -- Link permissions/type
    link_type TEXT NOT NULL DEFAULT 'quote_approval' CHECK (
        link_type IN ('quote_approval', 'job_status', 'payment', 'document_access', 'full_access')
    ),

    -- Expiration and usage
    expires_at TIMESTAMPTZ,
    max_uses INTEGER DEFAULT NULL, -- NULL = unlimited
    use_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,

    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'expired', 'revoked', 'used')
    ),
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES profiles(id),
    revoke_reason TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    team_id UUID REFERENCES teams(id),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for customer_links
CREATE INDEX idx_customer_links_token ON customer_links(token);
CREATE INDEX idx_customer_links_quote_id ON customer_links(quote_id);
CREATE INDEX idx_customer_links_job_id ON customer_links(job_id);
CREATE INDEX idx_customer_links_email ON customer_links(customer_email);
CREATE INDEX idx_customer_links_status ON customer_links(status);
CREATE INDEX idx_customer_links_expires_at ON customer_links(expires_at);

-- ============================================================================
-- QUOTE ACCEPTANCES TABLE
-- Records when customers approve/accept quotes
-- ============================================================================
CREATE TABLE IF NOT EXISTS quote_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    quote_id UUID NOT NULL REFERENCES security_quotes(id) ON DELETE CASCADE,
    customer_link_id UUID REFERENCES customer_links(id),

    -- Acceptance details
    accepted_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_by_name TEXT NOT NULL,
    accepted_by_email TEXT NOT NULL,
    accepted_by_ip TEXT,

    -- Digital signature (typed name or e-signature data)
    signature_type TEXT NOT NULL DEFAULT 'typed' CHECK (
        signature_type IN ('typed', 'drawn', 'checkbox')
    ),
    signature_data TEXT, -- Typed name or base64 signature image

    -- Terms acceptance
    terms_accepted BOOLEAN DEFAULT true,
    terms_version TEXT DEFAULT '1.0',

    -- Payment intent at acceptance
    payment_option TEXT CHECK (
        payment_option IN ('pay_now', 'pay_deposit', 'pay_later', 'financing')
    ),
    deposit_amount DECIMAL(10,2),

    -- Metadata
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for quote_acceptances
CREATE INDEX idx_quote_acceptances_quote_id ON quote_acceptances(quote_id);
CREATE INDEX idx_quote_acceptances_accepted_at ON quote_acceptances(accepted_at);
CREATE INDEX idx_quote_acceptances_email ON quote_acceptances(accepted_by_email);

-- ============================================================================
-- PAYMENTS TABLE
-- Records all payment transactions (Stripe-integrated)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Related records
    quote_id UUID REFERENCES security_quotes(id),
    job_id UUID REFERENCES jobs(id),
    customer_link_id UUID REFERENCES customer_links(id),
    quote_acceptance_id UUID REFERENCES quote_acceptances(id),

    -- Stripe data
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_checkout_session_id TEXT,
    stripe_charge_id TEXT,
    stripe_customer_id TEXT,
    stripe_invoice_id TEXT,

    -- Payment details
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    payment_type TEXT NOT NULL CHECK (
        payment_type IN ('deposit', 'partial', 'full', 'balance', 'refund')
    ),
    payment_method TEXT, -- card, ach, check, cash, etc.

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded', 'cancelled')
    ),

    -- Customer info
    customer_email TEXT,
    customer_name TEXT,

    -- Timestamps
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,

    -- Failure/refund details
    failure_reason TEXT,
    refund_reason TEXT,
    refund_amount DECIMAL(10,2),

    -- Receipt
    receipt_url TEXT,
    receipt_number TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    team_id UUID REFERENCES teams(id)
);

-- Indexes for payments
CREATE INDEX idx_payments_quote_id ON payments(quote_id);
CREATE INDEX idx_payments_job_id ON payments(job_id);
CREATE INDEX idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_stripe_checkout ON payments(stripe_checkout_session_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_customer_email ON payments(customer_email);

-- ============================================================================
-- CUSTOMER LINK ACCESS LOG
-- Tracks every time a customer link is accessed
-- ============================================================================
CREATE TABLE IF NOT EXISTS customer_link_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_link_id UUID NOT NULL REFERENCES customer_links(id) ON DELETE CASCADE,

    accessed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    action TEXT, -- 'view', 'approve', 'pay', 'download', etc.

    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_link_access_log_link_id ON customer_link_access_log(customer_link_id);
CREATE INDEX idx_link_access_log_accessed_at ON customer_link_access_log(accessed_at);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to generate secure random token
CREATE OR REPLACE FUNCTION generate_customer_link_token()
RETURNS TEXT AS $$
DECLARE
    token TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generate a URL-safe random token (32 bytes = 43 chars base64)
        token := encode(gen_random_bytes(32), 'base64');
        -- Make URL-safe: replace + with -, / with _, remove =
        token := replace(replace(replace(token, '+', '-'), '/', '_'), '=', '');

        -- Check if token already exists
        SELECT EXISTS(SELECT 1 FROM customer_links WHERE customer_links.token = token) INTO exists_check;

        IF NOT exists_check THEN
            RETURN token;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a link is valid
CREATE OR REPLACE FUNCTION is_customer_link_valid(link_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    link_record customer_links%ROWTYPE;
BEGIN
    SELECT * INTO link_record FROM customer_links WHERE token = link_token;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Check status
    IF link_record.status != 'active' THEN
        RETURN FALSE;
    END IF;

    -- Check expiration
    IF link_record.expires_at IS NOT NULL AND link_record.expires_at < NOW() THEN
        -- Auto-expire the link
        UPDATE customer_links SET status = 'expired' WHERE id = link_record.id;
        RETURN FALSE;
    END IF;

    -- Check max uses
    IF link_record.max_uses IS NOT NULL AND link_record.use_count >= link_record.max_uses THEN
        UPDATE customer_links SET status = 'used' WHERE id = link_record.id;
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to record link access and increment counter
CREATE OR REPLACE FUNCTION record_customer_link_access(
    link_token TEXT,
    access_ip TEXT DEFAULT NULL,
    access_user_agent TEXT DEFAULT NULL,
    access_action TEXT DEFAULT 'view'
)
RETURNS UUID AS $$
DECLARE
    link_id UUID;
    log_id UUID;
BEGIN
    -- Get link ID
    SELECT id INTO link_id FROM customer_links WHERE token = link_token;

    IF link_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Update link access info
    UPDATE customer_links
    SET
        use_count = use_count + 1,
        last_accessed_at = NOW()
    WHERE id = link_id;

    -- Create access log entry
    INSERT INTO customer_link_access_log (
        customer_link_id, ip_address, user_agent, action
    ) VALUES (
        link_id, access_ip, access_user_agent, access_action
    ) RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at on payments
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payments_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE customer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_link_access_log ENABLE ROW LEVEL SECURITY;

-- Customer Links: Admin/Manager can manage, anyone can read by token (handled in API)
CREATE POLICY "Admin and manager can manage customer links"
    ON customer_links FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'manager')
        )
    );

-- Quote Acceptances: Admin/Manager can view
CREATE POLICY "Admin and manager can view quote acceptances"
    ON quote_acceptances FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'manager')
        )
    );

-- Allow inserts from service role (API will handle public submissions)
CREATE POLICY "Service role can insert quote acceptances"
    ON quote_acceptances FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Payments: Admin/Manager can view
CREATE POLICY "Admin and manager can view payments"
    ON payments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'manager')
        )
    );

-- Allow inserts/updates from service role
CREATE POLICY "Service role can manage payments"
    ON payments FOR ALL
    TO authenticated
    WITH CHECK (true);

-- Access logs: Admin can view
CREATE POLICY "Admin can view access logs"
    ON customer_link_access_log FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================================================
-- UPDATE SECURITY_QUOTES TABLE
-- Add fields for customer portal integration
-- ============================================================================
ALTER TABLE security_quotes
    ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS accepted_by TEXT,
    ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS balance_due DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (
        payment_status IN ('unpaid', 'deposit_paid', 'partial', 'paid', 'refunded')
    );

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE customer_links IS 'Tokenized magic links for customer portal access';
COMMENT ON TABLE quote_acceptances IS 'Records of customer quote approvals with digital signatures';
COMMENT ON TABLE payments IS 'Payment transactions integrated with Stripe';
COMMENT ON TABLE customer_link_access_log IS 'Audit log of customer link access';

COMMENT ON FUNCTION generate_customer_link_token() IS 'Generates URL-safe random token for customer links';
COMMENT ON FUNCTION is_customer_link_valid(TEXT) IS 'Checks if a customer link is valid (not expired/revoked/used)';
COMMENT ON FUNCTION record_customer_link_access(TEXT, TEXT, TEXT, TEXT) IS 'Records access to a customer link and increments counter';
