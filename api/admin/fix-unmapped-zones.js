/**
 * API: Fix unmapped zones
 * Updates registrations with NULL zones to correct zone values
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Define the 2 registrations that need club_id fixes
    // These registrations have wrong club_id values that don't exist in clubs table
    const updates = [
      { id: '2026RTY0778', clubId: 114 },  // Somwarpet Hills → correct club_id = 114
      { id: '2026RTY0772', clubId: 98 }    // Ivory City Mysuru → correct club_id = 98
    ];
    
    const results = [];
    
    for (const { id, clubId } of updates) {
      const result = await pool.query(
        'UPDATE registrations SET club_id = $1 WHERE registration_id = $2 RETURNING registration_id, name, club, club_id',
        [clubId, id]
      );
      
      if (result.rows.length > 0) {
        results.push({
          success: true,
          ...result.rows[0]
        });
      } else {
        results.push({
          success: false,
          registration_id: id,
          error: 'Not found'
        });
      }
    }
    
    // Verify: Check if the updated registrations now have zones via JOIN
    const verifyResult = await pool.query(
      `SELECT r.registration_id, r.name, r.club, r.club_id, c.zone
       FROM registrations r
       LEFT JOIN clubs c ON r.club_id = c.id
       WHERE r.registration_id IN ('2026RTY0778', '2026RTY0772')`
    );
    
    return res.status(200).json({
      success: true,
      updated: results,
      verification: verifyResult.rows
    });
    
  } catch (error) {
    console.error('Fix unmapped zones error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
