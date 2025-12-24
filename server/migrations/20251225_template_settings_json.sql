-- Add JSONB settings storage for unlimited template customization
-- Supports per-template persistence and controlled carry-over on template switches.

ALTER TABLE client_store_settings
  ADD COLUMN IF NOT EXISTS template_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS template_settings_by_template JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS global_settings JSONB NOT NULL DEFAULT '{}'::jsonb;
