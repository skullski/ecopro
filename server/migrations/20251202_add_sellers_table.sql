-- Create separate sellers table for marketplace authentication
CREATE TABLE IF NOT EXISTS sellers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Optional helper index for fast lookups
CREATE INDEX IF NOT EXISTS idx_sellers_email ON sellers(email);
