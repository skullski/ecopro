-- Seed marketplace with 20 sample products
-- First, get a seller user ID (or create one if needed)

-- Insert sample products into marketplace_products
-- Assuming seller_id = 1 exists (adjust if needed)

INSERT INTO marketplace_products (seller_id, title, description, price, original_price, category, images, stock, condition, location, shipping_available, views) VALUES
(1, 'iPhone 13 Pro Max 256GB', 'Excellent condition, unlocked, includes original box and accessories', 899.99, 1099.99, 'Electronics', ARRAY['https://images.unsplash.com/photo-1632661674596-df8be070a5c5'], 1, 'used', 'New York, NY', true, 125),
(1, 'MacBook Pro M1 16"', 'Like new, 16GB RAM, 512GB SSD, AppleCare+ until 2025', 1899.99, 2499.99, 'Electronics', ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8'], 1, 'used', 'San Francisco, CA', true, 89),
(1, 'Sony WH-1000XM5 Headphones', 'Brand new, sealed box, best noise cancellation', 349.99, 399.99, 'Electronics', ARRAY['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb'], 3, 'new', 'Los Angeles, CA', true, 234),
(1, 'Samsung 55" QLED 4K TV', 'Perfect condition, wall mount included', 599.99, 899.99, 'Electronics', ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1'], 1, 'used', 'Chicago, IL', false, 156),
(1, 'DJI Air 2S Drone', 'Barely used, all accessories, extra batteries', 749.99, 999.99, 'Electronics', ARRAY['https://images.unsplash.com/photo-1473968512647-3e447244af8f'], 1, 'used', 'Austin, TX', true, 98),
(1, 'Herman Miller Aeron Chair', 'Ergonomic office chair, size B, fully adjustable', 599.99, 1195.00, 'Furniture', ARRAY['https://images.unsplash.com/photo-1580480055273-228ff5388ef8'], 2, 'used', 'Seattle, WA', true, 67),
(1, 'Gaming PC - RTX 3080', 'Custom built, i7-12700K, 32GB RAM, 1TB NVMe', 1499.99, 2199.99, 'Electronics', ARRAY['https://images.unsplash.com/photo-1587202372775-e229f172b9d7'], 1, 'used', 'Boston, MA', true, 178),
(1, 'Canon EOS R6 Camera Body', 'Professional mirrorless, low shutter count', 1899.99, 2499.99, 'Electronics', ARRAY['https://images.unsplash.com/photo-1606980875113-8f5a2c89ae61'], 1, 'used', 'Miami, FL', true, 142),
(1, 'Peloton Bike+', 'Excellent condition, includes weights and mat', 1599.99, 2495.00, 'Sports', ARRAY['https://images.unsplash.com/photo-1584464491033-06628f3a6b7b'], 1, 'used', 'Denver, CO', false, 91),
(1, 'Nintendo Switch OLED', 'Like new, includes 5 games and carrying case', 299.99, 349.99, 'Electronics', ARRAY['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e'], 2, 'used', 'Portland, OR', true, 203),
(1, 'KitchenAid Stand Mixer', 'Professional 600 series, barely used', 299.99, 499.99, 'Home & Kitchen', ARRAY['https://images.unsplash.com/photo-1570222094114-d054a817e56b'], 1, 'used', 'Dallas, TX', true, 84),
(1, 'Dyson V15 Detect Vacuum', 'New in box, never opened, latest model', 549.99, 649.99, 'Home & Kitchen', ARRAY['https://images.unsplash.com/photo-1558317374-067fb5f30001'], 2, 'new', 'Phoenix, AZ', true, 167),
(1, 'Road Bike - Carbon Frame', 'Specialized Tarmac SL7, Shimano 105, size 54cm', 1899.99, 3200.00, 'Sports', ARRAY['https://images.unsplash.com/photo-1485965120184-e220f721d03e'], 1, 'used', 'San Diego, CA', false, 73),
(1, 'Leather Sofa - 3 Seater', 'Genuine Italian leather, modern design, pet-free home', 899.99, 1599.99, 'Furniture', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc'], 1, 'used', 'Houston, TX', false, 112),
(1, 'Apple Watch Series 8', '45mm GPS + Cellular, space black, AppleCare+', 399.99, 499.99, 'Electronics', ARRAY['https://images.unsplash.com/photo-1579586337278-3befd40fd17a'], 3, 'used', 'Philadelphia, PA', true, 189),
(1, 'Bose SoundLink Revolve+', 'Portable Bluetooth speaker, excellent sound', 179.99, 299.99, 'Electronics', ARRAY['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1'], 2, 'used', 'Atlanta, GA', true, 134),
(1, 'Vintage Vinyl Collection', '100+ classic rock albums, excellent condition', 499.99, NULL, 'Music', ARRAY['https://images.unsplash.com/photo-1603048588665-791ca8aea617'], 1, 'used', 'Nashville, TN', true, 56),
(1, 'Electric Scooter Xiaomi', 'Pro 2, 45km range, foldable, barely used', 449.99, 599.99, 'Sports', ARRAY['https://images.unsplash.com/photo-1621111848501-8d3634f82336'], 1, 'used', 'Las Vegas, NV', false, 145),
(1, 'Nespresso Vertuo Plus', 'Coffee machine with frother, like new', 149.99, 199.99, 'Home & Kitchen', ARRAY['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6'], 1, 'used', 'Minneapolis, MN', true, 98),
(1, 'Lego Architecture Set', 'Taj Mahal #21056, sealed box, rare collectible', 399.99, 369.99, 'Toys', ARRAY['https://images.unsplash.com/photo-1587654780291-39c9404d746b'], 1, 'new', 'Detroit, MI', true, 67);

-- Note: No explicit sequence bump needed.
-- For SERIAL/IDENTITY columns, PostgreSQL auto-advances based on default nextval.
-- Removing setval avoids errors when using IDENTITY (no named serial sequence).
