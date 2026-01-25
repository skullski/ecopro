-- Add discount_months to affiliates table
-- This allows affiliates to give users discounts for multiple months (not just the first)

-- Add discount_months column (defaults to 1 for backward compatibility)
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS discount_months INT DEFAULT 1;

-- Update comment
COMMENT ON COLUMN affiliates.discount_months IS 'Number of months the referred user gets a discount (default 1)';
COMMENT ON COLUMN affiliates.discount_percent IS 'Discount percentage given to referred users for the first N months (see discount_months)';

-- Add discount_months_used to track how many months of discount have been used
ALTER TABLE affiliate_referrals ADD COLUMN IF NOT EXISTS discount_months_used INT DEFAULT 0;

COMMENT ON COLUMN affiliate_referrals.discount_months_used IS 'Number of months the user has already used their discount';
