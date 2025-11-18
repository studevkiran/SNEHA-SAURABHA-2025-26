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

    // Check if payment is successful
    if (registration.payment_status !== 'SUCCESS') {
      return res.status(400).json({
        success: false,
        error: 'Can only resend WhatsApp for successful payments'
      });
    }

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

    console.log('📤 Calling WhatsApp API with:', whatsappPayload);

    // Import and call the WhatsApp confirmation handler
    const sendWhatsAppConfirmation = require('./send-whatsapp-confirmation');
    
    // Create a mock request/response to call the handler
    const mockReq = {
      method: 'POST',
      body: whatsappPayload
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          if (code === 200 && data.success) {
            return res.status(200).json({
              success: true,
              message: 'WhatsApp confirmation sent successfully',
              registration_id: registration.registration_id,
              mobile: registration.mobile
            });
          } else {
            return res.status(500).json({
              success: false,
              error: data.message || 'Failed to send WhatsApp'
            });
          }
        }
      })
    };
    
    // Call the WhatsApp handler
    await sendWhatsAppConfirmation(mockReq, mockRes);

  } catch (error) {
    console.error('❌ Error resending WhatsApp:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to resend WhatsApp'
    });
  }
};
