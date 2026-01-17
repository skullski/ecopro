-- Migration: Create customer_preconnect_tokens table for Telegram pre-connection flow
-- This allows customers to connect their Telegram chat BEFORE placing an order
-- so they receive instant order notifications after checkout

CREATE TABLE IF NOT EXISTS customer_preconnect_tokens (
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    customer_phone VARCHAR(50) NOT NULL,
    token VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    PRIMARY KEY (client_id, customer_phone)
);

CREATE INDEX IF NOT EXISTS idx_customer_preconnect_token ON customer_preconnect_tokens(token);

COMMENT ON TABLE customer_preconnect_tokens IS 'Temporary tokens for customer pre-connection via Telegram deep-link';
