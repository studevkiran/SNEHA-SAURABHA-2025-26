// API: Handle Cashfree webhook callbacks
const CashfreeService = require('../../lib/cashfree');
const {
  getPaymentAttempt,
  createConfirmedRegistration,
  updatePaymentAttemptStatus,
  query // Import query for logging
} = require('../../lib/db-neon');
const { sendWhatsApp } = require('../../lib/whatsapp');

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
    const payload = req.body;
    console.log('📥 RAW WEBHOOK PAYLOAD:', JSON.stringify(payload));

    // Log incoming webhook immediately
    try {
      const orderId = payload?.data?.order?.order_id || payload?.order_id || 'unknown';
      console.log('📥 Webhook hit:', orderId);
      await query(
        "INSERT INTO system_logs (source, level, message, data) VALUES ($1, $2, $3, $4)",
        ['webhook', 'INFO', 'Webhook received', JSON.stringify({ orderId, headers: req.headers })]
      );
    } catch (e) { console.error('Log failed', e); }

    // NEW FORMAT (2023-08-01): Uses x-webhook-signature header
    const signature = req.headers['x-webhook-signature'] ||
      req.headers['x-cashfree-signature'] ||
      req.body.signature;

    // NEW FORMAT: Also includes timestamp
    const timestamp = req.headers['x-webhook-timestamp'];
    const version = req.headers['x-webhook-version'];

    console.log('📥 Webhook received:', {
      version,
      hasSignature: !!signature,
      hasTimestamp: !!timestamp,
      orderId: payload?.data?.order?.order_id || payload?.order_id || 'unknown'
    });

    if (!payload || !signature) {
      console.error('❌ Webhook missing data or signature');
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook data'
      });
    }

    // For new format (2023-08-01), verify signature differently
    const cashfree = new CashfreeService();

    let webhookResult;
    if (version === '2023-08-01') {
      // New format: signature is computed from raw body + timestamp
      console.log('🆕 Verifying new format webhook (2023-08-01)');

      // For new format, we verify by recomputing the signature
      // Cashfree sends: HMAC-SHA256(rawPostData + timestamp, secret_key)
      const crypto = require('crypto');
      const rawBody = JSON.stringify(payload);
      const signatureData = rawBody + timestamp;

      const computedSignature = crypto
        .createHmac('sha256', cashfree.secretKey) // Use safe, trimmed key from service
        .update(signatureData)
        .digest('base64');

      const verified = computedSignature === signature;

      console.log(verified ? '✅ Signature verified' : '❌ Signature mismatch');

      // Log signature result
      try {
        await query(
          "INSERT INTO system_logs (source, level, message, data) VALUES ($1, $2, $3, $4)",
          ['webhook', verified ? 'SUCCESS' : 'ERROR', 'Signature verification', JSON.stringify({ verified, signature, computedSignature })]
        );
      } catch (e) { console.error('Log failed', e); }

      if (!verified) {
        console.error('❌ Signature verification failed');
        return res.status(400).json({
          success: false,
          error: 'Webhook signature verification failed'
        });
      }

      // Parse the new format webhook
      webhookResult = await cashfree.handleWebhook(payload, signature);
      webhookResult.verified = verified;

    } else {
      // Old format: use existing verification
      console.log('📜 Verifying old format webhook');
      webhookResult = await cashfree.handleWebhook(payload, signature);
    }

    if (!webhookResult.verified) {
      console.error('❌ Webhook verification failed');
      return res.status(400).json({
        success: false,
        error: 'Webhook verification failed'
      });
    }

    const { orderId, paymentSuccess, orderAmount, transactionId, orderStatus, paymentMethod, upiId } = webhookResult;

    console.log(`📥 Webhook received: ${orderId} - ${orderStatus} - ${paymentMethod}`);

    // Log payment status
    try {
      await query(
        "INSERT INTO system_logs (source, level, message, data) VALUES ($1, $2, $3, $4)",
        ['webhook', 'INFO', 'Payment status check', JSON.stringify({ orderId, paymentSuccess, orderStatus })]
      );
    } catch (e) { console.error('Log failed', e); }

    if (paymentSuccess) {
      console.log('✅ Payment successful via webhook');
      console.log('💳 Transaction ID:', transactionId);
      console.log('💰 UPI ID:', upiId || 'N/A');

      // Check if already processed
      const attempt = await getPaymentAttempt(orderId);

      if (!attempt) {
        console.error('❌ Payment attempt not found:', orderId);
        try {
          await query(
            "INSERT INTO system_logs (source, level, message, data) VALUES ($1, $2, $3, $4)",
            ['webhook', 'ERROR', 'Payment attempt not found', JSON.stringify({ orderId })]
          );
        } catch (e) { console.error('Log failed', e); }
        return res.status(200).json({ success: true, message: 'Attempt not found' });
      }

      if (attempt.payment_status === 'SUCCESS') {
        console.log('⚠️ Payment already processed, skipping');
        try {
          await query(
            "INSERT INTO system_logs (source, level, message, data) VALUES ($1, $2, $3, $4)",
            ['webhook', 'WARN', 'Payment already processed', JSON.stringify({ orderId })]
          );
        } catch (e) { console.error('Log failed', e); }
        return res.status(200).json({ success: true, message: 'Already processed' });
      }

      // Create confirmed registration
      let confirmResult;
      try {
        confirmResult = await createConfirmedRegistration(
          orderId,
          transactionId,
          upiId
        );
      } catch (createError) {
        // If duplicate key error, registration was already created by verify.js
        if (createError.message && createError.message.includes('duplicate key')) {
          console.log('⚠️ Registration already exists (verify.js created it), fetching existing...');
          // Using the existing query function for logging
          await query('INSERT INTO system_logs (source, level, message, data) VALUES ($1, $2, $3, $4)',
            ['webhook', 'INFO', 'Registration already exists, fetching existing', JSON.stringify({ orderId })]);

          // Temporarily import pg for this specific fetch, or ideally use the existing db-neon query
          // For consistency, let's use the existing `query` from `db-neon`
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
      console.log('✅ Webhook: Confirmed registration created');

      // Log registration creation
      try {
        await query(
          "INSERT INTO system_logs (source, level, message, data) VALUES ($1, $2, $3, $4)",
          ['webhook', 'SUCCESS', 'Registration created', JSON.stringify({ registrationId: confirmResult.registrationId })]
        );
      } catch (e) { console.error('Log failed', e); }

      // Send WhatsApp confirmation via Infobip
      if (confirmResult && confirmResult.success && confirmResult.registration) {
        const registration = confirmResult.registration;

        console.log('📱 Webhook: Triggering WhatsApp via shared lib...');

        // Log start of attempt
        try {
          await query(
            "INSERT INTO system_logs (source, level, message, data) VALUES ($1, $2, $3, $4)",
            ['webhook', 'INFO', 'Starting WhatsApp send', JSON.stringify({ orderId, mobile: registration.mobile })]
          );
        } catch (e) { console.error('Log failed', e); }

        try {
          // Call library directly
          const waResult = await sendWhatsApp({
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
            receiptNo: transactionId || registration.registration_id
          });

          console.log('✅ WhatsApp result:', waResult?.success ? 'SUCCESS' : 'FAILED');

          // Log result
          try {
            await query(
              "INSERT INTO system_logs (source, level, message, data) VALUES ($1, $2, $3, $4)",
              ['webhook', waResult?.success ? 'SUCCESS' : 'ERROR', 'WhatsApp send result', JSON.stringify(waResult)]
            );
          } catch (e) { console.error('Log failed', e); }

        } catch (err) {
          console.error('❌ WhatsApp error:', err.message);
          // Log error
          try {
            await query(
              "INSERT INTO system_logs (source, level, message, data) VALUES ($1, $2, $3, $4)",
              ['webhook', 'ERROR', 'WhatsApp send failed', JSON.stringify({ error: err.message, stack: err.stack })]
            );
          } catch (e) { console.error('Log failed', e); }
        }
      }

    } else if (orderStatus === 'FAILED' || orderStatus === 'CANCELLED') {
      // Payment failed
      console.log(`❌ Payment ${orderStatus}, marking as FAILED`);
      await updatePaymentAttemptStatus(orderId, 'FAILED', `Payment ${orderStatus}`);
      console.log(`✅ Payment attempt marked as FAILED:`, orderId);

    } else {
      // Still pending
      console.log(`⏳ Payment ${orderStatus}, keeping as Pending`);
    }

    // Always respond success to Cashfree (we processed the webhook)
    return res.status(200).json({
      success: true,
      message: 'Webhook processed'
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);

    // Log fatal error to DB
    try {
      await query(
        "INSERT INTO system_logs (source, level, message, data) VALUES ($1, $2, $3, $4)",
        ['webhook', 'CRITICAL', 'Webhook crash', JSON.stringify({ error: error.message, stack: error.stack })]
      );
    } catch (e) { console.error('Log failed', e); }

    // Return 500 to trigger Cashfree retry mechanism
    // This ensures payment is not lost if registration fails
    return res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
};
