// API: Initiate Cashfree payment
const CashfreeService = require('../../lib/cashfree');
const { createPaymentAttempt } = require('../../lib/db-neon');
const { getZoneForClub } = require('../../lib/zone-mapping');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

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
      clubId,
      mealPreference,
      tshirtSize,
      qrData
    } = req.body;

    console.log('📥 Payment initiation request received:', {
      orderId,
      amount,
      fullName,
      mobile,
      email,
      registrationType
    });

    // Validation
    if (!orderId || !amount || !fullName || !mobile) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: orderId, amount, fullName, mobile'
      });
    }

    // Validate email format (only if provided)
    if (email && email !== 'Not Provided') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }
    }

    // Validate mobile format (10 digits)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mobile number. Must be 10 digits starting with 6-9'
      });
    }

    // Generate confirmation ID with proper prefix
    const typePrefixes = {
      'rotarian': 'ROT',
      'rotarian-spouse': 'RS',
      'ann': 'ANN',
      'annet': 'ANT',
      'guest': 'GST',
      'rotaractor': 'ANT',
      'silver-donor': 'SD',
      'silver-sponsor': 'SS',
      'gold-sponsor': 'GS',
      'platinum-sponsor': 'PS',
      'patron-sponsor': 'PAT'
    };
    
    // Normalize registration type to lowercase for matching
    const normalizedType = (registrationType || '').toLowerCase().replace(/\s+/g, '-');
    const prefix = typePrefixes[normalizedType] || 'SS';
    
    console.log('🎫 Registration Type:', registrationType, '→ Normalized:', normalizedType, '→ Prefix:', prefix);

    // Check if this Order ID already exists (retry scenario)
    console.log('🔍 Checking if Order ID already exists:', orderId);
    
    // Get zone from club name
    const zone = getZoneForClub(clubName);
    
    // Create payment attempt (or check if exists)
    const attemptResult = await createPaymentAttempt({
      orderId,
      name: fullName,
      mobile,
      email: email || 'Not Provided',
      clubName,
      clubId,
      zone,
      registrationType,
      amount,
      mealPreference,
      tshirtSize
    });
    
    if (!attemptResult.success) {
      if (attemptResult.error === 'ALREADY_PAID') {
        console.log('✅ This order was already paid successfully');
        return res.status(200).json({
          success: true,
          alreadyPaid: true,
          message: attemptResult.message
        });
      }
      throw new Error(attemptResult.error);
    }
    
    if (attemptResult.retry) {
      console.log('♻️ Allowing retry for existing failed/pending order');
    } else {
      console.log('✅ Payment attempt created:', orderId);
    }

    // Initiate Cashfree payment
    console.log('💳 Initiating Cashfree payment...');
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
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error.message?.includes('duplicate key')) {
      return res.status(409).json({
        success: false,
        error: 'Order already exists'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Payment initiation failed',
      details: error.message // Add error message to response for debugging
    });
  }
};
