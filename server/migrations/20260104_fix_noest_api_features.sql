-- Migration: Fix Noest API features
-- Date: January 4, 2026
-- Purpose: Align Noest DB metadata with the implemented API integration.

UPDATE delivery_companies
SET
  api_url = 'https://app.noest-dz.com',
  features = jsonb_strip_nulls(
    COALESCE(features, '{}'::jsonb)
    || '{
      "supports_cod": true,
      "supports_tracking": true,
      "supports_labels": true,
      "supports_webhooks": false,
      "api_rating": 2,
      "requires_credentials": true
    }'::jsonb
  ),
  is_active = true
WHERE LOWER(name) = 'noest';
