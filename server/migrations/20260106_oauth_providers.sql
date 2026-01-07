-- Add OAuth provider columns to users table
-- Migration: 20260106_oauth_providers.sql

-- Add Google ID column
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Add Facebook ID column (for future use)
ALTER TABLE users ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255) UNIQUE;

-- Add avatar URL column
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index for OAuth lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_facebook_id ON users(facebook_id) WHERE facebook_id IS NOT NULL;
