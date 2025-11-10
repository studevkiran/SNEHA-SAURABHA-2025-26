// API: Verify Cashfree payment status
const CashfreeService = require('../../lib/cashfree');
const { updatePaymentStatus, getRegistrationByOrderId } = require('../../lib/db-functions');
const { updateRegistrationInSheets } = require('../../lib/db-google-sheets');
const { logPaymentVerification, logWhatsAppSent } = require('../../lib/backup-logger');

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
    // Handle both orderId and order_id parameter names
    const orderId = req.query.orderId || req.query.order_id;

    console.log('🔍 Verify payment request for:', orderId);
    console.log('📋 Query params:', req.query);

    if (!orderId) {
      console.error('❌ No orderId provided in query params');
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
      console.log('✅ Payment successful, updating database...');
      
      try {
        // Update database with payment success
        await updatePaymentStatus(
          orderId,
          {
            paymentStatus: 'completed',
            upiId: statusResponse.paymentMethod || null,
            gatewayResponse: JSON.stringify(statusResponse.response)
          }
        );
        console.log('✅ Database updated');

        // Get registration data from database
        const registration = await getRegistrationByOrderId(orderId);
        console.log('✅ Registration fetched:', registration?.registration_id);

        // Update in Google Sheets
        if (registration && registration.registration_id) {
          try {
            await updateRegistrationInSheets(registration.registration_id, {
              payment_status: 'completed',
              transaction_id: orderId,
              registration_status: 'verified'
            });
            console.log('✅ Google Sheets updated');
          } catch (sheetsError) {
            console.error('⚠️ Google Sheets update failed (non-critical):', sheetsError.message);
          }
        }

        // Log payment verification to backup
        try {
          logPaymentVerification(orderId, 'SUCCESS', {
            registration_id: registration?.registration_id,
            amount: registration?.registration_amount,
            payment_method: 'Cashfree'
          });
        } catch (logError) {
          console.error('⚠️ Backup log failed (non-critical):', logError.message);
        }

        console.log('✅ Payment verified and updated:', orderId);

        // Send WhatsApp confirmation (asynchronously, don't wait for it)
        if (registration && registration.mobile) {
          console.log('📱 Sending WhatsApp confirmation to:', registration.mobile);
          
          // Call WhatsApp API asynchronously (don't await - fire and forget)
          fetch(`${process.env.VERCEL_URL || 'https://sneha2026.vercel.app'}/api/send-whatsapp-confirmation`, {
            method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: registration.name,
            mobile: registration.mobile,
            email: registration.email,
            registrationId: registration.registration_id,
            receiptNo: orderId, // Pass the actual Cashfree Order ID
            registrationType: registration.registration_type,
            amount: registration.registration_amount,
            mealPreference: registration.meal_preference
          })
        }).then(response => response.json())
          .then(data => {
            if (data.success) {
              console.log('✅ WhatsApp confirmation sent:', data.messageSid);
              // Log WhatsApp send
              logWhatsAppSent(registration.registration_id, registration.mobile, 'SUCCESS');
            } else {
              console.error('❌ WhatsApp send failed:', data.message);
              // Log WhatsApp failure
              logWhatsAppSent(registration.registration_id, registration.mobile, 'FAILED');
            }
          })
          .catch(error => {
            console.error('❌ WhatsApp API error:', error.message);
          });
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
        registration: registration ? {
          name: registration.name,
          email: registration.email,
          mobile: registration.mobile,
          clubName: registration.club,
          clubId: registration.club_id, // IMPORTANT: Return club ID
          registrationType: registration.registration_type,
          amount: registration.registration_amount,
          mealPreference: registration.meal_preference,
          confirmationId: registration.registration_id
        } : null
      });

      } catch (dbError) {
        console.error('❌ Database operation failed:', dbError);
        // Still return success to user since payment went through
        return res.status(200).json({
          success: true,
          paymentSuccess: true,
          paymentStatus: 'PAID',
          orderId,
          warning: 'Payment successful but database update pending'
        });
      }

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
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    return res.status(500).json({
      success: false,
      error: 'Payment verification failed',
      details: error.message
    });
  }
};
