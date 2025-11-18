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
    
    // NEW FORMAT (2023-08-01): Uses x-webhook-signature header
    const signature = req.headers['x-webhook-signature'] || 
                     req.headers['x-cashfree-signature'] || 
                     req.body.signature;
    
    // NEW FORMAT: Also includes timestamp
    const timestamp = req.headers['x-webhook-timestamp'];
    const version = req.headers['x-webhook-version'];

    console.log('📥 Webhook received:', {
      version,
      hasSignature: !!signature,
      hasTimestamp: !!timestamp,
      orderId: payload?.data?.order?.order_id || payload?.order_id || 'unknown'
    });

    if (!payload || !signature) {
      console.error('❌ Webhook missing data or signature');
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook data'
      });
    }

    // For new format (2023-08-01), verify signature differently
    const cashfree = new CashfreeService();
    
    let webhookResult;
    if (version === '2023-08-01') {
      // New format: signature is computed from raw body + timestamp
      console.log('🆕 Verifying new format webhook (2023-08-01)');
      
      // For new format, we verify by recomputing the signature
      // Cashfree sends: HMAC-SHA256(rawPostData + timestamp, secret_key)
      const crypto = require('crypto');
      const rawBody = JSON.stringify(payload);
      const signatureData = rawBody + timestamp;
      
      const computedSignature = crypto
        .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
        .update(signatureData)
        .digest('base64');
      
      const verified = computedSignature === signature;
      
      console.log(verified ? '✅ Signature verified' : '❌ Signature mismatch');
      
      if (!verified) {
        console.error('❌ Signature verification failed');
        console.log('Expected:', computedSignature);
        console.log('Received:', signature);
        return res.status(400).json({
          success: false,
          error: 'Webhook signature verification failed'
        });
      }
      
      // Parse the new format webhook
      webhookResult = await cashfree.handleWebhook(payload, signature);
      webhookResult.verified = verified;
      
    } else {
      // Old format: use existing verification
      console.log('📜 Verifying old format webhook');
      webhookResult = await cashfree.handleWebhook(payload, signature);
    }

    if (!webhookResult.verified) {
      console.error('❌ Webhook verification failed');
      return res.status(400).json({
        success: false,
        error: 'Webhook verification failed'
      });
    }

    const { orderId, paymentSuccess, orderAmount, transactionId, orderStatus, paymentMethod, upiId } = webhookResult;

    console.log(`📥 Webhook received: ${orderId} - ${orderStatus} - ${paymentMethod}`);

    if (paymentSuccess) {
      console.log('✅ Payment successful via webhook');
      console.log('💳 Transaction ID:', transactionId);
      console.log('💰 UPI ID:', upiId || 'N/A');
      
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
      const confirmResult = await createConfirmedRegistration(orderId, transactionId, upiId);
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
          const baseUrl = 'https://sneha2026.in';
          const confirmationLink = `${baseUrl}/index.html?payment=success&order_id=${registration.registration_id}`;
          const receiptNo = transactionId || registration.registration_id;
          
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
    
    // Return 500 to trigger Cashfree retry mechanism
    // This ensures payment is not lost if registration fails
    return res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
};
