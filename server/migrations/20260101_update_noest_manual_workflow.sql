-- Migration: Update Noest to manual-portal workflow
-- Date: January 1, 2026
-- Purpose: Noest labels are generated inside the Noest dashboard (manual upload workflow).

INSERT INTO delivery_companies (name, api_url, contact_email, features, is_active)
VALUES (
  'Noest',
  'manual://noest',
  NULL,
  '{"supports_cod": true, "supports_tracking": false, "supports_labels": false, "supports_webhooks": false, "api_rating": 2, "requires_credentials": false}'::jsonb,
  true
)
ON CONFLICT (name) DO UPDATE SET
  api_url = COALESCE(delivery_companies.api_url, EXCLUDED.api_url),
  is_active = true,
  features = EXCLUDED.features;
