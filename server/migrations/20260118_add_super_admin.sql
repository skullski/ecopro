-- Add is_super column to admins table to protect super admin accounts
-- Super admins cannot be blocked or deleted by anyone

ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_super BOOLEAN DEFAULT false;

-- Mark the first admin (sahla4eco.admin@gmail.com) as super admin
UPDATE admins SET is_super = true WHERE id = 1;

-- Also mark any admin with email containing 'admin' as super for safety
UPDATE admins SET is_super = true WHERE email ILIKE '%admin%' AND is_super = false;

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_admins_is_super ON admins(is_super);
