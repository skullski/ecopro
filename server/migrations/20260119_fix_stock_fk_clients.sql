-- Fix stock management foreign keys to reference `clients(id)` instead of `users(id)`.
--
-- Why: The platform auth + ownership model uses the `clients` table for store owners.
-- Some stock tables were created with foreign keys pointing at `users`, which can cause
-- FK violations (e.g. when inserting into client_stock_variants) if a client exists in
-- `clients` but not in `users`.
--
-- This migration:
-- 1) Attempts to remap legacy `client_id` values from users -> clients by email
-- 2) Removes orphan rows that still can't be mapped
-- 3) Drops old FK constraints to `users`
-- 4) Adds new FK constraints to `clients`

DO $$
BEGIN
  IF to_regclass('public.clients') IS NULL THEN
    RAISE NOTICE 'clients table not found; skipping stock FK fix.';
    RETURN;
  END IF;
END $$;

-- Remap legacy client_id values (users.id -> clients.id via email)
DO $$
BEGIN
  IF to_regclass('public.client_stock_products') IS NOT NULL AND to_regclass('public.users') IS NOT NULL THEN
    EXECUTE $SQL$
      UPDATE client_stock_products p
      SET client_id = c.id
      FROM users u
      JOIN clients c ON c.email = u.email
      WHERE p.client_id = u.id
        AND NOT EXISTS (SELECT 1 FROM clients c2 WHERE c2.id = p.client_id)
    $SQL$;
  END IF;

  IF to_regclass('public.client_stock_history') IS NOT NULL AND to_regclass('public.users') IS NOT NULL THEN
    EXECUTE $SQL$
      UPDATE client_stock_history h
      SET client_id = c.id
      FROM users u
      JOIN clients c ON c.email = u.email
      WHERE h.client_id = u.id
        AND NOT EXISTS (SELECT 1 FROM clients c2 WHERE c2.id = h.client_id)
    $SQL$;
  END IF;

  IF to_regclass('public.client_stock_variants') IS NOT NULL AND to_regclass('public.users') IS NOT NULL THEN
    EXECUTE $SQL$
      UPDATE client_stock_variants v
      SET client_id = c.id
      FROM users u
      JOIN clients c ON c.email = u.email
      WHERE v.client_id = u.id
        AND NOT EXISTS (SELECT 1 FROM clients c2 WHERE c2.id = v.client_id)
    $SQL$;
  END IF;
END $$;

-- Remove orphans that still don't map to a real client
DO $$
BEGIN
  IF to_regclass('public.client_stock_variants') IS NOT NULL THEN
    EXECUTE $SQL$
      DELETE FROM client_stock_variants v
      WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = v.client_id)
    $SQL$;
  END IF;

  IF to_regclass('public.client_stock_history') IS NOT NULL THEN
    EXECUTE $SQL$
      DELETE FROM client_stock_history h
      WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = h.client_id)
    $SQL$;
  END IF;

  IF to_regclass('public.client_stock_products') IS NOT NULL THEN
    EXECUTE $SQL$
      DELETE FROM client_stock_products p
      WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = p.client_id)
    $SQL$;
  END IF;
END $$;

-- Drop old FKs (to users) and replace with FKs to clients
ALTER TABLE IF EXISTS client_stock_products
  DROP CONSTRAINT IF EXISTS client_stock_products_client_id_fkey;

ALTER TABLE IF EXISTS client_stock_history
  DROP CONSTRAINT IF EXISTS client_stock_history_client_id_fkey;

-- created_by can be either a client id or staff id depending on who performed the action.
-- Keep it as a nullable int without a strict FK to avoid blocking writes.
ALTER TABLE IF EXISTS client_stock_history
  DROP CONSTRAINT IF EXISTS client_stock_history_created_by_fkey;

ALTER TABLE IF EXISTS client_stock_variants
  DROP CONSTRAINT IF EXISTS client_stock_variants_client_id_fkey;

ALTER TABLE IF EXISTS client_stock_products
  ADD CONSTRAINT client_stock_products_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS client_stock_history
  ADD CONSTRAINT client_stock_history_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS client_stock_variants
  ADD CONSTRAINT client_stock_variants_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
