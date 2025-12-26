-- Migration: Update delivery companies to real Algerian providers with verified APIs
-- Date: December 26, 2025
-- Purpose: Replace fake/non-API companies with only verified API providers

-- First, add unique constraint on name if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'delivery_companies_name_unique'
  ) THEN
    ALTER TABLE delivery_companies ADD CONSTRAINT delivery_companies_name_unique UNIQUE (name);
  END IF;
END $$;

-- Disable all existing companies (keeping the table structure)
UPDATE delivery_companies SET is_active = false;

-- Now insert/update the real providers with verified APIs
-- Using UPSERT (INSERT ... ON CONFLICT) to handle both fresh installs and updates

-- 1. Yalidine Express - Best API, #1 in Algeria
INSERT INTO delivery_companies (name, api_url, contact_email, contact_phone, features, is_active)
VALUES (
  'Yalidine Express',
  'https://api.yalidine.app/v1',
  'contact@yalidine.com',
  '+213 0982 30 80 80',
  '{"supports_cod": true, "supports_tracking": true, "supports_labels": true, "supports_webhooks": true, "api_rating": 5}'::jsonb,
  true
)
ON CONFLICT (name) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  features = EXCLUDED.features,
  is_active = true;

-- 2. Guepex - 160+ bureaus, similar API to Yalidine
INSERT INTO delivery_companies (name, api_url, contact_email, contact_phone, features, is_active)
VALUES (
  'Guepex',
  'https://api.guepex.app/v1',
  'contact@guepex.dz',
  '+213 541 01 01 01',
  '{"supports_cod": true, "supports_tracking": true, "supports_labels": true, "supports_webhooks": true, "api_rating": 4}'::jsonb,
  true
)
ON CONFLICT (name) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  features = EXCLUDED.features,
  is_active = true;

-- 3. ZR Express - Via Procolis platform
INSERT INTO delivery_companies (name, api_url, contact_email, features, is_active)
VALUES (
  'ZR Express',
  'https://api.procolis.com/v1',
  'support@zr-express.com',
  '{"supports_cod": true, "supports_tracking": true, "supports_labels": true, "supports_webhooks": false, "api_rating": 3}'::jsonb,
  true
)
ON CONFLICT (name) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  contact_email = EXCLUDED.contact_email,
  features = EXCLUDED.features,
  is_active = true;

-- 4. Ecotrack - Logistics SaaS, aggregates multiple carriers
INSERT INTO delivery_companies (name, api_url, contact_email, features, is_active)
VALUES (
  'Ecotrack',
  'https://api.ecotrack.dz/v1',
  'contact@ecotrack.dz',
  '{"supports_cod": true, "supports_tracking": true, "supports_labels": true, "supports_webhooks": true, "api_rating": 4, "is_aggregator": true}'::jsonb,
  true
)
ON CONFLICT (name) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  contact_email = EXCLUDED.contact_email,
  features = EXCLUDED.features,
  is_active = true;

-- 5. Maystro Delivery - 3K+ stores, 600+ drivers
INSERT INTO delivery_companies (name, api_url, contact_email, features, is_active)
VALUES (
  'Maystro Delivery',
  'https://api.maystro-delivery.com/v1',
  'contact@maystro-delivery.com',
  '{"supports_cod": true, "supports_tracking": true, "supports_labels": false, "supports_webhooks": false, "api_rating": 3, "extra_services": ["warehousing", "packaging", "call_center"]}'::jsonb,
  true
)
ON CONFLICT (name) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  contact_email = EXCLUDED.contact_email,
  features = EXCLUDED.features,
  is_active = true;

-- 6. Dolivroo (Aggregator) - Unified API for all providers, RECOMMENDED
INSERT INTO delivery_companies (name, api_url, contact_email, features, is_active)
VALUES (
  'Dolivroo',
  'https://api.dolivroo.com/v1',
  'support@dolivroo.com',
  '{"supports_cod": true, "supports_tracking": true, "supports_labels": true, "supports_webhooks": true, "api_rating": 5, "is_aggregator": true, "providers": ["yalidine", "ecotrack", "zr-express", "maystro"]}'::jsonb,
  true
)
ON CONFLICT (name) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  contact_email = EXCLUDED.contact_email,
  features = EXCLUDED.features,
  is_active = true;

-- Add index for faster lookups if not exists
CREATE INDEX IF NOT EXISTS idx_delivery_companies_active ON delivery_companies(is_active) WHERE is_active = true;

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Delivery companies updated to real Algerian providers with verified APIs';
  RAISE NOTICE 'Active providers: Yalidine Express, Guepex, ZR Express, Ecotrack, Maystro Delivery, Dolivroo';
END $$;
