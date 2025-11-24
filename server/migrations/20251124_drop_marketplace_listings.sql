-- Drop legacy marketplace listings table
-- This migration is idempotent and will remove the legacy `marketplace_listings` table
-- created by earlier development. We keep historical create migrations for audit
-- purposes; this migration removes the runtime table so production DB no longer
-- contains marketplace data. Ensure you have backups before applying.

BEGIN;
  -- Remove legacy marketplace table if present
  DROP TABLE IF EXISTS marketplace_listings;

  -- If there were any sequences or indices specific to the legacy table, drop them here
  -- (no-op if they don't exist)
  -- DROP SEQUENCE IF EXISTS marketplace_listings_id_seq;
COMMIT;
