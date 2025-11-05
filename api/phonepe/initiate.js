// API: Initiate PhonePe payment
const PhonePeService = require('../../lib/phonepe');
const { createRegistration } = require('../../lib/db');

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
      transactionId,
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
    if (!transactionId || !amount || !fullName || !mobile) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
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
      transactionId,
      paymentStatus: 'pending',
      qrData,
      manuallyAdded: false
    });

    // Initiate PhonePe payment
    const phonePe = new PhonePeService();
    const paymentResponse = await phonePe.initiatePayment({
      transactionId,
      amount,
      fullName,
      mobile,
      email
    });

    if (paymentResponse.success) {
      console.log('✅ PhonePe payment initiated:', transactionId);
      
      return res.status(200).json({
        success: true,
        paymentUrl: paymentResponse.paymentUrl,
        transactionId: paymentResponse.transactionId
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
        error: 'Transaction already exists'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Payment initiation failed'
    });
  }
};
