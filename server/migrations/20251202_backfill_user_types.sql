-- Backfill user_type for existing users
-- Set user_type='admin' where role='admin'
UPDATE users SET user_type = 'admin' WHERE role = 'admin' AND (user_type IS NULL OR user_type <> 'admin');

-- Set user_type='seller' where role='seller'
UPDATE users SET user_type = 'seller' WHERE role = 'seller' AND (user_type IS NULL OR user_type <> 'seller');

-- Set remaining to 'client'
UPDATE users SET user_type = 'client' WHERE (user_type IS NULL OR user_type NOT IN ('admin','seller','client'));
