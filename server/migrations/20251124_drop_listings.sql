-- Drop legacy listings table
-- Idempotent drop for `listings` created during earlier marketplace work.
-- Ensure a DB backup exists before applying.

BEGIN;
  DROP TABLE IF EXISTS listings;
  -- Drop indices if present (no-op if not)
  -- DROP INDEX IF EXISTS idx_listings_category;
  -- DROP INDEX IF EXISTS idx_listings_price;
  -- DROP INDEX IF EXISTS idx_listings_location;
COMMIT;
