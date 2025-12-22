-- Migration: Update code_requests table to allow unassigned codes and add tracking fields
-- Allow NULL client_id so codes can be generated without assigning to a specific user
-- Add ip_address tracking for audit logging

-- Update code_requests table constraints
ALTER TABLE code_requests
  ALTER COLUMN client_id DROP NOT NULL;

-- Add missing columns if they don't exist
ALTER TABLE code_requests
  ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
  ADD COLUMN IF NOT EXISTS generated_by INT REFERENCES admins(id) ON DELETE SET NULL;

-- Create indices for tracking
CREATE INDEX IF NOT EXISTS idx_code_requests_redeemed_by ON code_requests(redeemed_by_client_id);
CREATE INDEX IF NOT EXISTS idx_code_requests_generated_by ON code_requests(generated_by);
CREATE INDEX IF NOT EXISTS idx_code_requests_ip_address ON code_requests(ip_address);

-- Update code_statistics to track by both admin and general platform stats
ALTER TABLE code_statistics
  ADD COLUMN IF NOT EXISTS tier VARCHAR(20),
  ADD COLUMN IF NOT EXISTS redemption_rate DECIMAL(5,2);

-- Create audit log table for code activity
CREATE TABLE IF NOT EXISTS code_activity_log (
  id BIGSERIAL PRIMARY KEY,
  code_request_id BIGINT REFERENCES code_requests(id) ON DELETE CASCADE,
  action VARCHAR(50), -- 'generated', 'redeemed', 'expired', 'revoked'
  actor_id INT,
  actor_type VARCHAR(20), -- 'admin', 'client', 'system'
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_code_activity_log_action ON code_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_code_activity_log_code_id ON code_activity_log(code_request_id);
CREATE INDEX IF NOT EXISTS idx_code_activity_log_created_at ON code_activity_log(created_at DESC);

-- Summary view for code statistics
CREATE OR REPLACE VIEW code_stats_summary AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'issued') as codes_issued,
  COUNT(*) FILTER (WHERE status = 'used') as codes_redeemed,
  COUNT(*) FILTER (WHERE status = 'expired') as codes_expired,
  COUNT(DISTINCT code_tier) as tiers_used,
  COUNT(*) FILTER (WHERE redeemed_by_client_id IS NOT NULL) as total_redemptions,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'used') / NULLIF(COUNT(*), 0), 2) as redemption_rate_percent,
  MAX(created_at) as last_code_generated,
  MAX(redeemed_at) as last_code_redeemed
FROM code_requests;
