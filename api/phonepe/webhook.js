// API: Handle PhonePe webhook callbacks
const PhonePeService = require('../../lib/phonepe');
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
    const { response } = req.body;
    const xVerifyHeader = req.headers['x-verify'];

    if (!response || !xVerifyHeader) {
      console.error('❌ Webhook missing data');
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook data'
      });
    }

    // Verify and process webhook
    const phonePe = new PhonePeService();
    const webhookResult = await phonePe.handleWebhook(response, xVerifyHeader);

    if (!webhookResult.verified) {
      console.error('❌ Webhook verification failed');
      return res.status(400).json({
        success: false,
        error: 'Webhook verification failed'
      });
    }

    const { transactionId, paymentSuccess, amount, upiId, paymentState } = webhookResult;

    console.log(`📥 Webhook received: ${transactionId} - ${paymentState}`);

    if (paymentSuccess) {
      // Update database with payment success
      await updatePaymentStatus(
        transactionId,
        {
          paymentStatus: 'completed',
          upiId: upiId || null,
          gatewayResponse: response
        }
      );

      console.log('✅ Payment webhook processed:', transactionId);

      // Send WhatsApp confirmation (TODO: implement)
      // await sendWhatsAppConfirmation(transactionId);

    } else {
      // Payment failed or pending
      await updatePaymentStatus(
        transactionId,
        {
          paymentStatus: paymentState === 'PAYMENT_PENDING' ? 'pending' : 'failed',
          gatewayResponse: response
        }
      );

      console.log(`⚠️ Payment ${paymentState}:`, transactionId);
    }

    // Always respond success to PhonePe (we processed the webhook)
    return res.status(200).json({
      success: true,
      message: 'Webhook processed'
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    
    // Still return 200 to avoid PhonePe retries
    return res.status(200).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
};
