-- Add vendor_id column to products table (TEXT type, optional foreign key)
ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_id TEXT;
-- Optionally, add a foreign key constraint if vendors table exists:
-- ALTER TABLE products ADD CONSTRAINT fk_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id);
