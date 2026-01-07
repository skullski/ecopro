-- Migration: Delivery Pricing per Wilaya per Client
-- Date: 2026-01-06
-- Description: Allows each seller to set custom delivery prices per wilaya and delivery company

-- Create delivery_prices table
CREATE TABLE IF NOT EXISTS delivery_prices (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    wilaya_id INTEGER NOT NULL, -- Algeria wilaya code (1-58)
    delivery_company_id INTEGER DEFAULT NULL, -- Reference to delivery company (optional)
    home_delivery_price DECIMAL(10,2) NOT NULL DEFAULT 0, -- Price for home delivery
    desk_delivery_price DECIMAL(10,2) DEFAULT NULL, -- Price for stop-desk (pickup point) if available
    is_active BOOLEAN DEFAULT true, -- Whether delivery is available for this wilaya
    estimated_days INTEGER DEFAULT 3, -- Estimated delivery days
    notes TEXT, -- Optional notes (e.g., "Only weekdays")
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    -- Each client can have one price per wilaya per delivery company
    UNIQUE(client_id, wilaya_id, delivery_company_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_delivery_prices_client ON delivery_prices(client_id);
CREATE INDEX IF NOT EXISTS idx_delivery_prices_wilaya ON delivery_prices(wilaya_id);
CREATE INDEX IF NOT EXISTS idx_delivery_prices_active ON delivery_prices(client_id, is_active) WHERE is_active = true;

-- Add delivery_fee column to store_orders if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'store_orders' AND column_name = 'delivery_fee'
    ) THEN
        ALTER TABLE store_orders ADD COLUMN delivery_fee DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'store_orders' AND column_name = 'delivery_type'
    ) THEN
        ALTER TABLE store_orders ADD COLUMN delivery_type VARCHAR(20) DEFAULT 'home'; -- 'home' or 'desk'
    END IF;
END $$;

-- Comments
COMMENT ON TABLE delivery_prices IS 'Stores custom delivery prices per wilaya for each seller';
COMMENT ON COLUMN delivery_prices.wilaya_id IS 'Algeria wilaya code (1-58)';
COMMENT ON COLUMN delivery_prices.home_delivery_price IS 'Price in DZD for home delivery';
COMMENT ON COLUMN delivery_prices.desk_delivery_price IS 'Price in DZD for stop-desk/pickup point delivery';
COMMENT ON COLUMN delivery_prices.is_active IS 'Whether delivery is available to this wilaya';
