-- Reconcile staff password column naming
-- Some runtime code expects staff.password while the staff schema migration defines staff.password_hash.
-- This migration makes the schema tolerant and backfills values both ways.

ALTER TABLE IF EXISTS staff
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

ALTER TABLE IF EXISTS staff
  ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Backfill whichever column is missing
UPDATE staff
SET password_hash = password
WHERE password_hash IS NULL AND password IS NOT NULL;

UPDATE staff
SET password = password_hash
WHERE password IS NULL AND password_hash IS NOT NULL;
