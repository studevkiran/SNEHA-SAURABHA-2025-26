// Quick test to check order_id in database
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const result = await pool.query(
      `SELECT registration_id, order_id, name, mobile, email,
              registration_type, payment_status, payment_method, 
              transaction_id, created_at 
       FROM registrations 
       WHERE mobile = '9353469919' 
       ORDER BY created_at DESC 
       LIMIT 1`
    );
    
    return res.status(200).json({
      success: true,
      found: result.rows.length > 0,
      registration: result.rows[0] || null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
