-- Add nullable deleted_at column to support soft deletes for orders
-- Safe: checks information_schema before altering
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'store_orders' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE store_orders ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE NULL;
  END IF;
END$$;

-- Add index to speed up queries that filter out deleted rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'store_orders' AND indexname = 'idx_store_orders_deleted_at'
  ) THEN
    CREATE INDEX idx_store_orders_deleted_at ON store_orders(deleted_at);
  END IF;
END$$;
