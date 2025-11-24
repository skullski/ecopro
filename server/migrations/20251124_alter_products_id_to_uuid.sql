-- Change id column to UUID if not already
ALTER TABLE products
ALTER COLUMN id TYPE uuid USING (uuid_generate_v4());
