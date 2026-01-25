-- Migration: Fix affiliate tables and remove legacy users table
-- Date: 2026-01-26
-- Description: 
--   1. The affiliate_referrals and affiliate_commissions tables had foreign keys 
--      referencing the 'users' table, but user data is stored in 'clients' table.
--      This caused referral records to fail being created during signup.
--   2. Other tables (admin_notes, affiliate_payouts) referenced 'users' for admin actions
--      but should reference 'admins' table.
--   3. The 'users' table was a legacy unused table - platform uses admins/clients/staff/affiliates.

-- ============================================================
-- FIX 1: affiliate_referrals and affiliate_commissions user_id -> clients
-- ============================================================

-- Fix affiliate_referrals foreign key (user_id = the referred client)
ALTER TABLE affiliate_referrals DROP CONSTRAINT IF EXISTS affiliate_referrals_user_id_fkey;
ALTER TABLE affiliate_referrals ADD CONSTRAINT affiliate_referrals_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Fix affiliate_commissions foreign key (user_id = the client who paid)
ALTER TABLE affiliate_commissions DROP CONSTRAINT IF EXISTS affiliate_commissions_user_id_fkey;
ALTER TABLE affiliate_commissions ADD CONSTRAINT affiliate_commissions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES clients(id) ON DELETE CASCADE;

-- ============================================================
-- FIX 2: Admin action columns -> admins table
-- ============================================================

-- Fix affiliate_commissions.paid_by -> admins (admin who marked commission as paid)
ALTER TABLE affiliate_commissions DROP CONSTRAINT IF EXISTS affiliate_commissions_paid_by_fkey;
ALTER TABLE affiliate_commissions ADD CONSTRAINT affiliate_commissions_paid_by_fkey 
    FOREIGN KEY (paid_by) REFERENCES admins(id) ON DELETE SET NULL;

-- Fix affiliate_payouts.paid_by -> admins (admin who processed the payout)
ALTER TABLE affiliate_payouts DROP CONSTRAINT IF EXISTS affiliate_payouts_paid_by_fkey;
ALTER TABLE affiliate_payouts ADD CONSTRAINT affiliate_payouts_paid_by_fkey 
    FOREIGN KEY (paid_by) REFERENCES admins(id) ON DELETE SET NULL;

-- Fix admin_notes.admin_id -> admins (admin who created the note)
ALTER TABLE admin_notes DROP CONSTRAINT IF EXISTS admin_notes_admin_id_fkey;
ALTER TABLE admin_notes ALTER COLUMN admin_id TYPE bigint;
ALTER TABLE admin_notes ADD CONSTRAINT admin_notes_admin_id_fkey 
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE;

-- ============================================================
-- FIX 3: Create missing referral records
-- ============================================================

-- Create any missing referral records for clients that have affiliate data but no referral record
INSERT INTO affiliate_referrals (affiliate_id, user_id, voucher_code_used, discount_applied, created_at)
SELECT 
    c.referred_by_affiliate_id,
    c.id,
    c.referral_voucher_code,
    COALESCE(a.discount_percent, 20),
    c.created_at
FROM clients c
LEFT JOIN affiliates a ON a.id = c.referred_by_affiliate_id
WHERE c.referred_by_affiliate_id IS NOT NULL
    AND c.referral_voucher_code IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM affiliate_referrals ar WHERE ar.user_id = c.id
    )
ON CONFLICT (user_id) DO NOTHING;

-- Update affiliate referral counts to match actual records
UPDATE affiliates a
SET total_referrals = (
    SELECT COUNT(*) FROM affiliate_referrals WHERE affiliate_id = a.id
),
updated_at = NOW();

-- ============================================================
-- FIX 4: Drop legacy users table
-- ============================================================

-- The users table was created in initial schema but never used.
-- Platform uses separate tables: admins, clients, staff, affiliates
DROP TABLE IF EXISTS users CASCADE;
