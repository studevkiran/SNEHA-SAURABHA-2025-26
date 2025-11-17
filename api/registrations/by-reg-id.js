// API: Get registration by registration_id (e.g., 2026RTY0700)
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get registration_id from URL path
    const registration_id = req.query.id || req.url.split('/').pop().split('?')[0];

    if (!registration_id) {
      return res.status(400).json({
        success: false,
        error: 'registration_id parameter is required'
      });
    }

    console.log('🔍 Fetching registration by registration_id:', registration_id);

    // Query by registration_id
    const result = await pool.query(
      `SELECT 
        registration_id,
        order_id,
        name,
        email,
        mobile,
        club,
        zone,
        registration_type,
        registration_amount,
        meal_preference,
        tshirt_size,
        payment_status,
        payment_method,
        transaction_id,
        upi_id,
        created_at
      FROM registrations 
      WHERE registration_id = $1
      LIMIT 1`,
      [registration_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found for this registration_id'
      });
    }

    const registration = result.rows[0];

    console.log('✅ Registration found:', registration.registration_id);

    return res.status(200).json({
      success: true,
      registration: {
        registration_id: registration.registration_id,
        order_id: registration.order_id,
        name: registration.name,
        email: registration.email || 'Not Provided',
        mobile: registration.mobile,
        club: registration.club,
        zone: registration.zone,
        registration_type: registration.registration_type,
        registration_amount: parseFloat(registration.registration_amount) || 0,
        meal_preference: registration.meal_preference,
        tshirt_size: registration.tshirt_size || 'N/A',
        payment_status: registration.payment_status,
        payment_method: registration.payment_method,
        transaction_id: registration.transaction_id,
        upi_id: registration.upi_id,
        created_at: registration.created_at
      }
    });

  } catch (error) {
    console.error('❌ Error fetching registration:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch registration'
    });
  }
};
