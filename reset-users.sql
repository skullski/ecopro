-- Delete all non-admin users and their associated data
DELETE FROM store_orders WHERE client_id IN (SELECT id FROM users WHERE role != 'admin');
DELETE FROM marketplace_orders WHERE seller_id IN (SELECT id FROM users WHERE role != 'admin');
DELETE FROM store_products WHERE client_id IN (SELECT id FROM users WHERE role != 'admin');
DELETE FROM marketplace_products WHERE seller_id IN (SELECT id FROM users WHERE role != 'admin');
DELETE FROM users WHERE role != 'admin';
