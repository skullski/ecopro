-- Client Stock Management System
-- Products owned/managed by clients (not for marketplace)

CREATE TABLE IF NOT EXISTS client_stock_products (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Product Info
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  description TEXT,
  category VARCHAR(100),
  
  -- Inventory
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10, 2),
  reorder_level INTEGER DEFAULT 10,
  location VARCHAR(255),
  
  -- Supplier Info
  supplier_name VARCHAR(255),
  supplier_contact VARCHAR(255),
  
  -- Status
  status VARCHAR(32) DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'out_of_stock')),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock adjustment history for audit trail
CREATE TABLE IF NOT EXISTS client_stock_history (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER NOT NULL REFERENCES client_stock_products(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Change details
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  adjustment INTEGER NOT NULL, -- Can be positive or negative
  
  -- Context
  reason VARCHAR(100) NOT NULL, -- 'sale', 'purchase', 'return', 'damage', 'adjustment', 'stocktake'
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_stock_client_id ON client_stock_products(client_id);
CREATE INDEX IF NOT EXISTS idx_client_stock_status ON client_stock_products(status);
CREATE INDEX IF NOT EXISTS idx_client_stock_category ON client_stock_products(category);
CREATE INDEX IF NOT EXISTS idx_client_stock_sku ON client_stock_products(sku);
CREATE INDEX IF NOT EXISTS idx_client_stock_quantity ON client_stock_products(quantity);
CREATE INDEX IF NOT EXISTS idx_client_stock_history_stock_id ON client_stock_history(stock_id);
CREATE INDEX IF NOT EXISTS idx_client_stock_history_client_id ON client_stock_history(client_id);
