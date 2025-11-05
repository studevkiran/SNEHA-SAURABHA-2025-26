// API: Verify PhonePe payment status
const PhonePeService = require('../../lib/phonepe');
const { updatePaymentStatus } = require('../../lib/db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transactionId } = req.query;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID required'
      });
    }

    // Check payment status with PhonePe
    const phonePe = new PhonePeService();
    const statusResponse = await phonePe.checkPaymentStatus(transactionId);

    if (statusResponse.success && statusResponse.paymentSuccess) {
      // Update database with payment success
      await updatePaymentStatus(
        transactionId,
        {
          paymentStatus: 'completed',
          upiId: statusResponse.upiId || null,
          gatewayResponse: JSON.stringify(statusResponse.response)
        }
      );

      console.log('✅ Payment verified and updated:', transactionId);

      return res.status(200).json({
        success: true,
        paymentSuccess: true,
        transactionId,
        amount: statusResponse.amount,
        upiId: statusResponse.upiId
      });

    } else if (statusResponse.success && !statusResponse.paymentSuccess) {
      // Payment pending or failed
      return res.status(200).json({
        success: true,
        paymentSuccess: false,
        status: statusResponse.status,
        message: statusResponse.message
      });

    } else {
      return res.status(400).json({
        success: false,
        error: statusResponse.error
      });
    }

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Payment verification failed'
    });
  }
};
