-- Script to create and expire a test account for voucher code testing
-- Usage: This script helps set up a test scenario

-- Step 1: Create a test client account
-- Replace 'test@example.com' with desired email
INSERT INTO clients (email, password, name, user_type, role, is_verified, created_at, updated_at)
VALUES (
  'voucher-test@example.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5EQaYzDSjxupa', -- password: 'password'
  'Voucher Test User',
  'client',
  'user',
  true,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Step 2: Find the client ID (replace email as needed)
-- SELECT id FROM clients WHERE email = 'voucher-test@example.com';

-- Step 3: Set the subscription to expired (replace USER_ID)
-- First, get the user_id from the client
WITH client_user AS (
  SELECT id FROM clients WHERE email = 'voucher-test@example.com'
)
INSERT INTO subscriptions (user_id, status, trial_started_at, trial_ends_at, current_period_start, current_period_end, created_at, updated_at)
SELECT id, 'expired', NOW() - INTERVAL '40 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '40 days', NOW() - INTERVAL '10 days', NOW(), NOW()
FROM client_user
ON CONFLICT (user_id) DO UPDATE SET
  status = 'expired',
  current_period_end = NOW() - INTERVAL '1 day',
  updated_at = NOW();

-- Step 4: Lock the account due to subscription expiry
UPDATE clients
SET is_locked = true,
    locked_reason = 'Subscription expired. Please renew to continue.',
    locked_at = NOW(),
    locked_by_admin_id = NULL,
    updated_at = NOW()
WHERE email = 'voucher-test@example.com';

-- Step 5: Verify the setup
SELECT 
  c.id,
  c.email,
  c.name,
  c.is_locked,
  c.locked_reason,
  s.status,
  s.current_period_end,
  NOW() as current_time
FROM clients c
LEFT JOIN subscriptions s ON c.id = s.user_id
WHERE c.email = 'voucher-test@example.com';

-- ===================================================================
-- To reverse/cleanup (delete test account):
-- ===================================================================
-- DELETE FROM subscriptions WHERE user_id IN (SELECT id FROM clients WHERE email = 'voucher-test@example.com');
-- DELETE FROM clients WHERE email = 'voucher-test@example.com';
