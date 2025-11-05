// PhonePe Payment Gateway Integration
const crypto = require('crypto');
const axios = require('axios');

class PhonePeService {
  constructor() {
    this.merchantId = process.env.PHONEPE_MERCHANT_ID;
    this.saltKey = process.env.PHONEPE_SALT_KEY;
    this.saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
    this.apiUrl = process.env.PHONEPE_API_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox';
    this.redirectUrl = process.env.PHONEPE_REDIRECT_URL;
    this.callbackUrl = process.env.PHONEPE_CALLBACK_URL;
  }

  // Generate checksum for API request
  generateChecksum(payload) {
    const string = payload + '/pg/v1/pay' + this.saltKey;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    return sha256 + '###' + this.saltIndex;
  }

  // Verify checksum from PhonePe callback
  verifyChecksum(receivedChecksum, response) {
    const string = response + this.saltKey;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const expectedChecksum = sha256 + '###' + this.saltIndex;
    return receivedChecksum === expectedChecksum;
  }

  // Initiate payment
  async initiatePayment(data) {
    try {
      const {
        transactionId,
        amount,
        fullName,
        mobile,
        email
      } = data;

      // Create payment payload
      const paymentPayload = {
        merchantId: this.merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: `USER_${Date.now()}`,
        amount: Math.round(amount * 100), // Convert to paise
        redirectUrl: this.redirectUrl,
        redirectMode: 'REDIRECT',
        callbackUrl: this.callbackUrl,
        mobileNumber: mobile,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      // Convert to base64
      const payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
      
      // Generate checksum
      const checksum = this.generateChecksum(payload);

      // Make API request
      const response = await axios.post(
        `${this.apiUrl}/pg/v1/pay`,
        {
          request: payload
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum
          }
        }
      );

      console.log('📤 PhonePe payment initiated:', {
        transactionId,
        amount,
        success: response.data.success
      });

      if (response.data.success) {
        return {
          success: true,
          transactionId,
          paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
          merchantTransactionId: transactionId
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Payment initiation failed'
        };
      }

    } catch (error) {
      console.error('💥 PhonePe payment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Payment request failed'
      };
    }
  }

  // Check payment status
  async checkPaymentStatus(merchantTransactionId) {
    try {
      const url = `${this.apiUrl}/pg/v1/status/${this.merchantId}/${merchantTransactionId}`;
      
      // Generate checksum for status check
      const string = `/pg/v1/status/${this.merchantId}/${merchantTransactionId}` + this.saltKey;
      const sha256 = crypto.createHash('sha256').update(string).digest('hex');
      const checksum = sha256 + '###' + this.saltIndex;

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': this.merchantId
        }
      });

      console.log('🔍 PhonePe status check:', {
        merchantTransactionId,
        status: response.data.code,
        success: response.data.success
      });

      return {
        success: response.data.success,
        code: response.data.code,
        message: response.data.message,
        data: response.data.data
      };

    } catch (error) {
      console.error('💥 PhonePe status check error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Handle webhook callback
  async handleWebhook(payload, checksum) {
    try {
      // Decode payload
      const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
      
      // Verify checksum
      const isValid = this.verifyChecksum(checksum, payload);
      
      if (!isValid) {
        console.error('❌ Invalid webhook checksum');
        return {
          success: false,
          error: 'Invalid checksum'
        };
      }

      const data = JSON.parse(decodedPayload);
      
      console.log('🔔 PhonePe webhook received:', {
        transactionId: data.merchantTransactionId,
        status: data.code,
        success: data.success
      });

      return {
        success: true,
        data,
        isPaymentSuccess: data.success && data.code === 'PAYMENT_SUCCESS'
      };

    } catch (error) {
      console.error('💥 Webhook handling error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = PhonePeService;
