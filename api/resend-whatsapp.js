// API to resend WhatsApp confirmation
const { query } = require('../lib/db-neon');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { registration_id, order_id } = req.body;

    if (!registration_id && !order_id) {
      return res.status(400).json({
        success: false,
        error: 'Either registration_id or order_id is required'
      });
    }

    console.log('📲 Resending WhatsApp for:', { registration_id, order_id });

    // Fetch registration details
    let registration;
    if (registration_id) {
      const result = await query(
        'SELECT * FROM registrations WHERE registration_id = $1',
        [registration_id]
      );
      registration = result.rows[0];
    } else {
      const result = await query(
        'SELECT * FROM registrations WHERE order_id = $1',
        [order_id]
      );
      registration = result.rows[0];
    }

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    // Check if payment is completed (handle various statuses - case insensitive)
    const paymentStatus = (registration.payment_status || '').toLowerCase();
    const validStatuses = [
      'success',      // Webhook/API created
      'paid',         // Alternative success status
      'manual',       // Generic manual
      'manual-s',     // Manual - Sneha (mallige2830)
      'manual-b',     // Manual - Bangalore (asha1990)
      'manual-p',     // Manual - Prahlad (prahlad1966)
      'imported',     // Imported from Excel
      'test'          // Test entries
    ];
    
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        error: `Cannot resend WhatsApp for payment status: ${registration.payment_status}. Only completed payments can receive WhatsApp confirmation.`
      });
    }
    
    console.log('✅ Payment status check passed:', registration.payment_status);

    // Call the send-whatsapp-confirmation API internally
    const whatsappPayload = {
      name: registration.name,
      mobile: registration.mobile,
      email: registration.email || 'Not Provided',
      registrationId: registration.registration_id,
      registrationType: registration.registration_type,
      amount: parseFloat(registration.registration_amount || 0),
      mealPreference: registration.meal_preference,
      tshirtSize: registration.tshirt_size,
      clubName: registration.club,
      orderId: registration.order_id
    };

    console.log('📤 Calling WhatsApp API with payload:', whatsappPayload);

    // Call WhatsApp API using fetch
    const whatsappResponse = await fetch('https://sneha2026.in/api/send-whatsapp-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(whatsappPayload)
    });

    const whatsappResult = await whatsappResponse.json();

    if (whatsappResponse.ok && whatsappResult.success) {
      console.log('✅ WhatsApp sent successfully to:', registration.mobile);
      
      return res.status(200).json({
        success: true,
        message: 'WhatsApp confirmation sent successfully',
        registration_id: registration.registration_id,
        mobile: registration.mobile
      });
    } else {
      console.error('❌ WhatsApp sending failed:', whatsappResult);
      return res.status(500).json({
        success: false,
        error: whatsappResult.message || 'Failed to send WhatsApp'
      });
    }

  } catch (error) {
    console.error('❌ Error resending WhatsApp:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to resend WhatsApp'
    });
  }
};
