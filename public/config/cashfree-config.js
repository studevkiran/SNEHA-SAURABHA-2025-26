// Cashfree Payment Gateway Configuration

const cashfreeConfig = {
  // Credentials (backend uses environment variables)
  appId: 'TEST10864925b78bc58da644dfa2bc7152946801',
  
  // API URLs
  apiUrl: 'https://sandbox.cashfree.com/pg',
  
  // Callback URLs (dynamically set)
  returnUrl: window.location.origin + '/payment-callback.html',
  notifyUrl: window.location.origin + '/api/cashfree/webhook',
  
  // Payment configuration
  currency: 'INR',
  environment: 'TEST',
  paymentModes: ['upi', 'nb', 'card', 'wallet'],
  
  // App details
  appName: 'SNEHA-SAURABHA 2025-26',
  appDescription: 'Rotary District Conference Registration'
};

// Auto-detect localhost for mock gateway
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

// Export for Node.js modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = cashfreeConfig;
}
