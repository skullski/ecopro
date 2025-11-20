CREATE TABLE IF NOT EXISTS marketplace_listings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  images TEXT NOT NULL,
  location VARCHAR(255),
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);