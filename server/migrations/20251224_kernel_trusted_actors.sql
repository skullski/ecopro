-- Kernel / security: trusted actors (to avoid false emergency + self-block)
CREATE TABLE IF NOT EXISTS security_trusted_actors (
  id BIGSERIAL PRIMARY KEY,
  fingerprint TEXT NULL,
  ip TEXT NULL,
  label TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT security_trusted_actors_key_check CHECK (fingerprint IS NOT NULL OR ip IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_security_trusted_actors_fingerprint ON security_trusted_actors(fingerprint) WHERE fingerprint IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_security_trusted_actors_ip ON security_trusted_actors(ip) WHERE ip IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_trusted_actors_active ON security_trusted_actors(is_active);
