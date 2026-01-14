-- Migration: Add additional delivery companies from ProColis catalog list
-- Date: 2026-01-15
-- Purpose: Make these providers available for future integration (kept inactive by default)

-- Normalize naming if the initial seed inserted Procolis with different casing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM delivery_companies WHERE name = 'Procolis')
     AND NOT EXISTS (SELECT 1 FROM delivery_companies WHERE name = 'ProColis') THEN
    UPDATE delivery_companies SET name = 'ProColis' WHERE name = 'Procolis';
  END IF;
END $$;

-- Insert/update additional providers as inactive placeholders.
-- Note: Keeping is_active = false prevents these from appearing in order-assignment flows
-- until an actual courier service integration exists.

INSERT INTO delivery_companies (name, api_url, contact_email, contact_phone, features, is_active)
VALUES
  ('ProColis', '', NULL, NULL, '{"supports_cod": false, "supports_tracking": false, "supports_labels": false, "supports_webhooks": false, "api_rating": 1, "coming_soon": true, "source": "procolis_catalog"}'::jsonb, false),
  ('Nord Et Ouest', '', NULL, NULL, '{"supports_cod": false, "supports_tracking": false, "supports_labels": false, "supports_webhooks": false, "api_rating": 1, "coming_soon": true, "source": "procolis_catalog"}'::jsonb, false),
  ('Elogistia', '', NULL, NULL, '{"supports_cod": false, "supports_tracking": false, "supports_labels": false, "supports_webhooks": false, "api_rating": 1, "coming_soon": true, "source": "procolis_catalog"}'::jsonb, false),
  ('Colivraison Express', '', NULL, NULL, '{"supports_cod": false, "supports_tracking": false, "supports_labels": false, "supports_webhooks": false, "api_rating": 1, "coming_soon": true, "source": "procolis_catalog"}'::jsonb, false),
  ('MDM Express', '', NULL, NULL, '{"supports_cod": false, "supports_tracking": false, "supports_labels": false, "supports_webhooks": false, "api_rating": 1, "coming_soon": true, "source": "procolis_catalog"}'::jsonb, false),
  ('Yalitec', '', NULL, NULL, '{"supports_cod": false, "supports_tracking": false, "supports_labels": false, "supports_webhooks": false, "api_rating": 1, "coming_soon": true, "source": "procolis_catalog"}'::jsonb, false),
  ('Mylerz Algérie', '', NULL, NULL, '{"supports_cod": false, "supports_tracking": false, "supports_labels": false, "supports_webhooks": false, "api_rating": 1, "coming_soon": true, "source": "procolis_catalog"}'::jsonb, false),
  ('Ecom Delivery', '', NULL, NULL, '{"supports_cod": false, "supports_tracking": false, "supports_labels": false, "supports_webhooks": false, "api_rating": 1, "coming_soon": true, "source": "procolis_catalog"}'::jsonb, false),
  ('Flash Delivery', '', NULL, NULL, '{"supports_cod": false, "supports_tracking": false, "supports_labels": false, "supports_webhooks": false, "api_rating": 1, "coming_soon": true, "source": "procolis_catalog"}'::jsonb, false)
ON CONFLICT (name) DO UPDATE SET
  api_url = EXCLUDED.api_url,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

DO $$
BEGIN
  RAISE NOTICE 'Added ProColis catalog delivery companies (inactive placeholders).';
END $$;
