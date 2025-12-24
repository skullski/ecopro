-- Add Telegram bot username + webhook secret + greeting template
-- Required for Telegram deep-linking and webhook authentication

ALTER TABLE bot_settings
  ADD COLUMN IF NOT EXISTS telegram_bot_username TEXT,
  ADD COLUMN IF NOT EXISTS telegram_webhook_secret TEXT,
  ADD COLUMN IF NOT EXISTS template_greeting TEXT;

-- Store per-order chat binding (Telegram user <-> order)
CREATE TABLE IF NOT EXISTS order_telegram_chats (
  order_id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL,
  telegram_chat_id TEXT NOT NULL,
  telegram_user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_telegram_chats_client_id ON order_telegram_chats(client_id);
CREATE INDEX IF NOT EXISTS idx_order_telegram_chats_chat_id ON order_telegram_chats(telegram_chat_id);

-- Store per-order start token for deep-linking (t.me/<bot>?start=<token>)
-- Token must be 1-64 chars, allowed by Telegram: A-Z a-z 0-9 _ -
CREATE TABLE IF NOT EXISTS order_telegram_links (
  start_token TEXT PRIMARY KEY,
  order_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (order_id) REFERENCES store_orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_order_telegram_links_order_id ON order_telegram_links(order_id);
CREATE INDEX IF NOT EXISTS idx_order_telegram_links_client_id ON order_telegram_links(client_id);
