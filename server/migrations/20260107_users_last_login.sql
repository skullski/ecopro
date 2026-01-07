-- Add last_login tracking to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Create index for efficient active user queries
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
