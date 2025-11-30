-- Create bot settings table for per-client configuration
CREATE TABLE IF NOT EXISTS bot_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT FALSE,
  language VARCHAR(10) DEFAULT 'ar',
  whatsapp_delay INTEGER DEFAULT 5,
  sms_delay INTEGER DEFAULT 30,
  company_name VARCHAR(255),
  support_phone VARCHAR(50),
  store_url VARCHAR(255),
  whatsapp_template TEXT,
  sms_template TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bot_settings_user_id ON bot_settings(user_id);
