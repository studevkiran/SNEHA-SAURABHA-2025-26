/**
 * Delete specific test registration by ID
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
    const testId = 3176; // ID of test registration 2026RTY0838
    
    // Get order_id first
    const reg = await pool.query(
      'SELECT id, order_id, registration_id, club, name FROM registrations WHERE id = $1',
      [testId]
    );
    
    if (reg.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Test registration not found'
      });
    }
    
    const orderId = reg.rows[0].order_id;
    
    console.log('Deleting test registration:', reg.rows[0]);
    
    // Delete from registrations
    await pool.query('DELETE FROM registrations WHERE id = $1', [testId]);
    
    // Delete from payment_attempts
    await pool.query('DELETE FROM payment_attempts WHERE order_id = $1', [orderId]);

    res.status(200).json({
      success: true,
      message: 'Test registration deleted',
      deleted: reg.rows[0]
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
