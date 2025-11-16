// API: Delete single registration by ID
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
  const { adminPassword, registrationId } = req.body;
  if (adminPassword !== 'admin123') {
    return res.status(403).json({ error: 'Unauthorized. Invalid admin password.' });
  }

  if (!registrationId) {
    return res.status(400).json({ error: 'Registration ID is required.' });
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
      WHERE registration_id = $1;
    `;

    const check = await pool.query(checkQuery, [registrationId]);

    if (check.rows.length === 0) {
      await pool.end();
      return res.status(404).json({
        success: false,
        message: `Registration ID ${registrationId} not found.`
      });
    }

    // Delete it
    const deleteQuery = `
      DELETE FROM registrations
      WHERE registration_id = $1
      RETURNING registration_id, name, mobile;
    `;

    const result = await pool.query(deleteQuery, [registrationId]);

    await pool.end();

    return res.status(200).json({
      success: true,
      message: `Successfully deleted registration ${registrationId}`,
      deleted: result.rows[0]
    });

  } catch (error) {
    console.error('Delete error:', error);
    await pool.end();
    return res.status(500).json({
      success: false,
      error: 'Failed to delete registration',
      details: error.message
    });
  }
};
