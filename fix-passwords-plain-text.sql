-- Update all users to have plain text passwords for easier testing
-- This is NOT recommended for production!

-- Update admin@ecopro.com to plain text: admin123
UPDATE users SET password = 'admin123' WHERE email = 'admin@ecopro.com';

-- Update or create skull@gmail.com with plain text: anaimad
INSERT INTO users (email, password, name, role, user_type, is_verified, created_at, updated_at)
VALUES (
  'skull@gmail.com',
  'anaimad',
  'Skull User',
  'user',
  'client',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = 'anaimad',
  updated_at = NOW();

-- Verify users
SELECT email, password FROM users WHERE email IN ('admin@ecopro.com', 'skull@gmail.com');
