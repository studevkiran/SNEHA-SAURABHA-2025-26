// API: Handle Cashfree webhook callbacks
const CashfreeService = require('../../lib/cashfree');
const { updatePaymentStatus } = require('../../lib/db');

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
      // Update database with payment success
      await updatePaymentStatus(
        orderId,
        {
          paymentStatus: 'completed',
          upiId: paymentMethod || null,
          gatewayResponse: JSON.stringify(payload)
        }
      );

      console.log('✅ Payment webhook processed:', orderId);

      // TODO: Send WhatsApp confirmation
      // await sendWhatsAppConfirmation(orderId);

      // TODO: Send email confirmation
      // await sendEmailConfirmation(orderId);

    } else {
      // Payment failed or pending
      const status = orderStatus === 'ACTIVE' ? 'pending' : 'failed';
      
      await updatePaymentStatus(
        orderId,
        {
          paymentStatus: status,
          gatewayResponse: JSON.stringify(payload)
        }
      );

      console.log(`⚠️ Payment ${orderStatus}:`, orderId);
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
