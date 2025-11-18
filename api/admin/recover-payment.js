// API: Manual registration recovery
// Use: POST /api/admin/recover-payment
// Body: { orderId, transactionId }

const { Pool } = require('pg');
const { Cashfree } = require('cashfree-pg');

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

  const { orderId, transactionId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID required' });
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log(`🔧 Manual recovery for order: ${orderId}`);

    // 1. Check payment attempt
    const attemptResult = await pool.query(
      'SELECT * FROM payment_attempts WHERE order_id = $1',
      [orderId]
    );

    if (attemptResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment attempt not found in database' 
      });
    }

    const attempt = attemptResult.rows[0];
    console.log('📋 Found payment attempt:', attempt.name, attempt.mobile);

    // 2. Check if registration already exists
    const regCheck = await pool.query(
      'SELECT * FROM registrations WHERE order_id = $1',
      [orderId]
    );

    if (regCheck.rows.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Registration already exists',
        registration: regCheck.rows[0]
      });
    }

    // 3. Verify payment with Cashfree
    const cashfree = new Cashfree({
      env: process.env.CASHFREE_ENV || 'production',
      appId: process.env.CASHFREE_APP_ID,
      secretKey: process.env.CASHFREE_SECRET_KEY
    });

    let paymentStatus = 'SUCCESS';
    let txnId = transactionId;

    try {
      const orderStatus = await cashfree.getOrderStatus(orderId);
      paymentStatus = orderStatus.order_status;
      
      if (orderStatus.payment && orderStatus.payment.cf_payment_id) {
        txnId = txnId || orderStatus.payment.cf_payment_id;
      }
      
      console.log('💳 Cashfree status:', paymentStatus);
    } catch (err) {
      console.warn('⚠️ Could not verify with Cashfree, using provided data');
    }

    if (paymentStatus !== 'PAID' && paymentStatus !== 'SUCCESS') {
      return res.status(400).json({
        success: false,
        error: `Payment not successful. Status: ${paymentStatus}`
      });
    }

    // 4. Generate registration ID
    const prefix = 'SSDC';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const registrationId = `${prefix}${timestamp}${random}`;

    // 5. Create registration
    const insertResult = await pool.query(
      `INSERT INTO registrations (
        registration_id, name, mobile, email, club, zone, zone_ag_name, zone_ag_mobile,
        registration_type, meal_preference, tshirt_size, accommodation,
        order_id, amount, payment_status, transaction_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      RETURNING *`,
      [
        registrationId,
        attempt.name,
        attempt.mobile,
        attempt.email,
        attempt.club,
        attempt.zone,
        attempt.zone_ag_name,
        attempt.zone_ag_mobile,
        attempt.registration_type,
        attempt.meal_preference,
        attempt.tshirt_size,
        attempt.accommodation || false,
        orderId,
        attempt.amount,
        'SUCCESS',
        txnId
      ]
    );

    // 6. Update payment attempt
    await pool.query(
      'UPDATE payment_attempts SET payment_status = $1, registration_id = $2, updated_at = NOW() WHERE order_id = $3',
      ['SUCCESS', registrationId, orderId]
    );

    const registration = insertResult.rows[0];
    console.log('✅ Registration created:', registrationId);

    // 7. Trigger WhatsApp (async, don't wait)
    setTimeout(async () => {
      try {
        const response = await fetch('https://sneha2026.in/api/send-whatsapp-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            registration_id: registrationId,
            order_id: orderId 
          })
        });
        console.log('📱 WhatsApp triggered:', response.ok);
      } catch (err) {
        console.error('❌ WhatsApp error:', err.message);
      }
    }, 1000);

    return res.status(200).json({
      success: true,
      message: 'Registration recovered successfully',
      registration: {
        registration_id: registrationId,
        name: registration.name,
        mobile: registration.mobile,
        email: registration.email,
        amount: registration.amount
      }
    });

  } catch (error) {
    console.error('❌ Recovery error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    await pool.end();
  }
};
