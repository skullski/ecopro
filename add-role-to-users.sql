-- Migration: Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) NOT NULL DEFAULT 'vendor';

-- Optionally, update all existing users to vendor (or set as needed)
UPDATE users SET role = 'vendor' WHERE role IS NULL OR role = '';
