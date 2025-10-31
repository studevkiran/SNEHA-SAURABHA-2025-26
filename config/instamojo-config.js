/**
 * Instamojo Payment Gateway Configuration
 * Event: SNEHA-SAURABHA 2025-26 - Rotary District Conference
 * 
 * SECURITY: API calls now go through backend server
 */

const INSTAMOJO_CONFIG = {
    // Backend API URLs
    BACKEND_URL: 'http://localhost:3000',
    
    // API Endpoints
    endpoints: {
        createPayment: '/api/payment/create',
        verifyPayment: '/api/payment/verify',
        webhook: '/api/webhook/instamojo'
    },
    
    // Frontend URLs
    callbackUrl: 'http://localhost:8000/payment-callback.html',
    
    // Test Environment (Current)
    TEST: {
        apiKey: '084c9e123d2732c22f4ebb4f8c37481d',
        authToken: '0cfbbdd9e0a37c7773f564281dd66f48',
        salt: '06bb23a2ec6a4da5825189278b5de344',
        apiEndpoint: 'https://test.instamojo.com/api/1.1/',
        webhookSecret: 'INSTAMOJO_WEBHOOK_SECRET', // Set this when webhook is configured
        redirectUrl: 'http://localhost:8000/payment-success.html',
        webhookUrl: 'http://localhost:8000/api/webhook/instamojo'
    },
    
    // Production Environment (Update when going live)
    PRODUCTION: {
        apiKey: 'YOUR_PRODUCTION_API_KEY',
        authToken: 'YOUR_PRODUCTION_AUTH_TOKEN',
        salt: 'YOUR_PRODUCTION_SALT',
        apiEndpoint: 'https://www.instamojo.com/api/1.1/',
        webhookSecret: 'YOUR_PRODUCTION_WEBHOOK_SECRET',
        redirectUrl: 'https://yourdomain.com/payment-success.html',
        webhookUrl: 'https://yourdomain.com/api/webhook/instamojo'
    }
};

// Current environment
const CURRENT_ENV = 'TEST'; // Change to 'PRODUCTION' when going live

// Get current configuration
function getInstamojoConfig() {
    return INSTAMOJO_CONFIG[CURRENT_ENV];
}

// Payment request configuration
const PAYMENT_CONFIG = {
    purpose: 'SNEHA-SAURABHA 2025-26 Registration',
    currency: 'INR',
    buyer_name_required: true,
    email_required: true,
    phone_required: true,
    send_email: true,
    send_sms: true,
    webhook_enabled: true,
    allow_repeated_payments: false
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        INSTAMOJO_CONFIG,
        CURRENT_ENV,
        getInstamojoConfig,
        PAYMENT_CONFIG
    };
}
