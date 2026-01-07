-- Migration: Add Facebook Messenger support to bot_settings
-- Date: 2026-01-06

-- Add Messenger columns to bot_settings
ALTER TABLE bot_settings 
ADD COLUMN IF NOT EXISTS messenger_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fb_page_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS fb_page_access_token TEXT,
ADD COLUMN IF NOT EXISTS messenger_delay_minutes INTEGER DEFAULT 5;

-- Create index for page lookups
CREATE INDEX IF NOT EXISTS idx_bot_settings_fb_page_id ON bot_settings(fb_page_id) WHERE fb_page_id IS NOT NULL;

-- Create messenger_subscribers table to track customers who interact via Messenger
CREATE TABLE IF NOT EXISTS messenger_subscribers (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    psid VARCHAR(255) NOT NULL, -- Page-Scoped ID from Facebook
    page_id VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    subscribed_at TIMESTAMP DEFAULT NOW(),
    last_interaction TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(client_id, psid)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_messenger_subscribers_psid ON messenger_subscribers(psid);
CREATE INDEX IF NOT EXISTS idx_messenger_subscribers_client ON messenger_subscribers(client_id);

-- Add 'messenger' to message_type enum in bot_messages (if table exists and supports it)
-- Note: This depends on your actual bot_messages table structure
-- If using text/varchar type, no change needed as 'messenger' is just a new value

COMMENT ON COLUMN bot_settings.messenger_enabled IS 'Whether Facebook Messenger notifications are enabled';
COMMENT ON COLUMN bot_settings.fb_page_id IS 'Facebook Page ID for Messenger';
COMMENT ON COLUMN bot_settings.fb_page_access_token IS 'Page Access Token from Facebook (long-lived)';
COMMENT ON COLUMN bot_settings.messenger_delay_minutes IS 'Minutes to wait before sending Messenger notification';
