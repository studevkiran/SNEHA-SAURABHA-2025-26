// PhonePe Payment Gateway Configuration
// DO NOT commit this file to public repositories in production

const PHONEPE_CONFIG = {
    // Test Credentials (Replace with production credentials before going live)
    TEST: {
        merchantId: 'TEST-M233JOFST81KT_25102',
        clientVersion: '1',
        clientSecret: 'NzQ0Yjc5Y2QtYjY1NC00Mjk3LThiZTMtMmEwNThlM2U0ODQ5',
        apiEndpoint: 'https://api-preprod.phonepe.com/apis/pg-sandbox', // Test endpoint
        saltKey: '', // Will be provided by PhonePe
        saltIndex: '1'
    },
    
    // Production Credentials (Update these when going live)
    PRODUCTION: {
        merchantId: 'YOUR_PROD_MERCHANT_ID',
        clientVersion: '1',
        clientSecret: 'YOUR_PROD_CLIENT_SECRET',
        apiEndpoint: 'https://api.phonepe.com/apis/hermes', // Production endpoint
        saltKey: 'YOUR_PROD_SALT_KEY',
        saltIndex: '1'
    },
    
    // Current environment (Change to 'PRODUCTION' when going live)
    CURRENT_ENV: 'TEST',
    
    // Get active config based on environment
    getConfig() {
        return this[this.CURRENT_ENV];
    },
    
    // Callback URLs (Update with your actual domain)
    CALLBACK_URL: window.location.origin + '/payment-callback',
    REDIRECT_URL: window.location.origin + '/payment-redirect',
    
    // Payment options
    PAYMENT_OPTIONS: {
        enabledMethods: ['UPI', 'CARD', 'NET_BANKING', 'WALLET'],
        displayName: 'Sneha Sourabha 2025-26 Registration',
        paymentDescription: 'Rotary District Conference Registration Fee'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PHONEPE_CONFIG;
}
