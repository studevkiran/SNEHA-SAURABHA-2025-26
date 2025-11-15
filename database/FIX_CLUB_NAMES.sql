-- =====================================================
-- FIX CLUB NAME SPELLING ERRORS
-- Date: 15 November 2025
-- =====================================================

-- 1. Check current Madhyanthar registrations (should be Madanthyar)
SELECT registration_id, name, mobile, club
FROM registrations
WHERE club = 'Madhyanthar'
ORDER BY registration_id;

-- 2. Check current Kollegal registrations (should be Kollegala)
SELECT registration_id, name, mobile, club
FROM registrations
WHERE club = 'Kollegal'
ORDER BY registration_id;

-- 3. Fix Madhyanthar → Madanthyar
UPDATE registrations 
SET club = 'Madanthyar' 
WHERE club = 'Madhyanthar';

-- 4. Fix Kollegal → Kollegala
UPDATE registrations 
SET club = 'Kollegala' 
WHERE club = 'Kollegal';

-- 5. Verify Madanthyar updates
SELECT registration_id, name, mobile, club
FROM registrations
WHERE club = 'Madanthyar'
ORDER BY registration_id;

-- 6. Verify Kollegala updates
SELECT registration_id, name, mobile, club
FROM registrations
WHERE club = 'Kollegala'
ORDER BY registration_id;

-- 7. Summary counts
SELECT 
    'Madanthyar' as club_name,
    COUNT(*) as total_registrations
FROM registrations
WHERE club = 'Madanthyar' AND payment_status != 'test'
UNION ALL
SELECT 
    'Kollegala' as club_name,
    COUNT(*) as total_registrations
FROM registrations
WHERE club = 'Kollegala' AND payment_status != 'test';
