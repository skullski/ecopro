-- Check subscription counts
SELECT 
  status,
  COUNT(*) as count
FROM subscriptions
GROUP BY status;

-- Check if all subscriptions have valid users
SELECT 
  s.id as sub_id,
  s.user_id,
  s.status,
  s.trial_ends_at,
  c.email
FROM subscriptions s
LEFT JOIN clients c ON c.id = s.user_id
ORDER BY s.id;

-- Check clients count
SELECT COUNT(*) as total_clients FROM clients;
