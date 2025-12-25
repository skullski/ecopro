-- Add auto_expire_hours column to bot_settings
ALTER TABLE bot_settings ADD COLUMN IF NOT EXISTS auto_expire_hours INTEGER DEFAULT 24;
