// API: Handle Cashfree webhook callbacks
const CashfreeService = require('../../lib/cashfree');
const { 
  getPaymentAttempt,
  createConfirmedRegistration,
  updatePaymentAttemptStatus 
} = require('../../lib/db-neon');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    const signature = req.headers['x-cashfree-signature'] || req.body.signature;

    if (!payload || !signature) {
      console.error('❌ Webhook missing data');
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook data'
      });
    }

    // Verify and process webhook
    const cashfree = new CashfreeService();
    const webhookResult = await cashfree.handleWebhook(payload, signature);

    if (!webhookResult.verified) {
      console.error('❌ Webhook verification failed');
      return res.status(400).json({
        success: false,
        error: 'Webhook verification failed'
      });
    }

    const { orderId, paymentSuccess, orderAmount, transactionId, orderStatus, paymentMethod } = webhookResult;

    console.log(`📥 Webhook received: ${orderId} - ${orderStatus}`);

    if (paymentSuccess) {
      console.log('✅ Payment successful via webhook');
      
      // Check if already processed
      const attempt = await getPaymentAttempt(orderId);
      
      if (!attempt) {
        console.error('❌ Payment attempt not found:', orderId);
        return res.status(200).json({ success: true, message: 'Attempt not found' });
      }
      
      if (attempt.payment_status === 'SUCCESS') {
        console.log('⚠️ Payment already processed, skipping');
        return res.status(200).json({ success: true, message: 'Already processed' });
      }
      
      // Create confirmed registration (generates registration ID)
      console.log('🎫 Creating confirmed registration via webhook...');
      const confirmResult = await createConfirmedRegistration(orderId, transactionId);
      console.log('✅ Webhook: Confirmed registration created');

      // Send WhatsApp confirmation via Infobip
      if (confirmResult && confirmResult.success && confirmResult.registration) {
        try {
          const registration = confirmResult.registration;
          console.log('📱 Preparing WhatsApp message for:', registration.mobile);
          
          // Format phone number
          let phoneNumber = registration.mobile.toString().replace(/\D/g, '');
          if (!phoneNumber.startsWith('91')) {
            phoneNumber = '91' + phoneNumber;
          }
          
          // Use Vercel URL for payment callback format
          const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://sneha2026.in';
          const confirmationLink = `${baseUrl}/index.html?payment=success&order_id=${registration.registration_id}`;
          const receiptNo = transactionId || registration.registration_id;
          
          const messageData = {
            messages: [{
              from: process.env.INFOBIP_WHATSAPP_NUMBER || '917892045223',
              to: phoneNumber,
              messageId: `reg-${registration.registration_id}-${Date.now()}`,
              content: {
                templateName: 'registration_confirmation_v2',
                templateData: {
                  header: {
                    type: 'IMAGE',
                    mediaUrl: 'https://res.cloudinary.com/dnai1dz03/image/upload/v1763028752/WhatsApp_Image_2025-11-13_at_09.00.02_ny0cn9.jpg'
                  },
                  body: {
                    placeholders: [
                      registration.name,
                      registration.registration_id,
                      receiptNo,
                      registration.name,
                      phoneNumber,
                      registration.email || 'Not Provided',
                      registration.meal_preference || 'Veg',
                      registration.registration_amount ? registration.registration_amount.toLocaleString('en-IN') : '0',
                      confirmationLink
                    ]
                  }
                },
                language: 'en'
              }
            }]
          };
          
          console.log('📤 Sending WhatsApp to:', phoneNumber);
          
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
          console.log('📥 WhatsApp Response:', whatsappResponse.status, JSON.stringify(whatsappResult, null, 2));
          
          if (whatsappResponse.ok) {
            console.log('✅ WhatsApp sent successfully via webhook!');
          } else {
            console.error('❌ WhatsApp failed:', whatsappResult);
          }
          
        } catch (whatsappError) {
          console.error('❌ WhatsApp error in webhook:', whatsappError.message);
        }
      }

    } else if (orderStatus === 'FAILED' || orderStatus === 'CANCELLED') {
      // Payment failed
      console.log(`❌ Payment ${orderStatus}, marking as FAILED`);
      await updatePaymentAttemptStatus(orderId, 'FAILED', `Payment ${orderStatus}`);
      console.log(`✅ Payment attempt marked as FAILED:`, orderId);
      
    } else {
      // Still pending
      console.log(`⏳ Payment ${orderStatus}, keeping as Pending`);
    }

    // Always respond success to Cashfree (we processed the webhook)
    return res.status(200).json({
      success: true,
      message: 'Webhook processed'
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    
    // Still return 200 to avoid Cashfree retries
    return res.status(200).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
};
