-- Admin Notes System
-- Allows admins to create, edit and delete internal notes

CREATE TABLE IF NOT EXISTS admin_notes (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  color VARCHAR(20) DEFAULT 'yellow', -- yellow, blue, green, red, purple
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_notes_admin_id ON admin_notes(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_pinned ON admin_notes(is_pinned DESC, updated_at DESC);
