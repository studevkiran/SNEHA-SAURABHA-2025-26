-- Check zone mapping for test entry 2026RTY0695
-- Expected: Zone 7 (Mysore Metro)

SELECT 
  registration_id,
  name,
  mobile,
  club,
  zone,
  registration_type,
  payment_status,
  created_at
FROM registrations
WHERE registration_id IN ('2026RTY0695', 'ROT54V0694', '2026RTY0693')
ORDER BY created_at DESC;

-- Also check the zone distribution
SELECT 
  zone,
  COUNT(*) as count
FROM registrations
GROUP BY zone
ORDER BY zone;
