/**
 * API: Sync clubs.json and fix all registration club_ids
 * This fixes the data integrity issue where website clubs.json has wrong IDs
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔧 Starting data integrity fix...');
    
    // Get all clubs from database (source of truth)
    const dbClubsResult = await pool.query('SELECT id, name, zone FROM clubs ORDER BY name');
    const dbClubs = dbClubsResult.rows;
    
    // Create lookup: club name → correct club_id
    const nameToCorrectId = {};
    dbClubs.forEach(club => {
      nameToCorrectId[club.name] = club.id;
    });
    
    // Get all registrations that need fixing
    const registrationsResult = await pool.query(`
      SELECT registration_id, club, club_id 
      FROM registrations 
      WHERE payment_status != 'test'
    `);
    
    const registrations = registrationsResult.rows;
    const updates = [];
    const errors = [];
    
    // Find registrations with wrong club_ids
    for (const reg of registrations) {
      const clubName = reg.club;
      const currentClubId = reg.club_id;
      const correctClubId = nameToCorrectId[clubName];
      
      if (!correctClubId) {
        errors.push({
          registration_id: reg.registration_id,
          club: clubName,
          error: 'Club not found in database'
        });
        continue;
      }
      
      if (currentClubId !== correctClubId) {
        updates.push({
          registration_id: reg.registration_id,
          club: clubName,
          old_club_id: currentClubId,
          new_club_id: correctClubId
        });
      }
    }
    
    console.log(`Found ${updates.length} registrations needing club_id updates`);
    
    // Update registrations in batches
    let updated = 0;
    for (const update of updates) {
      try {
        await pool.query(
          'UPDATE registrations SET club_id = $1 WHERE registration_id = $2',
          [update.new_club_id, update.registration_id]
        );
        updated++;
      } catch (err) {
        errors.push({
          registration_id: update.registration_id,
          error: err.message
        });
      }
    }
    
    // Verify: Check if any registrations still have mismatched club_ids
    const verifyResult = await pool.query(`
      SELECT r.registration_id, r.club, r.club_id, c.id as correct_id, c.zone
      FROM registrations r
      LEFT JOIN clubs c ON r.club = c.name
      WHERE r.payment_status != 'test' 
        AND r.club_id != c.id
      LIMIT 10
    `);
    
    return res.status(200).json({
      success: true,
      summary: {
        total_registrations_checked: registrations.length,
        needed_updates: updates.length,
        successfully_updated: updated,
        errors: errors.length,
        remaining_mismatches: verifyResult.rows.length
      },
      sample_updates: updates.slice(0, 10),
      remaining_issues: verifyResult.rows,
      errors: errors.slice(0, 10)
    });
    
  } catch (error) {
    console.error('Fix error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
