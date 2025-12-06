-- Ensure sellers table has a role column
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'seller' CHECK (role IN ('seller', 'admin'));
