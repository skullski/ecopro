-- Migration: Remove is_paid_client from users table
ALTER TABLE users DROP COLUMN IF EXISTS is_paid_client;