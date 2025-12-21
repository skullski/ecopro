-- Google Sheets Integration System
-- OAuth tokens and import mapping management

-- Create google_tokens table for storing Google OAuth credentials
CREATE TABLE IF NOT EXISTS google_tokens (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  access_token_encrypted VARCHAR(1000) NOT NULL,
  refresh_token_encrypted VARCHAR(1000),
  expires_at TIMESTAMP,
  scopes VARCHAR(500) DEFAULT 'https://www.googleapis.com/auth/spreadsheets.readonly',
  last_refreshed_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_google_tokens_client_id ON google_tokens(client_id);
CREATE INDEX IF NOT EXISTS idx_google_tokens_is_active ON google_tokens(is_active);

-- Create import_mappings table for storing column mappings
CREATE TABLE IF NOT EXISTS import_mappings (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  mapping_name VARCHAR(255) NOT NULL,
  import_type VARCHAR(50) NOT NULL, -- 'orders', 'customers', 'products'
  spreadsheet_id VARCHAR(255) NOT NULL,
  sheet_name VARCHAR(255) NOT NULL,
  data_range VARCHAR(100), -- e.g., 'A1:Z100'
  column_mapping JSONB NOT NULL, -- {"order_id": "A", "customer_name": "B", "email": "C", ...}
  sample_row JSONB, -- First row as example
  header_row_index INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP,
  import_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Each client can have multiple mappings per import type
  UNIQUE(client_id, mapping_name)
);

CREATE INDEX IF NOT EXISTS idx_import_mappings_client_id ON import_mappings(client_id);
CREATE INDEX IF NOT EXISTS idx_import_mappings_import_type ON import_mappings(import_type);
CREATE INDEX IF NOT EXISTS idx_import_mappings_active ON import_mappings(is_active);

-- Create import_jobs table to track import history
CREATE TABLE IF NOT EXISTS import_jobs (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  mapping_id BIGINT REFERENCES import_mappings(id) ON DELETE SET NULL,
  import_type VARCHAR(50) NOT NULL, -- 'orders', 'customers', 'products'
  spreadsheet_id VARCHAR(255) NOT NULL,
  sheet_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  total_rows INT DEFAULT 0,
  successful_imports INT DEFAULT 0,
  failed_rows INT DEFAULT 0,
  error_details JSONB, -- {row_number: "error message", ...}
  request_id VARCHAR(255),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_import_jobs_client_id ON import_jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_import_jobs_created_at ON import_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_import_jobs_request_id ON import_jobs(request_id);

-- Create import_logs table for detailed audit trail
CREATE TABLE IF NOT EXISTS import_logs (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
  row_number INT,
  status VARCHAR(50), -- 'success', 'failed', 'skipped'
  row_data JSONB, -- Original row from sheet
  mapped_data JSONB, -- Mapped to EcoPro fields
  created_record_id BIGINT, -- ID of created order/customer/product
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_import_logs_job_id ON import_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON import_logs(status);

-- Add Google column to clients table (optional, for quick access)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_email VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_last_sync TIMESTAMP;
