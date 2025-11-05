// Cashfree Payment Gateway Configuration

const cashfreeConfig = {
  // Get credentials from Cashfree Dashboard → Developers → Credentials
  // For production, update these in your deployment
  appId: 'YOUR_CASHFREE_APP_ID',  // Replace with your App ID
  secretKey: 'YOUR_CASHFREE_SECRET_KEY',  // Replace with your Secret Key
  
  // API URLs
  apiUrl: 'https://sandbox.cashfree.com/pg', // Sandbox for testing
  // apiUrl: 'https://api.cashfree.com/pg', // Production (use in Vercel)
  
  // Callback URLs (update with your actual domain)
  returnUrl: 'https://your-domain.vercel.app/payment-callback.html',
  notifyUrl: 'https://your-domain.vercel.app/api/cashfree/webhook',
  
  // API version
  apiVersion: '2023-08-01',
  
  // Payment options
  currency: 'INR',
  
  // Environment
  environment: 'PRODUCTION', // or 'TEST' for sandbox
  
  // Payment modes (optional - leave empty to show all)
  paymentModes: ['upi', 'netbanking', 'card', 'wallet'], // or [] for all
  
  // App details
  appName: 'SNEHA-SAURABHA 2025-26',
  appDescription: 'Rotary District Conference Registration'
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = cashfreeConfig;
}
