// Cashfree Payment Gateway Service
const axios = require('axios');
const crypto = require('crypto');

class CashfreeService {
  constructor() {
    // Get credentials from environment variables
    // For Vercel deployment, set these in Dashboard → Settings → Environment Variables
    this.appId = process.env.CASHFREE_APP_ID || 'YOUR_CASHFREE_APP_ID';
    this.secretKey = process.env.CASHFREE_SECRET_KEY || 'YOUR_CASHFREE_SECRET_KEY';
    this.apiUrl = process.env.CASHFREE_API_URL || 'https://sandbox.cashfree.com/pg';
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
          return_url: this.returnUrl,
          notify_url: this.notifyUrl
        }
      };

      // API request headers
      const headers = {
        'Content-Type': 'application/json',
        'x-client-id': this.appId,
        'x-client-secret': this.secretKey,
        'x-api-version': '2023-08-01'
      };

      console.log('🔄 Creating Cashfree order:', orderId);

      // Create order API call
      const response = await axios.post(
        `${this.apiUrl}/orders`,
        orderData,
        { headers }
      );

      if (response.data && response.data.payment_session_id) {
        console.log('✅ Cashfree order created:', orderId);
        
        return {
          success: true,
          orderId: response.data.order_id,
          paymentSessionId: response.data.payment_session_id,
          paymentUrl: `https://payments.cashfree.com/order/#/checkout?order_id=${response.data.order_id}&order_token=${response.data.payment_session_id}`
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
      const headers = {
        'Content-Type': 'application/json',
        'x-client-id': this.appId,
        'x-client-secret': this.secretKey,
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

        return {
          success: true,
          paymentSuccess: isPaid,
          status: paymentStatus,
          orderId: response.data.order_id,
          orderAmount: response.data.order_amount,
          transactionId: response.data.cf_order_id,
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
