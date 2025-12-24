-- Kernel / security: manual IP blocks
CREATE TABLE IF NOT EXISTS security_ip_blocks (
  id BIGSERIAL PRIMARY KEY,
  ip TEXT NOT NULL UNIQUE,
  reason TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_ip_blocks_active ON security_ip_blocks(is_active);
CREATE INDEX IF NOT EXISTS idx_security_ip_blocks_ip ON security_ip_blocks(ip);
