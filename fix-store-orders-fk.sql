-- Migration: Fix foreign key for product_id in store_orders to reference client_store_products
ALTER TABLE store_orders
  DROP CONSTRAINT IF EXISTS store_orders_product_id_fkey;

ALTER TABLE store_orders
  ADD CONSTRAINT store_orders_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES client_store_products(id)
    ON DELETE CASCADE;
