// API to resend WhatsApp confirmation
const { query } = require('../lib/db-neon');
const InfobipService = require('../lib/infobip-whatsapp');

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

    // Send WhatsApp confirmation
    const infobip = new InfobipService();
    
    const whatsappData = {
      mobile: registration.mobile,
      name: `${registration.name_prefix || ''} ${registration.name}`.trim(),
      registration_id: registration.registration_id,
      amount: registration.amount,
      transaction_id: registration.transaction_id,
      registration_type: registration.registration_type
    };

    console.log('Sending WhatsApp to:', whatsappData.mobile);
    
    const whatsappResult = await infobip.sendConfirmation(whatsappData);

    if (whatsappResult.success) {
      // Update WhatsApp sent status
      await query(
        'UPDATE registrations SET whatsapp_sent = TRUE, updated_at = NOW() WHERE registration_id = $1',
        [registration.registration_id]
      );

      console.log('✅ WhatsApp resent successfully to:', whatsappData.mobile);

      return res.status(200).json({
        success: true,
        message: 'WhatsApp confirmation sent successfully',
        registration_id: registration.registration_id,
        mobile: whatsappData.mobile,
        whatsapp_status: whatsappResult
      });
    } else {
      console.error('❌ WhatsApp sending failed:', whatsappResult);
      return res.status(500).json({
        success: false,
        error: 'Failed to send WhatsApp: ' + (whatsappResult.error || 'Unknown error')
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
