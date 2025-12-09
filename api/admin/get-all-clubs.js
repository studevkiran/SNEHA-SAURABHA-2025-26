/**
 * API: Get all club IDs and names from database
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const result = await pool.query(
      'SELECT id, name, zone FROM clubs ORDER BY id'
    );
    
    // Check specifically for ID 23
    const club23 = result.rows.find(c => c.id === 23);
    const kadabaTown = result.rows.find(c => c.name === 'Kadaba Town');
    
    return res.status(200).json({
      success: true,
      total_clubs: result.rows.length,
      club_id_23: club23 || 'NOT FOUND',
      kadaba_town: kadabaTown || 'NOT FOUND',
      all_clubs: result.rows
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
