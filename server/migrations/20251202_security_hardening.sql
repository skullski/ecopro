-- Security hardening
-- 1) Ensure users.user_type has a default and is NOT NULL going forward
ALTER TABLE users ALTER COLUMN user_type SET DEFAULT 'client';
UPDATE users SET user_type = 'client' WHERE user_type IS NULL;
ALTER TABLE users ALTER COLUMN user_type SET NOT NULL;

-- 2) Create audit_logs table for admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  actor_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id INTEGER,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
