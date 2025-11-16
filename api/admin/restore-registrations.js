// Restore 3 Rotaractor registrations with correct IDs
const { Pool } = require('pg');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { adminPassword } = req.body;

  if (adminPassword !== 'admin123') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const registrations = [];

    // 1. Prajwal → RAC54V0690
    const reg1 = await pool.query(`
      INSERT INTO registrations (
        registration_id, order_id, name, email, mobile, club, club_id,
        registration_type, registration_amount, meal_preference, 
        payment_status, payment_method, transaction_id, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()
      ) RETURNING *
    `, [
      'RAC54V0690', 'ORDER_1763264962774_432', 'DRR Rtr Rtn Prajwal R',
      'rtrprajwal@gmail.com', '9164734985', 'Mysore', 0,
      'Rotaractor', 2400, 'Veg', 'success', 'Cashfree', 
      'ORDER_1763264962774_432'
    ]);
    registrations.push(reg1.rows[0]);

    // 2. Sumuk → RAC54V0691
    const reg2 = await pool.query(`
      INSERT INTO registrations (
        registration_id, order_id, name, email, mobile, club, club_id,
        registration_type, registration_amount, meal_preference, 
        payment_status, payment_method, transaction_id, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()
      ) RETURNING *
    `, [
      'RAC54V0691', 'ORDER_1763265922613_046', 'Rtr Rtn Sumuk Bharadwaj KS',
      'rtnsumukbharadwaj3181@gmail.com', '8553590814', 'Mysore', 0,
      'Rotaractor', 2400, 'Veg', 'success', 'Cashfree',
      'ORDER_1763265922613_046'
    ]);
    registrations.push(reg2.rows[0]);

    // 3. Jeswanthdhar → RAC54V0692
    const reg3 = await pool.query(`
      INSERT INTO registrations (
        registration_id, order_id, name, email, mobile, club, club_id,
        registration_type, registration_amount, meal_preference, 
        payment_status, payment_method, transaction_id, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()
      ) RETURNING *
    `, [
      'RAC54V0692', 'ORDER_1763266000000_047', 'Rtr Rtn Jeswanthdhar C',
      'rtr.rtn.jeswanthdhar@gmail.com', '9901330544', 'Mysore', 0,
      'Rotaractor', 2400, 'Non-Veg', 'success', 'Cashfree',
      'ORDER_1763266000000_047'
    ]);
    registrations.push(reg3.rows[0]);

    await pool.end();

    return res.status(200).json({
      success: true,
      message: 'Successfully restored 3 registrations',
      registrations: registrations.map(r => ({
        registration_id: r.registration_id,
        name: r.name,
        mobile: r.mobile,
        email: r.email
      })),
      nextId: 'RAC54V0693'
    });

  } catch (error) {
    console.error('Error restoring registrations:', error);
    await pool.end();
    return res.status(500).json({
      success: false,
      error: error.message,
      detail: error.detail
    });
  }
};
