-- Migration: Add owner_name and owner_email to client_store_settings
ALTER TABLE client_store_settings
ADD COLUMN IF NOT EXISTS owner_name TEXT,
ADD COLUMN IF NOT EXISTS owner_email TEXT;
