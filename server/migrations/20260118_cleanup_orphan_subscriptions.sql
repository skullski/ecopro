-- Cleanup orphaned subscriptions that reference non-existent users
-- These can occur when clients are deleted but subscriptions remain

-- First, log what we're deleting
DO $$
DECLARE
  orphan_count INT;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM subscriptions s
  WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = s.user_id);
  
  RAISE NOTICE 'Found % orphaned subscriptions to delete', orphan_count;
END $$;

-- Delete orphaned subscriptions (those with user_id not in clients table)
DELETE FROM subscriptions
WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = subscriptions.user_id);

-- Also clean up any payments for non-existent users
DELETE FROM payments
WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = payments.user_id);
