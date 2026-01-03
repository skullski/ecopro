-- Migration: Add Noest delivery company
-- Date: January 1, 2026
-- Purpose: Make Noest selectable and label-ready.
-- Note: Noest labels are generated internally (printable PDF) until an official API integration is provided.

INSERT INTO delivery_companies (name, api_url, contact_email, features, is_active)
VALUES (
  'Noest',
  NULL,
  NULL,
  '{"supports_cod": true, "supports_tracking": false, "supports_labels": true, "supports_webhooks": false, "api_rating": 2, "requires_credentials": false}'::jsonb,
  true
)
ON CONFLICT (name) DO UPDATE SET
  is_active = true,
  features = EXCLUDED.features;
