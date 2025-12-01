// API: Verify Cashfree payment status
const CashfreeService = require('../../lib/cashfree');
const {
  getPaymentAttempt,
  createConfirmedRegistration,
  updatePaymentAttemptStatus,
  query // Import query
} = require('../../lib/db-neon');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const orderId = req.query.orderId || req.query.order_id;
    if (!orderId) return res.status(400).json({ success: false, error: 'Order ID required' });

    console.log('🔍 Verifying payment for order:', orderId);
    const cashfree = new CashfreeService();
    const statusResponse = await cashfree.verifyPayment(orderId);

    // Payment SUCCESS - Create confirmed registration
    if (statusResponse.success && statusResponse.paymentSuccess) {
      console.log('✅ Payment verified as SUCCESS');

      // Check if already processed (avoid duplicate registration)
      const attempt = await getPaymentAttempt(orderId);

      if (!attempt) {
        console.error('❌ Payment attempt not found for order:', orderId);
        return res.status(404).json({
          success: false,
          error: 'Payment attempt not found. Please contact support: +91 99805 57785'
        });
      }

      if (attempt.payment_status === 'SUCCESS') {
        console.log('⚠️ Payment already processed, returning existing registration');
        // Get existing registration from registrations table
        const regResult = await query(
          'SELECT * FROM registrations WHERE order_id = $1',
          [orderId]
        );

        if (regResult.rows.length > 0) {
          const registration = regResult.rows[0];

          // Ensure WhatsApp is sent (in case webhook failed to send it)
          try {
            const { sendWhatsApp } = require('../../lib/whatsapp');
            console.log('📱 Verify (Existing): Triggering WhatsApp via shared lib...');
            await sendWhatsApp({
              name: registration.name,
              mobile: registration.mobile,
              email: registration.email,
              registrationId: registration.registration_id,
              registrationType: registration.registration_type,
              amount: registration.registration_amount,
              mealPreference: registration.meal_preference,
              tshirtSize: registration.tshirt_size,
              clubName: registration.club,
              orderId: registration.order_id,
              receiptNo: statusResponse.transactionId || registration.registration_id
            });
            console.log('✅ WhatsApp sent successfully (retry)!');
          } catch (whatsappError) {
            console.error('❌ WhatsApp error (retry):', whatsappError.message);
          }

          return res.status(200).json({
            success: true,
            paymentSuccess: true,
            paymentStatus: 'PAID',
            orderId,
            amount: statusResponse.orderAmount,
            transactionId: statusResponse.transactionId,
            paymentMethod: statusResponse.paymentMethod,
            paymentTime: statusResponse.paymentTime,
            registration: {
              registration_id: registration.registration_id,
              order_id: registration.order_id,
              name: registration.name,
              email: registration.email,
              mobile: registration.mobile,
              club: registration.club,
              zone: registration.zone,
              registration_type: registration.registration_type,
              registration_amount: parseFloat(registration.registration_amount),
              meal_preference: registration.meal_preference,
              tshirt_size: registration.tshirt_size,
              payment_status: registration.payment_status,
              payment_method: registration.payment_method,
              transaction_id: registration.transaction_id,
              upi_id: registration.upi_id,
              created_at: registration.created_at
            }
          });
        }
      }

      // Create confirmed registration (generates registration ID)
      console.log('🎫 Creating confirmed registration...');
      let confirmResult;
      try {
        confirmResult = await createConfirmedRegistration(
          orderId,
          statusResponse.transactionId
        );
      } catch (createError) {
        // If duplicate key error, registration was already created by webhook
        if (createError.message && createError.message.includes('duplicate key')) {
          console.log('⚠️ Registration already exists (webhook created it), fetching existing...');
          const regResult = await query(
            'SELECT * FROM registrations WHERE order_id = $1',
            [orderId]
          );

          if (regResult.rows.length > 0) {
            confirmResult = {
              success: true,
              registration: regResult.rows[0],
              registrationId: regResult.rows[0].registration_id
            };
          } else {
            throw new Error('Failed to create or fetch confirmed registration');
          }
        } else {
          throw createError;
        }
      }

      if (!confirmResult.success) {
        throw new Error('Failed to create confirmed registration');
      }

      const registration = confirmResult.registration;
      console.log('✅ Confirmed registration created:', confirmResult.registrationId);

      // Send WhatsApp confirmation via Infobip (direct API call)
      try {
        const { sendWhatsApp } = require('../../lib/whatsapp');
        console.log('📱 Verify: Triggering WhatsApp via shared lib...');

        await sendWhatsApp({
          name: registration.name,
          mobile: registration.mobile,
          email: registration.email,
          registrationId: registration.registration_id,
          registrationType: registration.registration_type,
          amount: registration.registration_amount,
          mealPreference: registration.meal_preference,
          tshirtSize: registration.tshirt_size,
          clubName: registration.club,
          orderId: registration.order_id,
          receiptNo: statusResponse.transactionId || registration.registration_id
        });

        console.log('✅ WhatsApp sent successfully!');

      } catch (whatsappError) {
        console.error('❌ WhatsApp error:', whatsappError.message);
      }

      return res.status(200).json({
        success: true,
        paymentSuccess: true,
        paymentStatus: 'PAID',
        orderId,
        amount: statusResponse.orderAmount,
        transactionId: statusResponse.transactionId,
        paymentMethod: statusResponse.paymentMethod,
        paymentTime: statusResponse.paymentTime,
        registration: {
          registration_id: registration.registration_id,
          order_id: registration.order_id,
          name: registration.name,
          email: registration.email,
          mobile: registration.mobile,
          club: registration.club,
          zone: registration.zone,
          registration_type: registration.registration_type,
          registration_amount: parseFloat(registration.registration_amount),
          meal_preference: registration.meal_preference,
          tshirt_size: registration.tshirt_size,
          payment_status: registration.payment_status,
          payment_method: registration.payment_method,
          transaction_id: registration.transaction_id,
          upi_id: registration.upi_id,
          created_at: registration.created_at
        }
      });
    }

    // Payment FAILED or CANCELLED
    else if (statusResponse.status === 'FAILED' ||
      statusResponse.status === 'CANCELLED' ||
      statusResponse.status === 'USER_DROPPED') {
      console.log('❌ Payment failed/cancelled:', statusResponse.status);

      // Update payment attempt to FAILED
      await updatePaymentAttemptStatus(
        orderId,
        'FAILED',
        statusResponse.error || 'Payment cancelled by user'
      );

      return res.status(200).json({
        success: false,
        paymentSuccess: false,
        status: 'FAILED',
        orderId,
        message: 'Payment was not successful. You can try registering again.'
      });
    }

    // Payment still PENDING
    else if (statusResponse.success) {
      console.log('⏳ Payment still pending:', statusResponse.status);
      return res.status(200).json({
        success: true,
        paymentSuccess: false,
        status: statusResponse.status,
        orderId
      });
    }

    // Verification failed
    else {
      console.error('❌ Payment verification failed:', statusResponse.error);
      return res.status(400).json({
        success: false,
        error: statusResponse.error || 'Verification failed'
      });
    }
  } catch (error) {
    console.error('❌ Verify error:', error);
    return res.status(500).json({
      success: false,
      error: 'Verification failed',
      details: error.message
    });
  }
};
