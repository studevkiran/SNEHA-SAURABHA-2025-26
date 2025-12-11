/**
 * API: Fix specific unmapped registrations
 * Updates club_ids for registrations that got wrong IDs from cached clubs.json
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
    console.log('🔧 Fixing unmapped registrations...');
    
    // Define the fixes
    const fixes = [
      { id: '2026RTY0787', club: 'Somwarpet Hills', correct_club_id: 114 },
      { id: '2026RTY0784', club: 'Ivory City Mysuru', correct_club_id: 98 },
      { id: '2026RTY0794', club: 'Bajpe', correct_club_id: 3 }
    ];
    
    const results = [];
    
    for (const fix of fixes) {
      const result = await pool.query(
        `UPDATE registrations 
         SET club_id = $1 
         WHERE registration_id = $2 
         RETURNING registration_id, name, club, club_id`,
        [fix.correct_club_id, fix.id]
      );
      
      if (result.rows.length > 0) {
        results.push({
          success: true,
          ...result.rows[0]
        });
      } else {
        results.push({
          success: false,
          registration_id: fix.id,
          error: 'Not found'
        });
      }
    }
    
    // Verify zones after update
    const verifyResult = await pool.query(
      `SELECT r.registration_id, r.name, r.club, r.club_id, c.zone
       FROM registrations r
       LEFT JOIN clubs c ON r.club_id = c.id
       WHERE r.registration_id IN ($1, $2)`,
      ['2026RTY0787', '2026RTY0784']
    );
    
    return res.status(200).json({
      success: true,
      updated: results,
      verification: verifyResult.rows
    });
    
  } catch (error) {
    console.error('Fix error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
