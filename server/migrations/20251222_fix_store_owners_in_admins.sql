-- Fix store owner accounts that were incorrectly placed in admins table
-- Move them to clients table with proper role

-- Move store1@example.com to clients table if it's in admins
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM admins WHERE email = 'store1@example.com') THEN
    -- Insert into clients if not already there
    INSERT INTO clients (email, password, name, role, user_type, is_verified, created_at, updated_at)
    SELECT email, password, COALESCE(full_name, 'Store Owner 1'), 'client', 'client', is_verified, created_at, updated_at
    FROM admins
    WHERE email = 'store1@example.com'
    ON CONFLICT (email) DO NOTHING;
    
    -- Delete from admins
    DELETE FROM admins WHERE email = 'store1@example.com';
  END IF;
END $$;

-- Fix skull@gmail.com to be in clients with correct role
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM admins WHERE email = 'skull@gmail.com') THEN
    INSERT INTO clients (email, password, name, role, user_type, is_verified, created_at, updated_at)
    SELECT email, password, COALESCE(full_name, 'skull'), 'client', 'client', is_verified, created_at, updated_at
    FROM admins
    WHERE email = 'skull@gmail.com'
    ON CONFLICT (email) DO NOTHING;
    
    DELETE FROM admins WHERE email = 'skull@gmail.com';
  END IF;
END $$;
