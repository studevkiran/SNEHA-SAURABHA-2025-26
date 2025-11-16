// API: Delete test registrations SS00027-29
const { Pool } = require('pg');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Security: Require admin password
  const { adminPassword } = req.body;
  if (adminPassword !== 'admin123') {
    return res.status(403).json({ error: 'Unauthorized. Invalid admin password.' });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Check what we're deleting
    const checkQuery = `
      SELECT registration_id, name, mobile, email, registration_type, registration_amount
      FROM registrations
      WHERE registration_id IN ('SS00027', 'SS00028', 'SS00029')
      ORDER BY registration_id;
    `;

    const check = await pool.query(checkQuery);

    if (check.rows.length === 0) {
      await pool.end();
      return res.status(200).json({
        success: true,
        message: 'No test records found. Database already clean.',
        deleted: []
      });
    }

    // Delete them
    const deleteQuery = `
      DELETE FROM registrations
      WHERE registration_id IN ('SS00027', 'SS00028', 'SS00029')
      RETURNING registration_id, name, mobile;
    `;

    const result = await pool.query(deleteQuery);

    await pool.end();

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.rows.length} test record(s)`,
      deleted: result.rows
    });

  } catch (error) {
    console.error('Delete error:', error);
    await pool.end();
    return res.status(500).json({
      success: false,
      error: 'Failed to delete test records',
      details: error.message
    });
  }
};
