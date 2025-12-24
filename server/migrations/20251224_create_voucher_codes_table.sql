-- Migration: Create voucher_codes table for tracking unassigned codes and redemptions
-- This table replaces/complements the code_requests table with better tracking of redemptions

CREATE TABLE IF NOT EXISTS voucher_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,           -- the actual voucher code
    status VARCHAR(20) NOT NULL DEFAULT 'new',  -- 'new', 'expired', 'used'
    tier VARCHAR(20),                           -- 'bronze', 'silver', 'gold', etc.
    generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    generated_by INT NOT NULL,                  -- admin/seller ID who created it
    used_by INT,                                -- client/user ID who redeemed it
    order_id INT,                               -- optional link to order/subscription
    ip_address VARCHAR(45),                     -- IP address of redemption (audit logging)
    payment_method VARCHAR(50),                 -- how code was issued ('admin', 'chat', etc.)
    notes TEXT,                                 -- optional admin notes
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indices for faster queries
CREATE INDEX IF NOT EXISTS idx_voucher_codes_code ON voucher_codes(code);
CREATE INDEX IF NOT EXISTS idx_voucher_codes_status ON voucher_codes(status);
CREATE INDEX IF NOT EXISTS idx_voucher_codes_expires_at ON voucher_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_voucher_codes_used_by ON voucher_codes(used_by);
CREATE INDEX IF NOT EXISTS idx_voucher_codes_generated_by ON voucher_codes(generated_by);

-- Optional: Alter existing code_requests table to add tracking fields if it doesn't have them
ALTER TABLE code_requests 
ADD COLUMN IF NOT EXISTS used_by INT,
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
ADD COLUMN IF NOT EXISTS used_at TIMESTAMP;

-- Create trigger to auto-update used_at when status changes to 'used'
CREATE OR REPLACE FUNCTION update_code_used_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'used' AND OLD.status != 'used' THEN
        NEW.used_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_code_used_at ON voucher_codes;
CREATE TRIGGER tr_update_code_used_at
BEFORE UPDATE ON voucher_codes
FOR EACH ROW
EXECUTE FUNCTION update_code_used_at();

DROP TRIGGER IF EXISTS tr_update_code_used_at_requests ON code_requests;
CREATE TRIGGER tr_update_code_used_at_requests
BEFORE UPDATE ON code_requests
FOR EACH ROW
EXECUTE FUNCTION update_code_used_at();
