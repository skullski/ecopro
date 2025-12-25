-- Create scheduled_messages table for delayed order confirmation messages
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES store_orders(id) ON DELETE CASCADE,
  telegram_chat_id TEXT,
  viber_user_id TEXT,
  whatsapp_phone TEXT,
  message_content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'order_confirmation', -- order_confirmation, reminder, etc.
  scheduled_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed, cancelled
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for finding pending messages to process
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_pending ON scheduled_messages(status, scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_order ON scheduled_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_client ON scheduled_messages(client_id);
