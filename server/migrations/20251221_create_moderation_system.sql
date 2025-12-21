-- Content Moderation System for Admin Review
-- Allows admins to flag inappropriate products (weapons, drugs, stolen goods, etc)

CREATE TABLE IF NOT EXISTS flagged_products (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES client_store_products(id) ON DELETE CASCADE,
  client_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- The store owner
  flagged_by BIGINT REFERENCES users(id) ON DELETE SET NULL, -- The admin who flagged it
  reason VARCHAR(255) NOT NULL, -- illegal_item, inappropriate_content, counterfeit, etc
  description TEXT, -- Detailed reason for flagging
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, reviewing, resolved, dismissed
  action_taken VARCHAR(255), -- removed, suspended, warned, etc
  admin_notes TEXT, -- Internal notes from admin review
  flagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_flagged_products_product_id ON flagged_products(product_id);
CREATE INDEX IF NOT EXISTS idx_flagged_products_client_id ON flagged_products(client_id);
CREATE INDEX IF NOT EXISTS idx_flagged_products_status ON flagged_products(status);
CREATE INDEX IF NOT EXISTS idx_flagged_products_flagged_at ON flagged_products(flagged_at);
CREATE INDEX IF NOT EXISTS idx_flagged_products_reason ON flagged_products(reason);

-- Add flagged status to products table if it doesn't exist
ALTER TABLE client_store_products ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;
ALTER TABLE client_store_products ADD COLUMN IF NOT EXISTS flag_reason VARCHAR(255);

-- Create indexes for quick flagged product lookups
CREATE INDEX IF NOT EXISTS idx_client_store_products_is_flagged ON client_store_products(is_flagged);
