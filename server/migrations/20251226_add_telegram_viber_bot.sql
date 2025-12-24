-- Add Telegram + Viber provider support for bot_settings
-- Note: Telegram/Viber require platform-specific recipient identifiers (not phone numbers).

ALTER TABLE bot_settings ADD COLUMN IF NOT EXISTS telegram_bot_token TEXT;
ALTER TABLE bot_settings ADD COLUMN IF NOT EXISTS telegram_delay_minutes INTEGER;

ALTER TABLE bot_settings ADD COLUMN IF NOT EXISTS viber_auth_token TEXT;
ALTER TABLE bot_settings ADD COLUMN IF NOT EXISTS viber_sender_name TEXT;
ALTER TABLE bot_settings ADD COLUMN IF NOT EXISTS viber_delay_minutes INTEGER;

-- Map customer phone -> platform recipient ids (optional; populated by future linking flow)
CREATE TABLE IF NOT EXISTS customer_messaging_ids (
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  telegram_chat_id TEXT,
  viber_user_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (client_id, customer_phone)
);

CREATE INDEX IF NOT EXISTS idx_customer_messaging_ids_client_phone ON customer_messaging_ids(client_id, customer_phone);
