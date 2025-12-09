/**
 * API: Find club IDs by name
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
      `SELECT id, name, zone FROM clubs 
       WHERE name IN ('Somwarpet Hills', 'Ivory City Mysuru') 
       ORDER BY name`
    );
    
    return res.status(200).json({
      success: true,
      clubs: result.rows
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
