-- =====================================================
-- UPDATE CLUB TO MYSORE METRO FOR 4 REGISTRATIONS
-- Date: 15 November 2025
-- =====================================================

-- First, check current club assignments
SELECT registration_id, name, mobile, club, registration_type, registration_amount
FROM registrations 
WHERE registration_id IN ('2026RTY0006', '2026RTY0029', '2026RTY0402', '2026RTY0155')
ORDER BY registration_id;

-- Update all 4 to Mysore Metro
UPDATE registrations 
SET club = 'Mysore Metro' 
WHERE registration_id IN ('2026RTY0006', '2026RTY0029', '2026RTY0402', '2026RTY0155');

-- Verify the updates
SELECT registration_id, name, mobile, club, registration_type, registration_amount
FROM registrations 
WHERE registration_id IN ('2026RTY0006', '2026RTY0029', '2026RTY0402', '2026RTY0155')
ORDER BY registration_id;

-- Check total Mysore Metro registrations after update
SELECT COUNT(*) as total_mysore_metro
FROM registrations
WHERE club = 'Mysore Metro' AND payment_status != 'test';
