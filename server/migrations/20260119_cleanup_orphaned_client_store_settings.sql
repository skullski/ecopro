-- Remove orphaned client_store_settings rows that violate FK constraint
DELETE FROM client_store_settings WHERE client_id NOT IN (SELECT id FROM clients);
