// API: Create new registration
const { createRegistration, createPaymentLog } = require('../../lib/db-functions');

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
      name,
      email,
      mobile,
      clubName,
      registrationType,
      amount,
      mealPreference,
      orderId,
      transactionId,
      paymentStatus = 'Pending',
      paymentMethod = 'Cashfree'
    } = req.body;

    // Validation
    if (!name || !email || !mobile || !clubName || !registrationType || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mobile number'
      });
    }

    // Create registration
    const result = await createRegistration({
      name,
      email,
      mobile,
      clubName,
      registrationType,
      amount,
      mealPreference: mealPreference || 'Veg',
      paymentStatus,
      paymentMethod,
      transactionId: transactionId || null
    });
    
    // Create payment log if order ID provided
    if (orderId && result.success) {
      await createPaymentLog({
        registrationId: result.registration.registration_id,
        orderId,
        amount,
        paymentStatus,
        paymentMethod
      }).catch(err => console.error('Payment log error:', err));
    }

    return res.status(201).json({
      success: true,
      registration: result.registration,
      message: 'Registration created successfully'
    });

  } catch (error) {
    console.error('Error creating registration:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create registration'
    });
  }
};
