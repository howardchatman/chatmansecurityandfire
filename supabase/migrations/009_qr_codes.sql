-- ============================================================================
-- Dynamic QR Code System for Chatman Security & Fire
-- Migration: 009_qr_codes.sql
-- ============================================================================

-- QR Codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  destination_url TEXT NOT NULL,
  label TEXT NOT NULL,
  qr_type TEXT NOT NULL DEFAULT 'marketing'
    CHECK (qr_type IN ('marketing', 'portal', 'proposal', 'custom')),
  proposal_id UUID REFERENCES proposal_history(id) ON DELETE SET NULL,
  scan_count INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_codes_slug ON qr_codes(slug);
CREATE INDEX IF NOT EXISTS idx_qr_codes_qr_type ON qr_codes(qr_type);

-- QR Scans table (individual scan log for analytics)
CREATE TABLE IF NOT EXISTS qr_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_qr_scans_qr_code_id ON qr_scans(qr_code_id);

-- Add public sharing columns to proposal_history
ALTER TABLE proposal_history ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;
ALTER TABLE proposal_history ADD COLUMN IF NOT EXISTS proposal_data JSONB;

-- Seed default QR codes
INSERT INTO qr_codes (slug, destination_url, label, qr_type) VALUES
  ('marketing', 'https://chatmansecurityandfire.com/start', 'Marketing - Get Started', 'marketing'),
  ('portal', 'https://chatmansecurityandfire.com/portal/dashboard', 'Customer Portal', 'portal'),
  ('contact', 'https://chatmansecurityandfire.com/contact', 'Contact Us', 'marketing')
ON CONFLICT (slug) DO NOTHING;
