-- Add updates_enabled and tracking_enabled columns for bot settings
ALTER TABLE bot_settings ADD COLUMN IF NOT EXISTS updates_enabled BOOLEAN DEFAULT false;
ALTER TABLE bot_settings ADD COLUMN IF NOT EXISTS tracking_enabled BOOLEAN DEFAULT false;
