-- Migration: Rehash all passwords from bcrypt to argon2id
-- This migration will be handled by the Node.js script after deployment
-- 
-- WARNING: Do NOT run this SQL directly. The password rehashing must be done
-- in Node.js using the hashPassword() function from server/utils/auth.ts
--
-- Instead, run: npm run migrate:rehash-passwords
-- 
-- This ensures all bcrypt hashes are securely converted to argon2id

-- The actual rehashing will be done by:
-- server/scripts/rehash-passwords.ts

-- For reference, the migration will:
-- 1. Load all users with bcrypt hashes
-- 2. Verify each password using bcrypt
-- 3. Rehash using argon2id
-- 4. Update password_hash column with new argon2id hash

-- No database schema changes needed - only data transformation
