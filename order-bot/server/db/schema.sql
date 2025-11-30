-- Order Confirmation Bot Database Schema

-- Clients table (previously "sellers")
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company_name VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP,
  language VARCHAR(10) DEFAULT 'en',
  -- Language preference: en, fr, ar
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buyers table (previously "clients" or "customers")
CREATE TABLE IF NOT EXISTS buyers (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(100) UNIQUE NOT NULL,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  buyer_id INTEGER NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Status: pending, approved, declined, changed
  confirmation_token VARCHAR(255) UNIQUE NOT NULL,
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  whatsapp_sent_at TIMESTAMP,
  sms_sent BOOLEAN DEFAULT FALSE,
  sms_sent_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  notes TEXT,
  internal_notes TEXT,
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  -- Payment status: unpaid, paid, partial
  payment_method VARCHAR(50),
  shipping_address TEXT,
  wilaya VARCHAR(100),
  commune VARCHAR(100),
  delivery_status VARCHAR(50) DEFAULT 'pending',
  -- Delivery: pending, processing, shipped, delivered, cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('pending', 'approved', 'declined', 'changed')),
  CHECK (payment_status IN ('unpaid', 'paid', 'partial')),
  CHECK (delivery_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))
);

-- Messages log table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  buyer_id INTEGER NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  message_type VARCHAR(20) NOT NULL,
  -- Type: whatsapp, sms
  recipient_phone VARCHAR(50) NOT NULL,
  message_content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Status: pending, sent, failed, delivered
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (message_type IN ('whatsapp', 'sms')),
  CHECK (status IN ('pending', 'sent', 'failed', 'delivered'))
);

-- Bot settings table (client customization)
CREATE TABLE IF NOT EXISTS bot_settings (
  id SERIAL PRIMARY KEY,
  client_id INTEGER UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Message Templates
  whatsapp_template TEXT NOT NULL DEFAULT 'Hello {buyer_name}! 👋\n\nYou have a new order from {company_name}:\n\n📦 Order #{order_number}\n🛍️ Product: {product_name}\n📊 Quantity: {quantity}\n💰 Total: {total_price} DZD\n\nPlease confirm your order by clicking the link below:\n{confirmation_link}\n\nThank you! 🙏',
  sms_template TEXT NOT NULL DEFAULT 'Hello {buyer_name}! Order #{order_number} - {product_name} x{quantity} = {total_price} DZD. Confirm: {confirmation_link} - {company_name}',
  
  -- Timing Settings (in minutes)
  whatsapp_delay INTEGER NOT NULL DEFAULT 120,  -- 2 hours
  sms_delay INTEGER NOT NULL DEFAULT 240,       -- 4 hours
  sms_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Branding
  company_name VARCHAR(255),
  support_phone VARCHAR(50),
  store_url TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_delivery_status ON orders(delivery_status);
CREATE INDEX idx_orders_confirmation_token ON orders(confirmation_token);
CREATE INDEX idx_buyers_client_id ON buyers(client_id);
CREATE INDEX idx_buyers_phone ON buyers(phone);
CREATE INDEX idx_messages_order_id ON messages(order_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_products_client_id ON products(client_id);
CREATE INDEX idx_products_category ON products(category);

-- Sample data for testing
INSERT INTO clients (name, email, password_hash, phone, company_name) VALUES
('John Doe', 'john@example.com', '$2b$10$abc123', '+213555123456', 'John\'s Store'),
('Alice Smith', 'alice@example.com', '$2b$10$def456', '+213555654321', 'Alice Fashion')
ON CONFLICT (email) DO NOTHING;
