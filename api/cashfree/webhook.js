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
      await createConfirmedRegistration(orderId, transactionId);
      console.log('✅ Webhook: Confirmed registration created');

      // TODO: Send WhatsApp confirmation
      // await sendWhatsAppConfirmation(orderId);

      // TODO: Send email confirmation
      // await sendEmailConfirmation(orderId);

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
