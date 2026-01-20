-- Migration: Create customer_blacklist table
CREATE TABLE IF NOT EXISTS customer_blacklist (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(32),
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Add indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_customer_blacklist_phone ON customer_blacklist(customer_phone);
CREATE INDEX IF NOT EXISTS idx_customer_blacklist_name ON customer_blacklist(customer_name);