-- Phase 3: Checkout Sessions and Payment Enhancements
-- Adds checkout session tracking for RedotPay integration

-- Create checkout_sessions table if not exists
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  subscription_id BIGINT REFERENCES subscriptions(id) ON DELETE SET NULL,
  redotpay_session_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'expired', 'cancelled'
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'DZD',
  metadata JSONB, -- Store custom data like user_id, subscription_id, renewal_type
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_checkout_status CHECK (status IN ('pending', 'completed', 'expired', 'cancelled'))
);

-- Create indexes for checkout_sessions
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user_id ON checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_session_token ON checkout_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_redotpay_id ON checkout_sessions(redotpay_session_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_status ON checkout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_expires_at ON checkout_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_created_at ON checkout_sessions(created_at);

-- Enhance payments table with additional RedotPay fields
-- These fields should be added if they don't exist already
ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider_response JSONB;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS checkout_session_id BIGINT REFERENCES checkout_sessions(id) ON DELETE SET NULL;

-- Add indexes for payment analysis
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at);

-- Add column to track subscription auto-renewal attempts
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS last_renewal_attempt_at TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS next_auto_renewal_at TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS renewal_failed_count INT DEFAULT 0;

-- Add indexes for subscription analysis
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_renewal ON subscriptions(next_auto_renewal_at);

-- Create a transactions log table for detailed audit trail
CREATE TABLE IF NOT EXISTS payment_transactions (
  id BIGSERIAL PRIMARY KEY,
  payment_id BIGINT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL, -- 'charge', 'refund', 'retry', 'chargeback'
  status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed'
  provider_transaction_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  error_code VARCHAR(100),
  error_message TEXT,
  raw_response JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for payment transaction tracking
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON payment_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_type ON payment_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);
