CREATE TABLE IF NOT EXISTS store_products (
  id SERIAL PRIMARY KEY,
  store_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  images TEXT NOT NULL,
  condition VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(50) NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);
