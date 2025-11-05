// API: Create new registration
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
      registrationType,
      fullName,
      mobile,
      email,
      clubName,
      mealPreference,
      amount,
      transactionId,
      qrData,
      manuallyAdded = false
    } = req.body;

    // Validation
    if (!confirmationId || !fullName || !mobile || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Create registration
    const registration = await createRegistration({
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
      manuallyAdded
    });

    console.log('✅ Registration created:', confirmationId);

    return res.status(201).json({
      success: true,
      data: registration
    });

  } catch (error) {
    console.error('❌ Registration creation error:', error);
    
    // Handle duplicate entry
    if (error.message?.includes('duplicate key')) {
      return res.status(409).json({
        success: false,
        error: 'Registration already exists'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
