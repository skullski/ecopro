-- Platform error telemetry (client + server)

CREATE TABLE IF NOT EXISTS platform_error_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL CHECK (source IN ('client','server')),
  message TEXT NOT NULL,
  stack TEXT,
  url TEXT,
  method TEXT,
  path TEXT,
  status_code INTEGER,
  request_id TEXT,
  ip TEXT,
  user_agent TEXT,
  user_id TEXT,
  user_type TEXT,
  role TEXT,
  client_id INTEGER,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_platform_error_events_created_at_desc
  ON platform_error_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_error_events_source_created_at_desc
  ON platform_error_events(source, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_error_events_status_code
  ON platform_error_events(status_code);

CREATE INDEX IF NOT EXISTS idx_platform_error_events_client_id
  ON platform_error_events(client_id);
