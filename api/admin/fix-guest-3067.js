/**
 * Fix orphaned guest registration (ID 3067)
 * Has club_id = 23 (doesn't exist) and should have NULL zone
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

  try {
    // Check current state
    const before = await pool.query(
      'SELECT id, name, club, club_id, zone FROM registrations WHERE id = 3067'
    );

    if (before.rows.length === 0) {
      return res.status(404).json({ error: 'Registration 3067 not found' });
    }

    const reg = before.rows[0];
    console.log('Before:', reg);

    // Fix: Set club_id to NULL and zone to NULL for guest
    const result = await pool.query(
      'UPDATE registrations SET club_id = NULL, zone = NULL WHERE id = 3067 RETURNING *'
    );

    const after = result.rows[0];
    console.log('After:', after);

    res.status(200).json({
      success: true,
      message: 'Fixed guest registration 3067',
      before: {
        club_id: reg.club_id,
        zone: reg.zone
      },
      after: {
        club_id: after.club_id,
        zone: after.zone
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
