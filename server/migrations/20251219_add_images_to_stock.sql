-- Add images field to client_stock_products table
ALTER TABLE client_stock_products
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add index on client_id for faster queries
CREATE INDEX IF NOT EXISTS idx_client_stock_products_images ON client_stock_products(images);
