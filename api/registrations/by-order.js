// API: Get registration by order_id (works for Cashfree order_id OR UTR number)
const { query } = require('../../lib/db-neon');

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
    const { order_id } = req.query;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        error: 'order_id parameter is required'
      });
    }

    console.log('🔍 Fetching registration by order_id:', order_id);

    // First check if payment attempt exists but registration not created yet
    const attemptCheck = await query(
      `SELECT order_id, payment_status, amount FROM payment_attempts WHERE order_id = $1 LIMIT 1`,
      [order_id]
    );

    if (attemptCheck.rows.length > 0 && attemptCheck.rows[0].payment_status === 'SUCCESS') {
      // Payment exists but registration might not be created yet
      console.log('⚠️ Payment successful but checking registration...');
    }

    // Query by order_id (could be Cashfree order_id or UTR number)
    const result = await query(
      `SELECT 
        registration_id,
        order_id,
        name,
        email,
        mobile,
        COALESCE(club, club_name) as club,
        zone,
        registration_type,
        COALESCE(registration_amount, amount) as registration_amount,
        meal_preference,
        tshirt_size,
        payment_status,
        payment_method,
        transaction_id,
        upi_id,
        created_at
      FROM registrations 
      WHERE order_id = $1
      ORDER BY created_at DESC
      LIMIT 1`,
      [order_id]
    );

    if (result.rows.length === 0) {
      // Check if it's in payment_attempts
      if (attemptCheck.rows.length > 0) {
        return res.status(202).json({
          success: false,
          pending: true,
          message: 'Payment received. Registration is being processed. Please wait a moment and refresh.',
          order_id: order_id
        });
      }
      
      return res.status(404).json({
        success: false,
        error: 'Registration not found for this order_id'
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
