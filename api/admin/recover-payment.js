// API: Manual registration recovery
// Use: POST /api/admin/recover-payment
// Body: { orderId, transactionId }

const { 
  getPaymentAttempt,
  createConfirmedRegistration 
} = require('../../lib/db-neon');
const CashfreeService = require('../../lib/cashfree');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, transactionId } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, error: 'Order ID required' });
  }

  try {
    console.log(`🔧 Manual recovery for order: ${orderId}`);

    // 1. Check payment attempt
    const attempt = await getPaymentAttempt(orderId);

    if (!attempt) {
      return res.status(404).json({ 
        success: false, 
        error: 'Payment attempt not found in database' 
      });
    }

    console.log('📋 Found payment attempt:', attempt.name, attempt.mobile);

    // 2. Check if registration already exists
    if (attempt.payment_status === 'SUCCESS' && attempt.registration_id) {
      return res.status(200).json({
        success: true,
        message: 'Registration already exists',
        registration: {
          registration_id: attempt.registration_id,
          name: attempt.name,
          mobile: attempt.mobile,
          email: attempt.email,
          amount: attempt.amount
        }
      });
    }

    // 3. Verify payment with Cashfree
    const cashfree = new CashfreeService();
    let paymentStatus = 'PAID';
    let txnId = transactionId;

    try {
      const orderStatus = await cashfree.getOrderStatus(orderId);
      paymentStatus = orderStatus.order_status;
      
      if (orderStatus.payment && orderStatus.payment.cf_payment_id) {
        txnId = txnId || orderStatus.payment.cf_payment_id;
      }
      
      console.log('💳 Cashfree status:', paymentStatus);
    } catch (err) {
      console.warn('⚠️ Could not verify with Cashfree, using provided data');
    }

    if (paymentStatus !== 'PAID' && paymentStatus !== 'SUCCESS') {
      return res.status(400).json({
        success: false,
        error: `Payment not successful. Status: ${paymentStatus}`
      });
    }

    // 4. Create confirmed registration
    console.log('🎫 Creating confirmed registration...');
    const confirmResult = await createConfirmedRegistration(orderId, txnId);

    if (!confirmResult || !confirmResult.success) {
      throw new Error('Failed to create registration');
    }

    const registration = confirmResult.registration;
    console.log('✅ Registration created:', registration.registration_id);

    // 5. Trigger WhatsApp (async, don't wait)
    setTimeout(async () => {
      try {
        const response = await fetch('https://sneha2026.in/api/send-whatsapp-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            registration_id: registration.registration_id,
            order_id: orderId 
          })
        });
        console.log('📱 WhatsApp triggered:', response.ok);
      } catch (err) {
        console.error('❌ WhatsApp error:', err.message);
      }
    }, 1000);

    return res.status(200).json({
      success: true,
      message: 'Registration recovered successfully',
      registration: {
        registration_id: registration.registration_id,
        name: registration.name,
        mobile: registration.mobile,
        email: registration.email,
        amount: registration.amount
      }
    });

  } catch (error) {
    console.error('❌ Recovery error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
