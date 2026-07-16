-- Migration: Bid opportunities (RFQ finder agent)
-- Stores procurement opportunities pulled from public sources (SAM.gov etc.),
-- AI-scored for fit against our service lines, tracked through a bid pipeline.

CREATE TABLE IF NOT EXISTS bid_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,             -- sam_gov, esbd, manual...
    external_id TEXT,                 -- id at the source, for dedupe
    title TEXT NOT NULL,
    agency TEXT,
    description TEXT,
    naics_code TEXT,
    location TEXT,
    posted_date DATE,
    due_date DATE,
    url TEXT,
    fit_score INT,                    -- 0-100 AI fit vs our services
    fit_reason TEXT,                  -- one-line AI explanation
    service_match TEXT,               -- fire_alarm, fire_sprinkler, fiber_optics, wireless, security, multi
    status TEXT NOT NULL DEFAULT 'new', -- new, reviewing, bidding, submitted, won, lost, skipped
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (source, external_id)
);

CREATE INDEX IF NOT EXISTS idx_bids_status ON bid_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_bids_due ON bid_opportunities(due_date);
CREATE INDEX IF NOT EXISTS idx_bids_fit ON bid_opportunities(fit_score DESC);
