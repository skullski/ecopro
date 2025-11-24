-- Add missing columns to products table for demo seeding
ALTER TABLE products
ADD COLUMN IF NOT EXISTS condition TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER,
ADD COLUMN IF NOT EXISTS status TEXT;
