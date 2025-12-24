-- Custom order statuses for clients
CREATE TABLE IF NOT EXISTS order_statuses (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(50) DEFAULT '#6b7280',
  icon VARCHAR(50) DEFAULT '●',
  sort_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_statuses_client_id ON order_statuses(client_id);

-- Insert default statuses for existing clients (optional - can be done per-client on first load)
-- Each client will get their own set of default statuses
