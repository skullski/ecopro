-- Affiliate/Influencer Marketing System
-- Tracks affiliate referrals, voucher codes, and commission earnings

-- Affiliates table: stores influencer accounts
CREATE TABLE IF NOT EXISTS affiliates (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  voucher_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'AHMED20'
  discount_percent DECIMAL(5, 2) DEFAULT 20.00, -- discount given to referred users (first month only)
  commission_percent DECIMAL(5, 2) DEFAULT 50.00, -- commission on platform revenue (first 2 months)
  commission_months INT DEFAULT 2, -- how many months affiliate earns commission
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'disabled', 'suspended'
  notes TEXT, -- admin notes about the affiliate
  total_referrals INT DEFAULT 0, -- cached count
  total_paid_referrals INT DEFAULT 0, -- cached count of referrals who paid
  total_commission_earned DECIMAL(12, 2) DEFAULT 0.00, -- cached total
  total_commission_paid DECIMAL(12, 2) DEFAULT 0.00, -- cached total paid out
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate referrals: links users to the affiliate who referred them
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id BIGSERIAL PRIMARY KEY,
  affiliate_id BIGINT NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voucher_code_used VARCHAR(50) NOT NULL, -- the code they used at signup
  discount_applied DECIMAL(10, 2) DEFAULT 0.00, -- discount amount applied
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id) -- each user can only be referred by one affiliate
);

-- Affiliate commissions: tracks each commission payment
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id BIGSERIAL PRIMARY KEY,
  affiliate_id BIGINT NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  referral_id BIGINT NOT NULL REFERENCES affiliate_referrals(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_id BIGINT REFERENCES payments(id) ON DELETE SET NULL, -- the user's subscription payment
  payment_month INT NOT NULL, -- 1 = first month, 2 = second month
  user_paid_amount DECIMAL(10, 2) NOT NULL, -- what the user paid
  platform_revenue DECIMAL(10, 2) NOT NULL, -- platform revenue after discount
  commission_percent DECIMAL(5, 2) NOT NULL, -- commission % at time of calculation
  commission_amount DECIMAL(10, 2) NOT NULL, -- actual commission earned
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'cancelled'
  paid_at TIMESTAMP,
  paid_by BIGINT REFERENCES users(id), -- admin who marked as paid
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate payouts: tracks bulk payout records (optional, for record-keeping)
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id BIGSERIAL PRIMARY KEY,
  affiliate_id BIGINT NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(100), -- 'bank_transfer', 'cash', 'ccp', etc.
  reference VARCHAR(255), -- payment reference/receipt number
  notes TEXT,
  paid_by BIGINT REFERENCES users(id), -- admin who processed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliates_voucher_code ON affiliates(voucher_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_email ON affiliates(email);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_user_id ON affiliate_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_status ON affiliate_commissions(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_user_id ON affiliate_commissions(user_id);

-- Add referred_by_affiliate_id to users table for quick lookups
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_affiliate_id BIGINT REFERENCES affiliates(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_voucher_code VARCHAR(50);

-- Also add to clients table for consistency
ALTER TABLE clients ADD COLUMN IF NOT EXISTS referred_by_affiliate_id BIGINT REFERENCES affiliates(id) ON DELETE SET NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS referral_voucher_code VARCHAR(50);

-- Index for finding users by affiliate
CREATE INDEX IF NOT EXISTS idx_users_referred_by_affiliate ON users(referred_by_affiliate_id);
CREATE INDEX IF NOT EXISTS idx_clients_referred_by_affiliate ON clients(referred_by_affiliate_id);
