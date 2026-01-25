-- Retell Voice Agent Integration Tables
-- Run this migration to set up leads, calls, and call_events tables

-- ============================================
-- LEADS TABLE
-- Stores contact information for leads captured via Retell
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  phone TEXT,
  email TEXT,
  company TEXT,
  property_address TEXT,
  source TEXT DEFAULT 'retell',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for phone lookups (most common)
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- ============================================
-- CALLS TABLE
-- Stores call records from Retell voice agent
-- ============================================
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retell_call_id TEXT UNIQUE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  from_number TEXT,
  to_number TEXT,
  status TEXT DEFAULT 'started', -- started|in_progress|ended|failed
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  summary TEXT,
  transcript TEXT,
  urgency TEXT DEFAULT 'normal', -- high|normal|low
  intent TEXT, -- inspection|service|quote|callback|other
  sentiment TEXT, -- positive|neutral|negative
  callback_requested BOOLEAN DEFAULT FALSE,
  transfer_requested BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_calls_retell_call_id ON calls(retell_call_id);
CREATE INDEX IF NOT EXISTS idx_calls_lead_id ON calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_urgency ON calls(urgency);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at DESC);

-- ============================================
-- CALL EVENTS TABLE
-- Stores granular events during calls for debugging and analytics
-- ============================================
CREATE TABLE IF NOT EXISTS call_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- call_started|extraction|callback_requested|transfer_requested|call_ended|error|agent_response
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for call event lookups
CREATE INDEX IF NOT EXISTS idx_call_events_call_id ON call_events(call_id);
CREATE INDEX IF NOT EXISTS idx_call_events_event_type ON call_events(event_type);
CREATE INDEX IF NOT EXISTS idx_call_events_created_at ON call_events(created_at DESC);

-- ============================================
-- SCHEDULED CALLBACKS TABLE
-- Stores callback requests for follow-up
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_callbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending', -- pending|completed|failed|cancelled
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_callbacks_status ON scheduled_callbacks(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_callbacks_scheduled_for ON scheduled_callbacks(scheduled_for);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically updates updated_at on row changes
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to leads table
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to calls table
DROP TRIGGER IF EXISTS update_calls_updated_at ON calls;
CREATE TRIGGER update_calls_updated_at
  BEFORE UPDATE ON calls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (Optional - enable if needed)
-- ============================================
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE call_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE scheduled_callbacks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE leads IS 'Contact information for leads captured via Retell voice agent';
COMMENT ON TABLE calls IS 'Call records from Retell voice agent sessions';
COMMENT ON TABLE call_events IS 'Granular events during Retell calls for debugging and analytics';
COMMENT ON TABLE scheduled_callbacks IS 'Callback requests scheduled for follow-up';

COMMENT ON COLUMN calls.urgency IS 'high = fire marshal, failed inspection, red tag keywords detected';
COMMENT ON COLUMN calls.intent IS 'Detected intent: inspection, service, quote, callback, other';
COMMENT ON COLUMN calls.metadata IS 'Raw extracted variables and additional data from Retell';
