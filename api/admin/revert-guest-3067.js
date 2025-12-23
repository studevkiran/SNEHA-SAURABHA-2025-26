/**
 * Revert ID 3067 back to NULL zone (guest registration)
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
    // Set zone back to NULL
    const result = await pool.query(
      'UPDATE registrations SET zone = NULL WHERE id = 3067 RETURNING id, name, club, zone'
    );

    res.status(200).json({
      success: true,
      message: 'Reverted guest to unmapped',
      registration: result.rows[0]
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
