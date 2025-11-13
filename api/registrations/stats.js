// API: Get dashboard statistics
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get statistics from database
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM registrations');
    const paidResult = await pool.query(`SELECT COUNT(*) as count FROM registrations WHERE payment_status IN ('Paid', 'SUCCESS', 'Success')`);
    const pendingResult = await pool.query(`SELECT COUNT(*) as count FROM registrations WHERE payment_status = 'Pending'`);
    const revenueResult = await pool.query(`SELECT SUM(registration_amount) as total FROM registrations WHERE payment_status IN ('Paid', 'SUCCESS', 'Success')`);

    return res.status(200).json({
      success: true,
      data: {
        totalRegistrations: parseInt(totalResult.rows[0].count) || 0,
        paidRegistrations: parseInt(paidResult.rows[0].count) || 0,
        pendingRegistrations: parseInt(pendingResult.rows[0].count) || 0,
        totalRevenue: parseFloat(revenueResult.rows[0].total) || 0
      }
    });

  } catch (error) {
    console.error('❌ Statistics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};
