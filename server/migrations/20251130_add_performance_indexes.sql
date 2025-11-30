-- Add indexes for better query performance

-- Improve marketplace_products queries
CREATE INDEX IF NOT EXISTS idx_marketplace_products_status_created 
ON marketplace_products(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_products_category_status 
ON marketplace_products(category, status);

-- Improve user queries
CREATE INDEX IF NOT EXISTS idx_users_user_type 
ON users(user_type);

CREATE INDEX IF NOT EXISTS idx_users_role 
ON users(role);

-- Improve order queries
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status_created 
ON marketplace_orders(status, created_at DESC);

COMMENT ON INDEX idx_marketplace_products_status_created IS 'Speeds up active product listings sorted by date';
COMMENT ON INDEX idx_marketplace_products_category_status IS 'Speeds up category filtering with status check';
COMMENT ON INDEX idx_users_user_type IS 'Speeds up user type filtering for stats';
COMMENT ON INDEX idx_users_role IS 'Speeds up role-based queries';
COMMENT ON INDEX idx_marketplace_orders_status_created IS 'Speeds up order status queries';
