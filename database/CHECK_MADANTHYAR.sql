-- =====================================================
-- CHECK MADANTHYAR CLUB NAME VARIATIONS
-- Date: 15 November 2025
-- =====================================================

-- Check the 3 specific registrations
SELECT registration_id, name, mobile, club, registration_type
FROM registrations 
WHERE registration_id IN ('2026RTY0192', '2026RTY0194', '2026RTY0485')
ORDER BY registration_id;

-- Check all variations of Madanthyar in database
SELECT DISTINCT club, COUNT(*) as count
FROM registrations
WHERE club ILIKE '%madanthyar%' OR club ILIKE '%madantyar%'
GROUP BY club
ORDER BY club;

-- Check if there are any similar club names
SELECT DISTINCT club
FROM registrations
WHERE club LIKE 'M%' AND club NOT LIKE 'Mysore%'
ORDER BY club;
