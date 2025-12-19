-- Create checkout_sessions table for persisting product data
-- This replaces localStorage-based product caching

CREATE TABLE IF NOT EXISTS checkout_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  product_id INTEGER,
  product_data JSONB NOT NULL,
  store_slug VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast session lookup
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_id ON checkout_sessions(session_id);

-- Index for cleanup of expired sessions
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_expires ON checkout_sessions(expires_at);

-- Index for product lookups
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_product ON checkout_sessions(product_id);

-- Cleanup old expired sessions (can be run periodically)
DELETE FROM checkout_sessions WHERE expires_at < NOW();

SELECT 'checkout_sessions table created successfully' AS status;
