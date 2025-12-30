-- Migration: Add admin 2FA (TOTP) fields
-- Date: 2025-12-26

ALTER TABLE admins ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT false;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS totp_secret_encrypted TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS totp_pending_secret_encrypted TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS totp_backup_codes_hashes TEXT[];
ALTER TABLE admins ADD COLUMN IF NOT EXISTS totp_enrolled_at TIMESTAMP;

SELECT 'admins 2FA columns ensured' AS status;
