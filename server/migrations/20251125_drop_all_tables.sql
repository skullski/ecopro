-- Drop and recreate the public schema (irreversible)
-- Run this file with psql against your DATABASE_URL:
-- psql "$DATABASE_URL" -f server/migrations/20251125_drop_all_tables.sql

BEGIN;
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
COMMIT;
