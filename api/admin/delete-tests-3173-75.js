/**
 * Delete specific test registrations by IDs
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
    // Delete test registrations (IDs 3173, 3174, 3175)
    const testIds = [3173, 3174, 3175];
    
    // First get their order_ids
    const orderResult = await pool.query(
      'SELECT id, order_id, registration_id, club, zone FROM registrations WHERE id = ANY($1)',
      [testIds]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Test registrations not found'
      });
    }
    
    const orderIds = orderResult.rows.map(r => r.order_id);
    
    console.log('Deleting test registrations:', orderResult.rows);
    
    // Delete from registrations
    const deleteReg = await pool.query(
      'DELETE FROM registrations WHERE id = ANY($1) RETURNING id, registration_id, club, zone',
      [testIds]
    );
    
    // Delete from payment_attempts
    const deleteAttempts = await pool.query(
      'DELETE FROM payment_attempts WHERE order_id = ANY($1) RETURNING order_id',
      [orderIds]
    );

    res.status(200).json({
      success: true,
      message: `Deleted ${deleteReg.rowCount} test registrations`,
      deleted: {
        registrations: deleteReg.rows,
        payment_attempts: deleteAttempts.rowCount
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
