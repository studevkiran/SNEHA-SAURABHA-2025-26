// Cashfree Payment Gateway Service
const axios = require('axios');
const crypto = require('crypto');

class CashfreeService {
  constructor() {
    // Get credentials from environment variables
    // For Vercel deployment, set these in Dashboard → Settings → Environment Variables
    this.appId = (process.env.CASHFREE_APP_ID || 'YOUR_CASHFREE_APP_ID').trim();
    this.secretKey = (process.env.CASHFREE_SECRET_KEY || 'YOUR_CASHFREE_SECRET_KEY').trim();
    this.apiUrl = (process.env.CASHFREE_API_URL || 'https://sandbox.cashfree.com/pg').trim();
    
    // Determine payment page URL based on API URL
    this.paymentPageUrl = this.apiUrl.includes('sandbox') 
      ? 'https://sandbox.cashfree.com/pg/view/order'
      : 'https://payments.cashfree.com/order';
      
    // Return URL should point to main page for proper handling
    this.returnUrl = process.env.CASHFREE_RETURN_URL || 'http://localhost:8000/index.html?payment=pending';
    this.notifyUrl = process.env.CASHFREE_NOTIFY_URL || 'http://localhost:8000/api/cashfree/webhook';
  }

  /**
   * Generate signature for Cashfree API request
   */
  generateSignature(orderId, orderAmount, orderCurrency = 'INR') {
    const signatureData = `${orderId}${orderAmount}${orderCurrency}`;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(signatureData)
      .digest('base64');
    return signature;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(postData, receivedSignature) {
    try {
      const signatureData = Object.keys(postData)
        .sort()
        .map(key => `${key}=${postData[key]}`)
        .join('&');
      
      const computedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(signatureData)
        .digest('base64');
      
      return computedSignature === receivedSignature;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Create payment order
   */
  async createOrder(data) {
    try {
      const {
        orderId,
        orderAmount,
        customerName,
        customerEmail,
        customerPhone
      } = data;

      // Create order payload
      const orderData = {
        order_id: orderId,
        order_amount: parseFloat(orderAmount),
        order_currency: 'INR',
        order_note: `SNEHA-SAURABHA 2025-26 Registration - ${orderId}`,
        customer_details: {
          customer_id: customerPhone,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone
        },
        order_meta: {
          return_url: `${this.returnUrl}&order_id=${orderId}`,
          notify_url: this.notifyUrl
        }
      };

      // Quick guard: ensure credentials are not the placeholder defaults
      if (!this.appId || !this.secretKey || this.appId.includes('YOUR_') || this.secretKey.includes('YOUR_')) {
        const msg = 'Cashfree credentials are not set on the server. Please configure CASHFREE_APP_ID and CASHFREE_SECRET_KEY in environment variables.';
        console.error('❌', msg);
        return {
          success: false,
          error: msg
        };
      }

      // Clean credentials - remove any non-printable characters
      const cleanAppId = this.appId.replace(/[^\x20-\x7E]/g, '');
      const cleanSecretKey = this.secretKey.replace(/[^\x20-\x7E]/g, '');

      // API request headers
      const headers = {
        'Content-Type': 'application/json',
        'x-client-id': cleanAppId,
        'x-client-secret': cleanSecretKey,
        'x-api-version': '2023-08-01'
      };

      console.log('🔄 Creating Cashfree order:', orderId);
      console.log('🔑 Using App ID length:', cleanAppId.length);

      // Create order API call
      const response = await axios.post(
        `${this.apiUrl}/orders`,
        orderData,
        { headers }
      );

      console.log('📦 Cashfree API response:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.payment_session_id) {
        console.log('✅ Cashfree order created:', orderId);
        console.log('🔑 Payment Session ID:', response.data.payment_session_id);
        
        // Return payment_session_id for SDK integration (not URL)
        return {
          success: true,
          orderId: response.data.order_id,
          paymentSessionId: response.data.payment_session_id
        };
      } else {
        console.error('❌ Cashfree order creation failed:', response.data);
        return {
          success: false,
          error: 'Failed to create payment order'
        };
      }

    } catch (error) {
      console.error('❌ Cashfree order creation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Payment initiation failed'
      };
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(orderId) {
    try {
      // Clean credentials
      const cleanAppId = this.appId.replace(/[^\x20-\x7E]/g, '');
      const cleanSecretKey = this.secretKey.replace(/[^\x20-\x7E]/g, '');

      const headers = {
        'Content-Type': 'application/json',
        'x-client-id': cleanAppId,
        'x-client-secret': cleanSecretKey,
        'x-api-version': '2023-08-01'
      };

      console.log('🔍 Verifying Cashfree payment:', orderId);

      const response = await axios.get(
        `${this.apiUrl}/orders/${orderId}`,
        { headers }
      );

      if (response.data) {
        const paymentStatus = response.data.order_status;
        const isPaid = paymentStatus === 'PAID';

        console.log(`${isPaid ? '✅' : '⚠️'} Payment status:`, paymentStatus);
        console.log('📦 Full response:', JSON.stringify(response.data, null, 2));
        
        // Get transaction details - try to fetch actual bank reference
        let bankTransactionId = response.data.cf_order_id; // Default to cf_order_id
        
        // If payment is successful, try to get payment details
        if (isPaid) {
          try {
            // Fetch payment details to get bank reference number
            const paymentsResponse = await axios.get(
              `${this.apiUrl}/orders/${orderId}/payments`,
              { headers }
            );
            
            if (paymentsResponse.data && paymentsResponse.data.length > 0) {
              const payment = paymentsResponse.data[0];
              // Bank reference number is the actual transaction ID from the bank
              bankTransactionId = payment.bank_reference || payment.cf_payment_id || response.data.cf_order_id;
              console.log('💳 Bank Reference Number:', bankTransactionId);
              console.log('💳 Payment details:', JSON.stringify(payment, null, 2));
            }
          } catch (paymentError) {
            console.warn('⚠️ Could not fetch payment details:', paymentError.message);
            // Continue with cf_order_id if payment details fetch fails
          }
        }

        return {
          success: true,
          paymentSuccess: isPaid,
          status: paymentStatus,
          orderId: response.data.order_id,
          orderAmount: response.data.order_amount,
          transactionId: bankTransactionId,
          paymentTime: response.data.payment_completion_time,
          paymentMethod: response.data.payment_method,
          response: response.data
        };
      } else {
        return {
          success: false,
          error: 'Unable to verify payment status'
        };
      }

    } catch (error) {
      console.error('❌ Payment verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Payment verification failed'
      };
    }
  }

  /**
   * Handle webhook notification
   */
  async handleWebhook(payload, signature) {
    try {
      console.log('📥 Processing Cashfree webhook');

      // Verify signature
      const isValid = this.verifyWebhookSignature(payload, signature);
      
      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return {
          verified: false,
          error: 'Invalid signature'
        };
      }

      const orderId = payload.orderId || payload.order_id;
      const orderStatus = payload.orderStatus || payload.order_status;
      const txStatus = payload.txStatus || payload.tx_status;

      const paymentSuccess = orderStatus === 'PAID' || txStatus === 'SUCCESS';

      console.log(`${paymentSuccess ? '✅' : '⚠️'} Webhook processed:`, orderId, orderStatus);

      return {
        verified: true,
        paymentSuccess,
        orderId,
        orderStatus,
        txStatus,
        transactionId: payload.referenceId || payload.cf_order_id,
        orderAmount: payload.orderAmount || payload.order_amount,
        paymentMethod: payload.paymentMode || payload.payment_method,
        signature
      };

    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      return {
        verified: false,
        error: error.message
      };
    }
  }
}

module.exports = CashfreeService;
