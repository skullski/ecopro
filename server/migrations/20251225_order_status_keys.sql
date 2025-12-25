-- Add key column to order_statuses for matching English status values
ALTER TABLE order_statuses ADD COLUMN IF NOT EXISTS key VARCHAR(50);

-- Update existing statuses with English keys based on their Arabic names
UPDATE order_statuses SET key = 'confirmed' WHERE name LIKE '%مؤكد%' OR name = 'Confirmed';
UPDATE order_statuses SET key = 'completed' WHERE name LIKE '%مكتمل%' OR name = 'Completed';
UPDATE order_statuses SET key = 'pending' WHERE name LIKE '%انتظار%' OR name = 'Pending';
UPDATE order_statuses SET key = 'cancelled' WHERE name LIKE '%ملغ%' OR name LIKE '%الغ%' OR name = 'Cancelled';
UPDATE order_statuses SET key = 'processing' WHERE name LIKE '%معالج%' OR name = 'Processing';
UPDATE order_statuses SET key = 'shipped' WHERE name LIKE '%شحن%' OR name = 'Shipped';
UPDATE order_statuses SET key = 'delivered' WHERE name LIKE '%توصيل%' OR name = 'Delivered';
UPDATE order_statuses SET key = 'followup' WHERE name LIKE '%متابع%' OR name = 'Followup';
UPDATE order_statuses SET key = 'didnt_pickup' WHERE name LIKE '%pickup%' OR name LIKE '%استلم%';
