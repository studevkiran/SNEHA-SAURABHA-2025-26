/**
 * Instamojo Payment Service
 * Handles payment request creation via backend API
 */

class InstamojoService {
    constructor() {
        this.config = getInstamojoConfig();
        this.backendUrl = this.config.BACKEND_URL || 'http://localhost:3000';
    }

    /**
     * Generate unique transaction ID
     * Format: SS_YYYYMMDD_HHMMSS_RANDOM
     */
    generateTransactionId() {
        const now = new Date();
        const dateStr = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `SS_${dateStr}_${random}`;
    }

    /**
     * Create payment request with Instamojo via backend
     * @param {Object} registrationData - Registration details
     * @returns {Promise<Object>} Payment request response
     */
    async createPaymentRequest(registrationData) {
        try {
            const transactionId = this.generateTransactionId();
            
            console.log('📤 Sending payment request to backend:', {
                transactionId,
                amount: registrationData.amount,
                type: registrationData.type
            });

            // Call backend API to create payment
            const response = await fetch(`${this.backendUrl}/api/payment/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName: registrationData.fullName,
                    email: registrationData.email,
                    mobile: registrationData.mobile,
                    type: registrationData.type,
                    amount: registrationData.amount
                })
            });

            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Payment request created:', data.paymentRequestId);
                return {
                    success: true,
                    transactionId: transactionId,
                    paymentRequestId: data.paymentRequestId,
                    paymentUrl: data.paymentUrl,
                    shortUrl: data.shortUrl
                };
            } else {
                console.error('❌ Payment request failed:', data.error);
                return {
                    success: false,
                    error: data.error
                };
            }

        } catch (error) {
            console.error('💥 Payment request error:', error);
            return {
                success: false,
                error: 'Failed to connect to payment server. Please check if backend is running.'
            };
        }
    }

    /**
     * Verify payment status via backend
     * @param {string} paymentRequestId - Payment request ID
     * @param {string} paymentId - Payment ID from callback
     * @returns {Promise<Object>} Payment verification response
     */
    async verifyPayment(paymentRequestId, paymentId) {
        try {
            console.log('🔍 Verifying payment:', { paymentRequestId, paymentId });

            const response = await fetch(
                `${this.backendUrl}/api/payment/verify/${paymentRequestId}/${paymentId}`
            );

            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Payment verified');
                return {
                    success: true,
                    payment: data.payment
                };
            }

            return {
                success: false,
                error: data.error
            };

        } catch (error) {
            console.error('💥 Payment verification error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Format amount for Instamojo (must be string with 2 decimals)
     * @param {number} amount - Amount in rupees
     * @returns {string} Formatted amount
     */
    formatAmount(amount) {
        return parseFloat(amount).toFixed(2);
    }
}

// Create global instance
const instamojoService = new InstamojoService();
