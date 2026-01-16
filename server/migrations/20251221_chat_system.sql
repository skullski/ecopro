-- Chat System Migration
-- Secure messaging between clients and sellers

CREATE TABLE IF NOT EXISTS chats (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  seller_id BIGINT NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  store_id BIGINT REFERENCES client_store_settings(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active', -- active, archived, closed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(client_id, seller_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  chat_id BIGINT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id BIGINT NOT NULL, -- Can be client_id or seller_id
  sender_type VARCHAR(20) NOT NULL, -- 'client' or 'seller'
  message_content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'code_request', 'code_response', 'system'
  metadata JSONB, -- For storing code requests, responses, etc.
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CHECK (sender_type IN ('client', 'seller'))
);

CREATE TABLE IF NOT EXISTS code_requests (
  id BIGSERIAL PRIMARY KEY,
  chat_id BIGINT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  seller_id BIGINT NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  requested_code_type VARCHAR(100), -- e.g., 'discount', 'access', 'special'
  generated_code VARCHAR(255),
  expiry_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'issued', 'used', 'expired'
  created_at TIMESTAMP DEFAULT NOW(),
  issued_at TIMESTAMP,
  used_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chats_client_id ON chats(client_id);
CREATE INDEX IF NOT EXISTS idx_chats_seller_id ON chats(seller_id);
CREATE INDEX IF NOT EXISTS idx_chats_store_id ON chats(store_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON chat_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_code_requests_chat_id ON code_requests(chat_id);
CREATE INDEX IF NOT EXISTS idx_code_requests_client_id ON code_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_code_requests_status ON code_requests(status);

-- Add chat notification fields to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS unread_chat_count INTEGER DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_chat_message_at TIMESTAMP;

-- Add notification preferences to sellers
CREATE TABLE IF NOT EXISTS seller_notification_settings (
  id BIGSERIAL PRIMARY KEY,
  seller_id BIGINT NOT NULL UNIQUE REFERENCES sellers(id) ON DELETE CASCADE,
  chat_notifications_enabled BOOLEAN DEFAULT true,
  email_on_new_message BOOLEAN DEFAULT true,
  mute_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_notification_settings_seller_id ON seller_notification_settings(seller_id);
