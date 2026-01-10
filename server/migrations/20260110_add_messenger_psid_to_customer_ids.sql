-- Migration: Add Messenger PSID to customer_messaging_ids table
-- Date: 2026-01-10

-- Add messenger_psid column to existing customer_messaging_ids table
ALTER TABLE customer_messaging_ids 
ADD COLUMN IF NOT EXISTS messenger_psid TEXT;

-- Create index for quick Messenger PSID lookups
CREATE INDEX IF NOT EXISTS idx_customer_messaging_ids_messenger ON customer_messaging_ids(client_id, messenger_psid) 
WHERE messenger_psid IS NOT NULL;

-- Also add order_messenger_chats table to track per-order Messenger bindings (similar to order_telegram_chats)
CREATE TABLE IF NOT EXISTS order_messenger_chats (
    order_id INTEGER PRIMARY KEY REFERENCES store_orders(id) ON DELETE CASCADE,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    messenger_psid TEXT NOT NULL,
    page_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_messenger_chats_client_id ON order_messenger_chats(client_id);
CREATE INDEX IF NOT EXISTS idx_order_messenger_chats_psid ON order_messenger_chats(messenger_psid);

-- Create preconnect tokens for Messenger (similar to Telegram preconnect)
CREATE TABLE IF NOT EXISTS messenger_preconnect_tokens (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    customer_phone TEXT NOT NULL,
    ref_token TEXT NOT NULL UNIQUE,
    page_id TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
    used_at TIMESTAMP,
    UNIQUE(client_id, customer_phone)
);

CREATE INDEX IF NOT EXISTS idx_messenger_preconnect_tokens_ref ON messenger_preconnect_tokens(ref_token);

COMMENT ON TABLE order_messenger_chats IS 'Tracks per-order Messenger PSID bindings for order confirmations';
COMMENT ON TABLE messenger_preconnect_tokens IS 'Temporary tokens for customer pre-connection via Messenger ref param';
