-- Remove orders with product_id not present in client_store_products
DELETE FROM store_orders
WHERE product_id NOT IN (SELECT id FROM client_store_products);
