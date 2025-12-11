/**
 * API: Fix Bajpe registration club_id
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
    console.log('🔧 Fixing Bajpe registration...');
    
    // Update club_id from 2 (Baikampady) to 3 (Bajpe)
    const result = await pool.query(
      `UPDATE registrations 
       SET club_id = 3 
       WHERE registration_id = '2026RTY0794' 
       RETURNING registration_id, name, club, club_id`
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }
    
    // Verify the zone after update
    const verifyResult = await pool.query(
      `SELECT r.registration_id, r.name, r.club, r.club_id, c.zone
       FROM registrations r
       LEFT JOIN clubs c ON r.club_id = c.id
       WHERE r.registration_id = '2026RTY0794'`
    );
    
    return res.status(200).json({
      success: true,
      updated: result.rows[0],
      verification: verifyResult.rows[0],
      message: 'Bajpe registration fixed: club_id 2 → 3 (Zone 2A → Zone 1)'
    });
    
  } catch (error) {
    console.error('Fix error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
