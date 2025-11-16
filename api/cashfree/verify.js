// API: Verify Cashfree payment status
const CashfreeService = require('../../lib/cashfree');
const { 
  getPaymentAttempt, 
  createConfirmedRegistration,
  updatePaymentAttemptStatus 
} = require('../../lib/db-neon');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const orderId = req.query.orderId || req.query.order_id;
    if (!orderId) return res.status(400).json({ success: false, error: 'Order ID required' });

    console.log('🔍 Verifying payment for order:', orderId);
    const cashfree = new CashfreeService();
    const statusResponse = await cashfree.verifyPayment(orderId);

    // Payment SUCCESS - Create confirmed registration
    if (statusResponse.success && statusResponse.paymentSuccess) {
      console.log('✅ Payment verified as SUCCESS');
      
      // Check if already processed (avoid duplicate registration)
      const attempt = await getPaymentAttempt(orderId);
      
      if (!attempt) {
        console.error('❌ Payment attempt not found for order:', orderId);
        return res.status(404).json({
          success: false,
          error: 'Payment attempt not found. Please contact support: +91 99805 57785'
        });
      }
      
      if (attempt.payment_status === 'SUCCESS') {
        console.log('⚠️ Payment already processed, returning existing registration');
        // Get existing registration from registrations table
        const { Pool } = require('pg');
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        });
        const regResult = await pool.query(
          'SELECT * FROM registrations WHERE order_id = $1',
          [orderId]
        );
        
        if (regResult.rows.length > 0) {
          const registration = regResult.rows[0];
          return res.status(200).json({
            success: true,
            paymentSuccess: true,
            paymentStatus: 'PAID',
            orderId,
            amount: statusResponse.orderAmount,
            transactionId: statusResponse.transactionId,
            paymentMethod: statusResponse.paymentMethod,
            paymentTime: statusResponse.paymentTime,
            registration: {
              name: registration.name,
              email: registration.email,
              mobile: registration.mobile,
              clubName: registration.club,
              clubId: registration.club_id,
              registrationType: registration.registration_type,
              amount: registration.registration_amount,
              mealPreference: registration.meal_preference,
              confirmationId: registration.registration_id
            }
          });
        }
      }
      
      // Create confirmed registration (generates registration ID)
      console.log('🎫 Creating confirmed registration...');
      const confirmResult = await createConfirmedRegistration(
        orderId,
        statusResponse.transactionId
      );
      
      if (!confirmResult.success) {
        throw new Error('Failed to create confirmed registration');
      }
      
      const registration = confirmResult.registration;
      console.log('✅ Confirmed registration created:', confirmResult.registrationId);
      
      // Send WhatsApp confirmation via Infobip (direct API call)
      try {
        console.log('📱 Preparing WhatsApp message...');
        
        // Format phone number
        let phoneNumber = registration.mobile.toString().replace(/\D/g, '');
        if (!phoneNumber.startsWith('91')) {
          phoneNumber = '91' + phoneNumber;
        }
        
        // Use Vercel URL for payment callback format
        const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://sneha2026.vercel.app';
        // Use payment callback URL format instead of r.html
        const confirmationLink = `${baseUrl}/index.html?payment=success&order_id=${registration.registration_id}`;
        // Use Cashfree transaction ID as receipt number (unique payment identifier)
        const receiptNo = statusResponse.transactionId || registration.registration_id;
        
        const messageData = {
          messages: [{
            from: process.env.INFOBIP_WHATSAPP_NUMBER || '917892045223',
            to: phoneNumber,
            messageId: `reg-${registration.registration_id}-${Date.now()}`,
            content: {
              templateName: 'registration_confirmation_v4',
              templateData: {
                header: {
                  type: 'IMAGE',
                  mediaUrl: 'https://res.cloudinary.com/dnai1dz03/image/upload/v1763028752/WhatsApp_Image_2025-11-13_at_09.00.02_ny0cn9.jpg'
                },
                body: {
                  placeholders: [
                    registration.name,
                    registration.name,
                    phoneNumber,
                    registration.email || 'Not Provided',
                    registration.registration_type || 'Registration',
                    registration.meal_preference || 'Veg',
                    registration.tshirt_size || 'N/A',
                    registration.registration_amount.toLocaleString('en-IN'),
                    confirmationLink
                  ]
                }
              },
              language: 'en'
            }
          }]
        };
        
        console.log('📤 Sending to Infobip for:', phoneNumber);
        console.log('📋 Template data:', JSON.stringify(messageData, null, 2));
        
        // Send to Infobip and AWAIT the response
        const whatsappResponse = await fetch(`https://${process.env.INFOBIP_BASE_URL}/whatsapp/1/message/template`, {
          method: 'POST',
          headers: {
            'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(messageData)
        });
        
        const whatsappResult = await whatsappResponse.json();
        
        console.log('📥 Infobip Response Status:', whatsappResponse.status);
        console.log('📥 Infobip Response:', JSON.stringify(whatsappResult, null, 2));
        
        if (whatsappResponse.ok) {
          console.log('✅ WhatsApp sent successfully!');
        } else {
          console.error('❌ Infobip API error:', whatsappResult);
        }
        
      } catch (whatsappError) {
        console.error('❌ WhatsApp error:', whatsappError.message, whatsappError.stack);
      }
      
      return res.status(200).json({
        success: true,
        paymentSuccess: true,
        paymentStatus: 'PAID',
        orderId,
        amount: statusResponse.orderAmount,
        transactionId: statusResponse.transactionId,
        paymentMethod: statusResponse.paymentMethod,
        paymentTime: statusResponse.paymentTime,
        registration: {
          name: registration.name,
          email: registration.email,
          mobile: registration.mobile,
          clubName: registration.club,
          clubId: registration.club_id,
          registrationType: registration.registration_type,
          amount: registration.registration_amount,
          mealPreference: registration.meal_preference,
          confirmationId: registration.registration_id
        }
      });
    } 
    
    // Payment FAILED or CANCELLED
    else if (statusResponse.status === 'FAILED' || 
             statusResponse.status === 'CANCELLED' ||
             statusResponse.status === 'USER_DROPPED') {
      console.log('❌ Payment failed/cancelled:', statusResponse.status);
      
      // Update payment attempt to FAILED
      await updatePaymentAttemptStatus(
        orderId,
        'FAILED',
        statusResponse.error || 'Payment cancelled by user'
      );
      
      return res.status(200).json({
        success: false,
        paymentSuccess: false,
        status: 'FAILED',
        orderId,
        message: 'Payment was not successful. You can try registering again.'
      });
    }
    
    // Payment still PENDING
    else if (statusResponse.success) {
      console.log('⏳ Payment still pending:', statusResponse.status);
      return res.status(200).json({
        success: true,
        paymentSuccess: false,
        status: statusResponse.status,
        orderId
      });
    } 
    
    // Verification failed
    else {
      console.error('❌ Payment verification failed:', statusResponse.error);
      return res.status(400).json({
        success: false,
        error: statusResponse.error || 'Verification failed'
      });
    }
  } catch (error) {
    console.error('❌ Verify error:', error);
    return res.status(500).json({
      success: false,
      error: 'Verification failed',
      details: error.message
    });
  }
};
