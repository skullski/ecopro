-- Chat System Security Enhancements (DISABLED - tables don't exist yet)
-- Adds payment tracking, code validation, and rate limiting
-- This migration is skipped as the required tables haven't been created

/*
-- Add payment method to code_requests
ALTER TABLE code_requests ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
-- payment_method values: 'binance', 'redotpay', 'ccp', 'manual', etc.

-- Add payment confirmation timestamp
ALTER TABLE code_requests ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMP;

-- Add notes from seller (payment instructions, etc.)
ALTER TABLE code_requests ADD COLUMN IF NOT EXISTS seller_notes TEXT;

-- Add client notes (payment details, transaction ID, etc.)
ALTER TABLE code_requests ADD COLUMN IF NOT EXISTS client_notes TEXT;

-- Track code redemption
ALTER TABLE code_requests ADD COLUMN IF NOT EXISTS redeemed_at TIMESTAMP;
ALTER TABLE code_requests ADD COLUMN IF NOT EXISTS redeemed_by_client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL;

-- Add rate limiting table for brute force prevention
CREATE TABLE IF NOT EXISTS code_validation_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  user_type VARCHAR(20) NOT NULL, -- 'client' or 'seller'
  attempted_code VARCHAR(255),
  attempt_result VARCHAR(50), -- 'success', 'invalid', 'expired', 'already_used'
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (user_type IN ('client', 'seller'))
);

CREATE INDEX IF NOT EXISTS idx_code_validation_attempts_user ON code_validation_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_code_validation_attempts_created_at ON code_validation_attempts(created_at);

-- Track code usage statistics
CREATE TABLE IF NOT EXISTS code_statistics (
  id BIGSERIAL PRIMARY KEY,
  seller_id BIGINT NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  total_codes_generated INT DEFAULT 0,
  total_codes_redeemed INT DEFAULT 0,
  total_codes_expired INT DEFAULT 0,
  total_revenue_from_codes DECIMAL(10, 2) DEFAULT 0.00,
  payment_methods_used JSONB, -- {"binance": 5, "redotpay": 3, "ccp": 2}
  last_code_issued_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(seller_id)
);

CREATE INDEX IF NOT EXISTS idx_code_statistics_seller_id ON code_statistics(seller_id);

-- Update code_requests to track if code is still valid for redemption
ALTER TABLE code_requests ADD COLUMN IF NOT EXISTS is_redeemable BOOLEAN DEFAULT true;

-- Add expiry warning threshold
ALTER TABLE code_requests ADD COLUMN IF NOT EXISTS expiry_warning_sent_at TIMESTAMP;

-- Update chat_messages to add rate limiting metadata (only if table exists)
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
    ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS rate_limit_hits INT DEFAULT 0;
  END IF;
END $$;

-- Clean up old validation attempts monthly
CREATE OR REPLACE FUNCTION cleanup_old_validation_attempts() RETURNS void AS $$
BEGIN
  DELETE FROM code_validation_attempts
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_code_requests_expiry_date ON code_requests(expiry_date);
CREATE INDEX IF NOT EXISTS idx_code_requests_redeemed_at ON code_requests(redeemed_at);
CREATE INDEX IF NOT EXISTS idx_code_requests_payment_confirmed ON code_requests(payment_confirmed_at);
*/
