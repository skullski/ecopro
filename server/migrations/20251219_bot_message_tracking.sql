-- Track bot messages sent to customers for orders
CREATE TABLE IF NOT EXISTS bot_messages (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  message_type VARCHAR(50) NOT NULL, -- 'whatsapp' or 'sms'
  message_content TEXT,
  confirmation_link TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'delivered'
  send_at TIMESTAMP, -- When the message should be sent
  sent_at TIMESTAMP, -- When it was actually sent
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES store_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Track order confirmations from customers
CREATE TABLE IF NOT EXISTS order_confirmations (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  response_type VARCHAR(50), -- 'approved', 'declined', 'changed'
  confirmed_via VARCHAR(50), -- 'whatsapp' or 'sms'
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES store_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Track confirmation link accesses
CREATE TABLE IF NOT EXISTS confirmation_links (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  link_token VARCHAR(100) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL, -- 48 hours from creation
  accessed_at TIMESTAMP,
  accessed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES store_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bot_messages_order_id ON bot_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_bot_messages_client_id ON bot_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_bot_messages_status ON bot_messages(status);
CREATE INDEX IF NOT EXISTS idx_bot_messages_send_at ON bot_messages(send_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_order_confirmations_order_id ON order_confirmations(order_id);
CREATE INDEX IF NOT EXISTS idx_confirmation_links_token ON confirmation_links(link_token);
CREATE INDEX IF NOT EXISTS idx_confirmation_links_expires ON confirmation_links(expires_at) WHERE accessed_at IS NULL;
