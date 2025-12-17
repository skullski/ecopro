-- Initial database schema setup
-- Creates core tables that all other migrations depend on

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create admin user if needed
INSERT INTO users (email, password_hash, is_verified, role, created_at, updated_at)
VALUES (
  'admin@ecopro.com',
  -- bcrypt hash of 'admin123' with 10 rounds
  '$2b$10$XFXcXxM5WZK5UJk2X0y9B.umqZOraM.FgHGYLscrbkcWceF/hkE7C',
  true,
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  is_verified = true,
  password_hash = '$2b$10$XFXcXxM5WZK5UJk2X0y9B.umqZOraM.FgHGYLscrbkcWceF/hkE7C',
  updated_at = NOW();
