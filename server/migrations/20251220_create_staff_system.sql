-- CRITICAL: Create a completely separate 'staff' table
-- Staff members authenticate with THEIR OWN credentials, NOT client/owner credentials
-- This prevents any privilege escalation where staff could login as store owners
CREATE TABLE IF NOT EXISTS staff (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE, -- The store they work for
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'manager', -- manager, staff, etc
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, active, inactive, suspended
  permissions JSONB NOT NULL DEFAULT '{}', -- Map of permission_name: boolean
  last_login TIMESTAMP,
  last_ip_address VARCHAR(45),
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activated_at TIMESTAMP,
  created_by BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE, -- Which client/owner created this staff
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Unique constraint: same email can't exist for the same client
  UNIQUE(client_id, email)
);

-- Create indexes for common queries (PostgreSQL syntax)
CREATE INDEX IF NOT EXISTS idx_staff_client_id ON staff(client_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(client_id, status);
CREATE INDEX IF NOT EXISTS idx_staff_created_at ON staff(created_at);

-- Create staff_activity_log table for tracking all staff actions (audit trail)
CREATE TABLE IF NOT EXISTS staff_activity_log (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  staff_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- staff_login, staff_created_product, staff_updated_order, etc
  resource_type VARCHAR(50), -- product, order, settings, staff, etc
  resource_id BIGINT, -- The ID of the resource that was changed
  resource_name VARCHAR(255), -- Human readable name of resource
  before_value TEXT, -- JSON of old values (for audit trail)
  after_value TEXT, -- JSON of new values (for audit trail)
  ip_address VARCHAR(45), -- IP address of staff member
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for activity log (PostgreSQL syntax)
CREATE INDEX IF NOT EXISTS idx_activity_client_id ON staff_activity_log(client_id);
CREATE INDEX IF NOT EXISTS idx_activity_staff_id ON staff_activity_log(staff_id);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON staff_activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_action ON staff_activity_log(client_id, action);
