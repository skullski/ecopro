-- Add indexes to improve marketplace query performance
-- Run this to speed up product queries

-- Index for status filtering (most common filter)
CREATE INDEX IF NOT EXISTS idx_marketplace_products_status 
ON marketplace_products(status);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category 
ON marketplace_products(category) WHERE status = 'active';

-- Index for sorting by created_at
CREATE INDEX IF NOT EXISTS idx_marketplace_products_created_at 
ON marketplace_products(created_at DESC) WHERE status = 'active';

-- Index for sorting by price
CREATE INDEX IF NOT EXISTS idx_marketplace_products_price 
ON marketplace_products(price) WHERE status = 'active';

-- Index for sorting by views (popularity)
CREATE INDEX IF NOT EXISTS idx_marketplace_products_views 
ON marketplace_products(views DESC) WHERE status = 'active';

-- Index for seller_id lookup (joins)
CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller_id 
ON marketplace_products(seller_id);

-- Composite index for common query pattern (status + category)
CREATE INDEX IF NOT EXISTS idx_marketplace_products_status_category 
ON marketplace_products(status, category);

-- Text search index for title and description
CREATE INDEX IF NOT EXISTS idx_marketplace_products_title_search 
ON marketplace_products USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_marketplace_products_description_search 
ON marketplace_products USING gin(to_tsvector('english', COALESCE(description, '')));
