const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check for RAC IDs
    const racResult = await pool.query(
      `SELECT registration_id, name, registration_type 
       FROM registrations 
       WHERE registration_id LIKE 'RAC54V%' 
       ORDER BY registration_id`
    );
    
    // Check for 2026RTY IDs
    const rtyResult = await pool.query(
      `SELECT registration_id, name, registration_type 
       FROM registrations 
       WHERE registration_id LIKE '2026RTY%' 
       ORDER BY registration_id`
    );
    
    return res.status(200).json({
      rac_ids: racResult.rows,
      rty_ids: rtyResult.rows,
      rac_count: racResult.rows.length,
      rty_count: rtyResult.rows.length
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Query failed',
      details: error.message 
    });
  }
};
