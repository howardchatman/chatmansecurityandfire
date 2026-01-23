-- =============================================
-- Chatman Security and Fire - Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS / AUTH
-- =============================================

CREATE TABLE IF NOT EXISTS security_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer', 'technician')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LEADS
-- =============================================

CREATE TABLE IF NOT EXISTS security_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,
  preferred_contact TEXT DEFAULT 'email',
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CUSTOMERS
-- =============================================

CREATE TABLE IF NOT EXISTS security_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES security_users(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SERVICE TICKETS
-- =============================================

CREATE TABLE IF NOT EXISTS security_service_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES security_customers(id),
  property_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('emergency', 'urgent', 'normal', 'low')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID REFERENCES security_users(id),
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CHAT CONVERSATIONS
-- =============================================

CREATE TABLE IF NOT EXISTS security_chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES security_leads(id),
  customer_id UUID REFERENCES security_customers(id),
  session_id TEXT UNIQUE NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CALL LOGS
-- =============================================

CREATE TABLE IF NOT EXISTS security_call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES security_leads(id),
  customer_id UUID REFERENCES security_customers(id),
  caller_name TEXT,
  caller_phone TEXT,
  duration_seconds INTEGER,
  call_type TEXT CHECK (call_type IN ('inbound', 'outbound')),
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  summary TEXT,
  transcript JSONB,
  retell_call_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- QUOTES
-- =============================================

CREATE TABLE IF NOT EXISTS security_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number TEXT UNIQUE NOT NULL,
  quote_type TEXT NOT NULL,
  template_name TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired', 'paid')),
  customer JSONB NOT NULL,
  site JSONB NOT NULL,
  line_items JSONB NOT NULL,
  totals JSONB,
  terms JSONB,
  ai_narrative TEXT,
  expires_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- QUOTE PHOTOS
-- =============================================

CREATE TABLE IF NOT EXISTS security_quote_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES security_quotes(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SERVICE REQUESTS (from /start form)
-- =============================================

CREATE TABLE IF NOT EXISTS security_service_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT,
  property_address TEXT,
  deadline TEXT,
  issue TEXT,
  details TEXT,
  files_count INTEGER DEFAULT 0,
  source TEXT DEFAULT 'start_page',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'scheduled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_leads_status ON security_leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON security_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_status ON security_customers(status);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON security_service_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON security_service_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON security_quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_number ON security_quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_created ON security_quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON security_service_requests(status);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE security_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_quote_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_service_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access (for API routes)
-- These policies allow the service role key to bypass RLS

CREATE POLICY "Service role full access" ON security_users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON security_leads
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON security_customers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON security_service_tickets
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON security_chat_conversations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON security_call_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON security_quotes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON security_quote_photos
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access" ON security_service_requests
  FOR ALL USING (true) WITH CHECK (true);
