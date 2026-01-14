-- Migration: Add missing verified couriers used by the UI
-- Date: 2026-01-15
-- Purpose: Ensure Zimou Express and Anderson Ecommerce exist in DB so integrations can be saved and used.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'delivery_companies_name_unique'
  ) THEN
    ALTER TABLE delivery_companies ADD CONSTRAINT delivery_companies_name_unique UNIQUE (name);
  END IF;
END $$;

-- Zimou Express
INSERT INTO delivery_companies (name, api_url, contact_email, contact_phone, features, is_active)
VALUES (
  'Zimou Express',
  'https://zimou.express',
  NULL,
  NULL,
  '{"supports_cod": true, "supports_tracking": true, "supports_labels": false, "supports_webhooks": true, "api_rating": 3, "requires_credentials": true}'::jsonb,
  true
)
ON CONFLICT (name) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  features = EXCLUDED.features,
  is_active = true,
  updated_at = NOW();

-- Anderson Ecommerce (Ecotrack-powered)
INSERT INTO delivery_companies (name, api_url, contact_email, contact_phone, features, is_active)
VALUES (
  'Anderson Ecommerce',
  'https://anderson-ecommerce.ecotrack.dz',
  NULL,
  NULL,
  '{"supports_cod": true, "supports_tracking": true, "supports_labels": true, "supports_webhooks": true, "api_rating": 4, "requires_credentials": true}'::jsonb,
  true
)
ON CONFLICT (name) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  features = EXCLUDED.features,
  is_active = true,
  updated_at = NOW();

DO $$
BEGIN
  RAISE NOTICE 'Added/updated Zimou Express and Anderson Ecommerce delivery companies.';
END $$;
