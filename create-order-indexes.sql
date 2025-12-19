-- Create indexes to optimize order queries
-- This speeds up the getClientOrders endpoint significantly

-- Index for store_orders.client_id (used in getClientOrders)
CREATE INDEX IF NOT EXISTS idx_store_orders_client_id ON store_orders(client_id);

-- Index for store_orders.product_id (used in JOIN)
CREATE INDEX IF NOT EXISTS idx_store_orders_product_id ON store_orders(product_id);

-- Index for store_orders.status (common filtering)
CREATE INDEX IF NOT EXISTS idx_store_orders_status ON store_orders(status);

-- Index for store_orders.created_at (used in ORDER BY)
CREATE INDEX IF NOT EXISTS idx_store_orders_created_at ON store_orders(created_at DESC);

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_store_orders_client_created ON store_orders(client_id, created_at DESC);

-- Index for client_store_products.client_id (used in JOIN)
CREATE INDEX IF NOT EXISTS idx_client_store_products_client_id ON client_store_products(client_id);

-- Index for fast product lookups
CREATE INDEX IF NOT EXISTS idx_client_store_products_id_client ON client_store_products(id, client_id);

-- Log completion
SELECT 'Order indexes created successfully' AS status;
