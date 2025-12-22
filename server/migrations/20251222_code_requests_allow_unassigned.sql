-- Allow admin to generate unassigned voucher codes
-- Makes code_requests.chat_id and code_requests.client_id nullable

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'code_requests'
  ) THEN
    -- Admin-generated codes are not tied to a chat
    BEGIN
      ALTER TABLE code_requests ALTER COLUMN chat_id DROP NOT NULL;
    EXCEPTION WHEN others THEN
      -- ignore if already nullable or column missing
      NULL;
    END;

    -- Admin-generated codes are not tied to a specific client at issuance
    BEGIN
      ALTER TABLE code_requests ALTER COLUMN client_id DROP NOT NULL;
    EXCEPTION WHEN others THEN
      -- ignore if already nullable or column missing
      NULL;
    END;
  END IF;
END $$;
