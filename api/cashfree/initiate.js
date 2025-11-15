// API: Initiate Cashfree payment
const CashfreeService = require('../../lib/cashfree');
const { createPaymentAttempt } = require('../../lib/db-neon');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Helper function to generate a unique confirmation ID
function generateConfirmationId(prefix = 'REG', clubId = 0) {
    const timestamp = Date.now().toString(); // Ensures uniqueness over time
    const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // Prevents collisions in the same millisecond
    const clubPart = (clubId || 0).toString().padStart(2, '0'); // Adds context

    // Format: PREFIX + CLUB_ID + last 6 digits of timestamp + 3 random digits (e.g., ROT01123456789)
    return `${prefix}${clubPart}${timestamp.slice(-6)}${randomPart}`;
}

const registrationPrices = {
    'rotarian': 5000,
    'rotarian-spouse': 8000,
    'ann': 4000,
    'annet': 2000,
    'innerwheel': 3500,
    'guest': 5000,
    'rotaractor': 2500,
    'silver-donor': 20000,
    'silver-sponsor': 25000,
    'gold-sponsor': 50000,
    'platinum-sponsor': 75000,
    'patron-sponsor': 100000
};

const VALID_COUPONS = {
    'TEST1': {
        type: 'fixed',
        value: 1,
        description: 'Sets the price to ₹1 for testing purposes.'
    }
};

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
      orderId,
      fullName,
      mobile,
      email,
      registrationType,
      couponCode,
      clubName,
      clubId,
      mealPreference,
      tshirtSize
    } = req.body;

    console.log('📥 Payment initiation request received:', {
      orderId,
      fullName,
      mobile,
      email,
      registrationType
    });

    // Validation
    if (!orderId || !fullName || !mobile) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: orderId, fullName, mobile'
      });
    }

    // Price calculation
    const normalizedRegType = (registrationType || '').toLowerCase().replace(/\s+/g, '-');
    let amount = registrationPrices[normalizedRegType];

    if (amount === undefined) {
        return res.status(400).json({ success: false, error: 'Invalid registration type provided.' });
    }

    if (couponCode) {
        const coupon = VALID_COUPONS[couponCode.toUpperCase()];
        if (coupon) {
            amount = coupon.value;
            console.log(`Applied coupon ${couponCode}, new price: ${amount}`);
        }
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
      'rotaractor': 'RAC', // Corrected prefix
      'silver-donor': 'SD',
      'silver-sponsor': 'SS',
      'gold-sponsor': 'GS',
      'platinum-sponsor': 'PS',
      'patron-sponsor': 'PAT'
    };
    
    // Normalize registration type to lowercase for matching
    const normalizedType = (registrationType || '').toLowerCase().replace(/\s+/g, '-');
    const prefix = typePrefixes[normalizedType] || 'SS';
    
    const confirmationId = generateConfirmationId(prefix, clubId);
    const qrData = JSON.stringify({
        id: confirmationId,
        name: fullName,
        type: registrationType,
        mobile: mobile
    });

    console.log('🎫 Generated Confirmation ID:', confirmationId);

    // Check if this Order ID already exists (retry scenario)
    console.log('🔍 Checking if Order ID already exists:', orderId);
    
    // Create payment attempt (or check if exists)
    const attemptResult = await createPaymentAttempt({
      orderId,
      confirmationId, // Store the generated ID
      name: fullName,
      mobile,
      email: email || 'Not Provided',
      clubName,
      clubId,
      registrationType,
      amount,
      mealPreference,
      tshirtSize,
      qrData // Store the generated QR data
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
