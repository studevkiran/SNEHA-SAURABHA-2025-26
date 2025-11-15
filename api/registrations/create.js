// API: Create new registration
const { createRegistration, createPaymentLog } = require('../../lib/db-functions');
const { addRegistrationToSheets } = require('../../lib/db-google-sheets');
const { logRegistration } = require('../../lib/backup-logger');

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
      clubId,
      registrationType,
      amount,
      mealPreference,
      orderId,
      transactionId,
      upiId,
      paymentStatus = 'Pending',
      paymentMethod = 'Cashfree'
    } = req.body;

    // Validation
    if (!name || !mobile || !clubName || !registrationType || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Email validation (only if provided)
    if (email && email !== 'Not Provided') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }
    }

    // Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mobile number'
      });
    }

    // Prepare registration data
    const registrationData = {
      registration_id: `REG${Date.now()}`,
      order_id: orderId || '',
      name,
      email: email || 'Not Provided',
      mobile,
      club: clubName,
      club_id: clubId || '',
      registration_type: registrationType,
      registration_amount: amount,
      meal_preference: mealPreference || 'Veg',
      payment_status: paymentStatus.toLowerCase(),
      payment_method: paymentMethod,
      transaction_id: transactionId || '',
      upi_id: upiId || '',
      registration_status: paymentStatus.toLowerCase() === 'completed' ? 'verified' : 'pending',
      verified: paymentStatus.toLowerCase() === 'completed',
      manually_added: false
    };

    // 1. Save to PostgreSQL (if available)
    try {
      const result = await createRegistration({
        orderId: orderId || `ORDER_${Date.now()}`,
        name,
        email: email || 'Not Provided',
        mobile,
        clubName,
        clubId: clubId || 0,
        registrationType,
        amount,
        mealPreference: mealPreference || 'Veg',
        paymentStatus: paymentStatus || 'Pending',
        paymentMethod: paymentMethod || 'Cashfree',
        transactionId: transactionId || null,
        upiId: upiId || null
      });
      
      if (result.success && result.registration) {
        registrationData.registration_id = result.registration.registration_id;
      }
    } catch (pgError) {
      console.warn('⚠️ PostgreSQL save failed, continuing with other methods:', pgError.message);
    }

    // 2. Save to Google Sheets (primary database)
    const sheetsResult = await addRegistrationToSheets(registrationData);
    if (!sheetsResult.success) {
      console.error('❌ Google Sheets save failed:', sheetsResult.error);
    }

    // 3. Log to backup file (always, regardless of database success)
    const logResult = logRegistration(registrationData);
    if (!logResult.success) {
      console.error('❌ Backup log failed:', logResult.error);
    }

    // Create payment log if order ID provided
    if (orderId && registrationData.registration_id) {
      await createPaymentLog({
        registrationId: registrationData.registration_id,
        orderId,
        amount,
        paymentStatus,
        paymentMethod
      }).catch(err => console.error('Payment log error:', err));
    }

    return res.status(201).json({
      success: true,
      registration: {
        registration_id: registrationData.registration_id,
        name: registrationData.name,
        mobile: registrationData.mobile,
        email: registrationData.email,
        club: registrationData.club,
        registration_type: registrationData.registration_type,
        registration_amount: registrationData.registration_amount,
        meal_preference: registrationData.meal_preference,
        payment_status: registrationData.payment_status
      },
      message: 'Registration created successfully',
      saved_to: {
        google_sheets: sheetsResult.success,
        backup_log: logResult.success
      }
    });

  } catch (error) {
    console.error('Error creating registration:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create registration'
    });
  }
};
