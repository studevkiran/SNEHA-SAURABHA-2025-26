// PhonePe Payment Service
// Handles payment initiation and verification

class PhonePeService {
    constructor() {
        this.config = PHONEPE_CONFIG.getConfig();
        this.callbackUrl = PHONEPE_CONFIG.CALLBACK_URL;
        this.redirectUrl = PHONEPE_CONFIG.REDIRECT_URL;
    }
    
    /**
     * Generate unique transaction ID
     */
    generateTransactionId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        return `SS${timestamp}${random}`;
    }
    
    /**
     * Create SHA256 hash for request verification
     */
    async createChecksum(payload, endpoint) {
        const string = payload + endpoint + this.config.saltKey;
        const hash = await this.sha256(string);
        return hash + '###' + this.config.saltIndex;
    }
    
    /**
     * SHA256 hash function
     */
    async sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }
    
    /**
     * Initiate payment
     * @param {Object} registrationData - User registration details
     * @returns {Promise<Object>} Payment response
     */
    async initiatePayment(registrationData) {
        try {
            const transactionId = this.generateTransactionId();
            const amount = registrationData.price * 100; // Convert to paise
            
            // Prepare payment request payload
            const paymentPayload = {
                merchantId: this.config.merchantId,
                merchantTransactionId: transactionId,
                merchantUserId: `USER_${registrationData.mobile}`,
                amount: amount,
                redirectUrl: this.redirectUrl,
                redirectMode: 'POST',
                callbackUrl: this.callbackUrl,
                mobileNumber: registrationData.mobile,
                paymentInstrument: {
                    type: 'PAY_PAGE'
                }
            };
            
            // Encode payload to base64
            const base64Payload = btoa(JSON.stringify(paymentPayload));
            
            // Create checksum (In production, this should be done on server-side)
            const checksum = await this.createChecksum(base64Payload, '/pg/v1/pay');
            
            // For now, we'll simulate the payment flow
            // In production, you'll make API call to PhonePe server
            return {
                success: true,
                transactionId: transactionId,
                paymentUrl: this.getPaymentSimulationUrl(transactionId, amount),
                payload: base64Payload,
                checksum: checksum,
                // In production, you'll receive this from PhonePe API:
                // redirectUrl: response.data.instrumentResponse.redirectInfo.url
            };
            
        } catch (error) {
            console.error('Payment initiation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get payment simulation URL (for testing without backend)
     * In production, replace with actual PhonePe redirect URL
     */
    getPaymentSimulationUrl(transactionId, amount) {
        // Create a test payment page URL with transaction details
        return `${window.location.origin}/payment-simulator.html?txnId=${transactionId}&amount=${amount}`;
    }
    
    /**
     * Verify payment status
     * @param {string} transactionId - Transaction ID to verify
     */
    async verifyPayment(transactionId) {
        try {
            // In production, make API call to verify payment
            const endpoint = `/pg/v1/status/${this.config.merchantId}/${transactionId}`;
            const checksum = await this.createChecksum('', endpoint);
            
            // Simulated response for testing
            // In production, make actual API call to PhonePe
            return {
                success: true,
                code: 'PAYMENT_SUCCESS',
                message: 'Payment completed successfully',
                transactionId: transactionId,
                amount: 450000, // in paise
                paymentMethod: 'UPI'
            };
            
        } catch (error) {
            console.error('Payment verification error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Handle payment callback
     * @param {Object} callbackData - Data received from PhonePe callback
     */
    async handleCallback(callbackData) {
        try {
            // Decode base64 response
            const decodedResponse = JSON.parse(atob(callbackData.response));
            
            // Verify checksum
            const expectedChecksum = await this.createChecksum(
                callbackData.response, 
                '/pg/v1/pay'
            );
            
            if (callbackData.checksum !== expectedChecksum) {
                throw new Error('Invalid checksum - potential tampering detected');
            }
            
            return {
                success: decodedResponse.code === 'PAYMENT_SUCCESS',
                data: decodedResponse
            };
            
        } catch (error) {
            console.error('Callback handling error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Initialize PhonePe service
const phonePeService = new PhonePeService();
