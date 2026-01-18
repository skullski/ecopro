-- Fix FK constraints to reference clients table instead of users
-- Many original migrations referenced users(id) but new users go into clients table

-- Helper function to safely update FK constraints
CREATE OR REPLACE FUNCTION update_fk_to_clients(
  p_table_name TEXT,
  p_column_name TEXT,
  p_on_delete TEXT DEFAULT 'CASCADE'
) RETURNS VOID AS $$
DECLARE
  constraint_name TEXT;
  fk_exists BOOLEAN;
BEGIN
  -- Find existing FK constraint
  SELECT tc.constraint_name INTO constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON kcu.constraint_name = tc.constraint_name
  JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
  WHERE tc.table_name = p_table_name 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = p_column_name
    AND ccu.table_name = 'users';
  
  IF constraint_name IS NOT NULL THEN
    -- Drop the old constraint
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', p_table_name, constraint_name);
    RAISE NOTICE 'Dropped FK % from %.%', constraint_name, p_table_name, p_column_name;
  END IF;
  
  -- Check if any FK exists on this column (maybe already fixed)
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON kcu.constraint_name = tc.constraint_name
    WHERE tc.table_name = p_table_name 
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = p_column_name
  ) INTO fk_exists;
  
  IF NOT fk_exists THEN
    -- Add new FK to clients
    EXECUTE format(
      'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES clients(id) ON DELETE %s',
      p_table_name,
      p_table_name || '_' || p_column_name || '_fkey',
      p_column_name,
      p_on_delete
    );
    RAISE NOTICE 'Added FK to clients for %.%', p_table_name, p_column_name;
  ELSE
    RAISE NOTICE 'FK already exists for %.%, skipping', p_table_name, p_column_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Fix client_store_products
SELECT update_fk_to_clients('client_store_products', 'client_id', 'CASCADE');

-- Fix client_store_settings  
SELECT update_fk_to_clients('client_store_settings', 'client_id', 'CASCADE');

-- Fix client_stock
SELECT update_fk_to_clients('client_stock', 'client_id', 'CASCADE');

-- Fix client_stock_movements (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_stock_movements') THEN
    PERFORM update_fk_to_clients('client_stock_movements', 'client_id', 'CASCADE');
  END IF;
END $$;

-- Fix bot_settings
SELECT update_fk_to_clients('bot_settings', 'client_id', 'CASCADE');

-- Fix store_orders client_id
SELECT update_fk_to_clients('store_orders', 'client_id', 'SET NULL');

-- Fix product_variants (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_variants') THEN
    PERFORM update_fk_to_clients('product_variants', 'client_id', 'CASCADE');
  END IF;
END $$;

-- Fix stock_variants (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_variants') THEN
    PERFORM update_fk_to_clients('stock_variants', 'client_id', 'CASCADE');
  END IF;
END $$;

-- Drop the helper function
DROP FUNCTION IF EXISTS update_fk_to_clients(TEXT, TEXT, TEXT);

