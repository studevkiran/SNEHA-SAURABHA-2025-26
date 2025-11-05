// API: Initiate Cashfree payment
const CashfreeService = require('../../lib/cashfree');
const { createRegistration } = require('../../lib/db-functions');

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
    const {
      confirmationId,
      orderId,
      amount,
      fullName,
      mobile,
      email,
      registrationType,
      clubName,
      mealPreference,
      qrData
    } = req.body;

    // Validation
    if (!orderId || !amount || !fullName || !mobile || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: orderId, amount, fullName, mobile, email'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate mobile format (10 digits)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mobile number. Must be 10 digits starting with 6-9'
      });
    }

    // Save registration to database (payment pending)
    await createRegistration({
      confirmationId,
      registrationType,
      fullName,
      mobile,
      email,
      clubName,
      mealPreference,
      amount,
      transactionId: orderId,
      paymentStatus: 'pending',
      qrData,
      manuallyAdded: false
    });

    // Initiate Cashfree payment
    const cashfree = new CashfreeService();
    const paymentResponse = await cashfree.createOrder({
      orderId,
      orderAmount: amount,
      customerName: fullName,
      customerEmail: email,
      customerPhone: mobile
    });

    if (paymentResponse.success) {
      console.log('✅ Cashfree payment initiated:', orderId);
      
      return res.status(200).json({
        success: true,
        paymentUrl: paymentResponse.paymentUrl,
        paymentSessionId: paymentResponse.paymentSessionId,
        orderId: paymentResponse.orderId
      });
    } else {
      return res.status(400).json({
        success: false,
        error: paymentResponse.error
      });
    }

  } catch (error) {
    console.error('❌ Payment initiation error:', error);
    
    if (error.message?.includes('duplicate key')) {
      return res.status(409).json({
        success: false,
        error: 'Order already exists'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Payment initiation failed'
    });
  }
};
