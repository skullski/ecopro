-- Kernel (root) authentication table
CREATE TABLE IF NOT EXISTS kernel_users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Main security event table
CREATE TABLE IF NOT EXISTS security_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',

  -- Request context
  request_id TEXT NULL,
  method TEXT NULL,
  path TEXT NULL,
  status_code INT NULL,

  -- Actor context
  ip TEXT NULL,
  user_agent TEXT NULL,
  fingerprint TEXT NULL,

  -- Geo context
  country_code TEXT NULL,
  region TEXT NULL,
  city TEXT NULL,

  -- Auth context (if any)
  user_id TEXT NULL,
  user_type TEXT NULL,
  role TEXT NULL,

  -- Flexible extras
  metadata JSONB NULL
);

CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_country_code ON security_events(country_code);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip);
CREATE INDEX IF NOT EXISTS idx_security_events_fingerprint ON security_events(fingerprint);

-- Helpful partial index for the geo-block widget
CREATE INDEX IF NOT EXISTS idx_security_events_geo_block_country_recent
  ON security_events(country_code, created_at DESC)
  WHERE event_type = 'geo_block';
