-- Add template_categories column to client_store_settings for custom store categories
ALTER TABLE client_store_settings 
ADD COLUMN IF NOT EXISTS template_categories TEXT DEFAULT '[]';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_client_store_settings_client_id 
ON client_store_settings(client_id);

COMMENT ON COLUMN client_store_settings.template_categories IS 'JSON array of custom categories. Format: [{"name":"Category1","color":"#FF0000"},{"name":"Category2","color":"#00FF00"}]';
