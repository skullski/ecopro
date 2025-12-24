-- Add lock_type to support distinct payment vs critical locks
-- payment: user can login, UI paywall/blur overlay can block dashboard
-- critical: user cannot login

ALTER TABLE clients ADD COLUMN IF NOT EXISTS lock_type TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS lock_type TEXT;

-- Backfill existing locked accounts where lock_type is missing
UPDATE clients
SET lock_type = 'payment'
WHERE lock_type IS NULL
  AND COALESCE(is_locked, false) = true
  AND (
    locked_reason ILIKE '%subscription%'
    OR locked_reason ILIKE '%expired%'
    OR locked_reason ILIKE '%payment%'
    OR locked_reason ILIKE '%trial%'
    OR locked_reason ILIKE '%billing%'
  );

UPDATE clients
SET lock_type = 'critical'
WHERE lock_type IS NULL
  AND COALESCE(is_locked, false) = true;

UPDATE admins
SET lock_type = 'critical'
WHERE lock_type IS NULL
  AND COALESCE(is_locked, false) = true;
