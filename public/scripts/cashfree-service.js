// Cashfree Payment Service - Frontend
// Handles payment initiation and verification with Cashfree API

const CashfreePaymentService = {
  // API base URL (route to Vercel when on custom domain)
  apiBaseUrl: (location.hostname.includes('sneha2026.in')) 
    ? 'https://sneha2026.vercel.app' 
    : window.location.origin,

  /**
   * Initialize payment with Cashfree
   */
  async initiatePayment(registrationData) {
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
        mealPreference,
        qrData
      } = registrationData;

      console.log('🔄 Initiating Cashfree payment:', orderId);

      // Call backend API to create Cashfree order
      const response = await fetch(`${this.apiBaseUrl}/api/cashfree/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          confirmationId,
          orderId,
          amount,
          fullName,
          mobile,
          email,
          registrationType,
          clubName,
          mealPreference,
          qrData
        })
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        console.log('✅ Payment URL generated:', orderId);
        
        return {
          success: true,
          paymentUrl: data.paymentUrl,
          paymentSessionId: data.paymentSessionId,
          orderId: data.orderId
        };
      } else {
        console.error('❌ Payment initiation failed:', data.error);
        return {
          success: false,
          error: data.error || 'Payment initiation failed'
        };
      }

    } catch (error) {
      console.error('❌ Payment initiation error:', error);
      return {
        success: false,
        error: error.message || 'Network error. Please try again.'
      };
    }
  },

  /**
   * Redirect user to Cashfree payment page
   */
  redirectToPayment(paymentUrl) {
    if (!paymentUrl) {
      console.error('❌ No payment URL provided');
      return false;
    }

    console.log('🔄 Redirecting to Cashfree payment page...');
    
    // Store payment info in sessionStorage for callback
    sessionStorage.setItem('paymentInProgress', 'true');
    sessionStorage.setItem('paymentGateway', 'cashfree');
    
    // Redirect to Cashfree payment page
    window.location.href = paymentUrl;
    return true;
  },

  /**
   * Verify payment status
   */
  async verifyPayment(orderId) {
    try {
      console.log('🔍 Verifying payment:', orderId);

      const response = await fetch(
        `${this.apiBaseUrl}/api/cashfree/verify?orderId=${orderId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success && data.paymentSuccess) {
        console.log('✅ Payment verified successfully:', orderId);
        
        return {
          success: true,
          paymentSuccess: true,
          orderId: data.orderId,
          amount: data.amount,
          transactionId: data.transactionId,
          paymentMethod: data.paymentMethod,
          paymentTime: data.paymentTime
        };
      } else if (data.success && !data.paymentSuccess) {
        console.log('⚠️ Payment not completed:', data.status);
        
        return {
          success: true,
          paymentSuccess: false,
          status: data.status,
          orderId: data.orderId
        };
      } else {
        console.error('❌ Payment verification failed:', data.error);
        return {
          success: false,
          error: data.error || 'Payment verification failed'
        };
      }

    } catch (error) {
      console.error('❌ Payment verification error:', error);
      return {
        success: false,
        error: error.message || 'Network error. Please try again.'
      };
    }
  },

  /**
   * Handle payment callback (when user returns from Cashfree)
   */
  async handlePaymentCallback() {
    try {
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('order_id') || urlParams.get('orderId');
      const orderToken = urlParams.get('order_token');

      if (!orderId) {
        console.error('❌ No order ID in callback');
        return {
          success: false,
          error: 'Invalid payment callback'
        };
      }

      console.log('📥 Processing payment callback:', orderId);

      // Verify payment status
      const verificationResult = await this.verifyPayment(orderId);

      // Clear payment in progress flag
      sessionStorage.removeItem('paymentInProgress');
      sessionStorage.removeItem('paymentGateway');

      return verificationResult;

    } catch (error) {
      console.error('❌ Payment callback error:', error);
      sessionStorage.removeItem('paymentInProgress');
      sessionStorage.removeItem('paymentGateway');
      
      return {
        success: false,
        error: error.message || 'Payment callback processing failed'
      };
    }
  },

  /**
   * Complete payment flow
   */
  async processPayment(registrationData) {
    try {
      // Step 1: Initiate payment
      const initiateResult = await this.initiatePayment(registrationData);

      if (!initiateResult.success) {
        return {
          success: false,
          error: initiateResult.error
        };
      }

      // Step 2: Redirect to payment page
      const redirected = this.redirectToPayment(initiateResult.paymentUrl);

      if (!redirected) {
        return {
          success: false,
          error: 'Failed to redirect to payment page'
        };
      }

      // User will be redirected to Cashfree
      // When they return, handlePaymentCallback() will process the result
      return {
        success: true,
        message: 'Redirecting to payment...'
      };

    } catch (error) {
      console.error('❌ Payment processing error:', error);
      return {
        success: false,
        error: error.message || 'Payment processing failed'
      };
    }
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CashfreePaymentService;
}
