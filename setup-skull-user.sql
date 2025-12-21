-- Add test user skull@gmail.com with plain text password: anaimad

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
  name = 'Skull User',
  role = 'user',
  user_type = 'client',
  is_verified = true,
  updated_at = NOW();

-- Verify user was created/updated
SELECT id, email, name, role, user_type FROM users WHERE email = 'skull@gmail.com';
