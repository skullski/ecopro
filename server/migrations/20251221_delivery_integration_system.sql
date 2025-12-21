-- Delivery Integration System
-- Adds tables and fields for managing order deliveries through Algerian couriers

-- Create delivery_companies table
CREATE TABLE IF NOT EXISTS delivery_companies (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  api_url VARCHAR(500) NOT NULL,
  api_key_encrypted VARCHAR(500),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  features JSONB NOT NULL DEFAULT '{}', -- {"supports_cod": true, "supports_tracking": true, "supports_labels": true}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_companies_name ON delivery_companies(name);
CREATE INDEX IF NOT EXISTS idx_delivery_companies_active ON delivery_companies(is_active);

-- Add delivery-related fields to store_orders (previously client_store_orders or similar)
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS delivery_company_id BIGINT REFERENCES delivery_companies(id) ON DELETE SET NULL;
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255);
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(50) DEFAULT 'pending'; -- pending, assigned, in_transit, delivered, failed
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS shipping_label_url VARCHAR(500);
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS label_generated_at TIMESTAMP;
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS cod_amount DECIMAL(10, 2); -- Cash on delivery amount
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS cod_settlement_status VARCHAR(50); -- pending, settled, failed
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS courier_response JSONB; -- Full response from courier API

-- Create delivery_labels table for tracking label generation
CREATE TABLE IF NOT EXISTS delivery_labels (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  delivery_company_id BIGINT NOT NULL REFERENCES delivery_companies(id) ON DELETE CASCADE,
  tracking_number VARCHAR(255) NOT NULL UNIQUE,
  label_url VARCHAR(500),
  label_data BYTEA, -- Binary PDF or image data
  label_format VARCHAR(50) DEFAULT 'pdf', -- pdf, png, jpg, etc
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_labels_order_id ON delivery_labels(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_labels_client_id ON delivery_labels(client_id);
CREATE INDEX IF NOT EXISTS idx_delivery_labels_tracking_number ON delivery_labels(tracking_number);
CREATE INDEX IF NOT EXISTS idx_delivery_labels_delivery_company_id ON delivery_labels(delivery_company_id);

-- Create delivery_events table for tracking status updates and webhooks
CREATE TABLE IF NOT EXISTS delivery_events (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  delivery_company_id BIGINT NOT NULL REFERENCES delivery_companies(id) ON DELETE CASCADE,
  tracking_number VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL, -- pickup, in_transit, out_for_delivery, delivered, failed, returned
  event_status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed'
  description TEXT,
  location VARCHAR(500),
  courier_timestamp TIMESTAMP, -- When courier reports the event
  webhook_signature VARCHAR(500), -- HMAC signature for verification
  webhook_payload JSONB, -- Full webhook data from courier
  webhook_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_events_order_id ON delivery_events(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_events_client_id ON delivery_events(client_id);
CREATE INDEX IF NOT EXISTS idx_delivery_events_tracking_number ON delivery_events(tracking_number);
CREATE INDEX IF NOT EXISTS idx_delivery_events_event_type ON delivery_events(event_type);
CREATE INDEX IF NOT EXISTS idx_delivery_events_created_at ON delivery_events(created_at);

-- Create delivery_integrations table to store API credentials per client/store
CREATE TABLE IF NOT EXISTS delivery_integrations (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  delivery_company_id BIGINT NOT NULL REFERENCES delivery_companies(id) ON DELETE CASCADE,
  api_key_encrypted VARCHAR(500) NOT NULL,
  api_secret_encrypted VARCHAR(500),
  account_number VARCHAR(255),
  merchant_id VARCHAR(255),
  webhook_secret_encrypted VARCHAR(500),
  is_enabled BOOLEAN DEFAULT true,
  configured_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Each client can have only one integration per delivery company
  UNIQUE(client_id, delivery_company_id)
);

CREATE INDEX IF NOT EXISTS idx_delivery_integrations_client_id ON delivery_integrations(client_id);
CREATE INDEX IF NOT EXISTS idx_delivery_integrations_company_id ON delivery_integrations(delivery_company_id);

-- Create delivery_errors table for logging failures and debugging
CREATE TABLE IF NOT EXISTS delivery_errors (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
  order_id BIGINT REFERENCES store_orders(id) ON DELETE SET NULL,
  delivery_company_id BIGINT REFERENCES delivery_companies(id) ON DELETE SET NULL,
  error_type VARCHAR(100) NOT NULL, -- 'api_error', 'webhook_verification_failed', 'label_generation_failed', etc
  error_code VARCHAR(100),
  error_message TEXT NOT NULL,
  request_id VARCHAR(255), -- Unique ID for tracking the request
  request_data JSONB, -- What we sent to the courier
  response_data JSONB, -- What we got back
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_errors_client_id ON delivery_errors(client_id);
CREATE INDEX IF NOT EXISTS idx_delivery_errors_order_id ON delivery_errors(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_errors_error_type ON delivery_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_delivery_errors_created_at ON delivery_errors(created_at);
CREATE INDEX IF NOT EXISTS idx_delivery_errors_request_id ON delivery_errors(request_id);

-- Pre-populate delivery companies with Algerian couriers
INSERT INTO delivery_companies (name, api_url, contact_email, features, is_active) VALUES
  ('Yalidine Express', 'https://api.yalidine.net', 'support@yalidine.net', '{"supports_cod": true, "supports_tracking": true, "supports_labels": true}'::jsonb, true),
  ('Algérie Poste', 'https://api.poste.dz', 'support@poste.dz', '{"supports_cod": true, "supports_tracking": true, "supports_labels": false}'::jsonb, true),
  ('Mars Express', 'https://api.marsexpress.dz', 'support@marsexpress.dz', '{"supports_cod": true, "supports_tracking": true, "supports_labels": true}'::jsonb, true),
  ('Tiba', 'https://api.tiba.dz', 'support@tiba.dz', '{"supports_cod": false, "supports_tracking": true, "supports_labels": true}'::jsonb, true),
  ('Zrara Express', 'https://api.zrara.dz', 'support@zrara.dz', '{"supports_cod": true, "supports_tracking": true, "supports_labels": true}'::jsonb, true),
  ('Speed DZ', 'https://api.speeddz.com', 'support@speeddz.com', '{"supports_cod": true, "supports_tracking": true, "supports_labels": true}'::jsonb, true),
  ('Khadamaty Delivery', 'https://api.khadamaty.dz', 'support@khadamaty.dz', '{"supports_cod": true, "supports_tracking": true, "supports_labels": false}'::jsonb, true),
  ('Eddelivery DZ', 'https://api.eddelivery.dz', 'support@eddelivery.dz', '{"supports_cod": true, "supports_tracking": true, "supports_labels": true}'::jsonb, true),
  ('Poste Express', 'https://api.poste.dz/express', 'support@poste.dz', '{"supports_cod": true, "supports_tracking": true, "supports_labels": true}'::jsonb, true),
  ('Rapidex', 'https://api.rapidex.dz', 'support@rapidex.dz', '{"supports_cod": true, "supports_tracking": true, "supports_labels": true}'::jsonb, true),
  ('Procolis', 'https://api.procolis.dz', 'support@procolis.dz', '{"supports_cod": false, "supports_tracking": true, "supports_labels": true}'::jsonb, true),
  ('ECF Express', 'https://api.ecf.dz', 'support@ecf.dz', '{"supports_cod": true, "supports_tracking": true, "supports_labels": true}'::jsonb, true),
  ('BaridiMob', 'https://api.baridimob.dz', 'support@baridimob.dz', '{"supports_cod": true, "supports_tracking": true, "supports_labels": true}'::jsonb, true),
  ('ZR Express', 'https://api.zrexpress.dz', 'support@zrexpress.dz', '{"supports_cod": true, "supports_tracking": true, "supports_labels": true}'::jsonb, true)
ON CONFLICT DO NOTHING;
