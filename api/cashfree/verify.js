// API: Verify Cashfree payment status
const CashfreeService = require('../../lib/cashfree');
const { updatePaymentStatus } = require('../../lib/db-neon');

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
    const { orderId } = req.query;

    console.log('🔍 Verify payment request for:', orderId);

    if (!orderId) {
      console.error('❌ No orderId provided');
      return res.status(400).json({
        success: false,
        error: 'Order ID required'
      });
    }

    // Check payment status with Cashfree
    const cashfree = new CashfreeService();
    const statusResponse = await cashfree.verifyPayment(orderId);

    console.log('📦 Cashfree verification response:', JSON.stringify(statusResponse, null, 2));

    if (statusResponse.success && statusResponse.paymentSuccess) {
      // Update database with payment success
      await updatePaymentStatus(
        orderId,
        {
          paymentStatus: 'completed',
          upiId: statusResponse.paymentMethod || null,
          gatewayResponse: JSON.stringify(statusResponse.response)
        }
      );

      console.log('✅ Payment verified and updated:', orderId);

      return res.status(200).json({
        success: true,
        paymentSuccess: true,
        paymentStatus: 'PAID',
        orderId,
        amount: statusResponse.orderAmount,
        transactionId: statusResponse.transactionId,
        paymentMethod: statusResponse.paymentMethod,
        paymentTime: statusResponse.paymentTime
      });

    } else if (statusResponse.success && !statusResponse.paymentSuccess) {
      // Payment pending or failed
      console.log('⏳ Payment not yet successful. Status:', statusResponse.status);
      return res.status(200).json({
        success: true,
        paymentSuccess: false,
        status: statusResponse.status,
        orderId
      });

    } else {
      console.error('❌ Verification failed:', statusResponse.error);
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
