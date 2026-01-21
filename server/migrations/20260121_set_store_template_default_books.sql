-- Migration: Set default template to 'books' for new store owners
-- Date: 2026-01-21

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='client_store_settings' AND column_name='template') THEN
    ALTER TABLE public.client_store_settings ALTER COLUMN template SET DEFAULT 'books';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='seller_store_settings' AND column_name='template') THEN
    ALTER TABLE public.seller_store_settings ALTER COLUMN template SET DEFAULT 'books';
  END IF;
END$$;

SELECT 'Migration applied: 20260121_set_store_template_default_books.sql' AS status;
