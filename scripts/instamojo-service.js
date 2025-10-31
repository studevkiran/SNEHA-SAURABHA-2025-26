/**
 * Instamojo Payment Service
 * Handles payment request creation, verification, and webhook processing
 */

class InstamojoService {
    constructor() {
        this.config = getInstamojoConfig();
        this.apiEndpoint = this.config.apiEndpoint;
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
     * Create payment request with Instamojo
     * @param {Object} registrationData - Registration details
     * @returns {Promise<Object>} Payment request response
     */
    async createPaymentRequest(registrationData) {
        try {
            const transactionId = this.generateTransactionId();
            
            // Prepare payment request payload
            const paymentRequest = {
                purpose: `${PAYMENT_CONFIG.purpose} - ${registrationData.type}`,
                amount: registrationData.amount,
                buyer_name: registrationData.fullName,
                email: registrationData.email,
                phone: registrationData.mobile,
                redirect_url: this.config.redirectUrl,
                webhook: this.config.webhookUrl,
                send_email: PAYMENT_CONFIG.send_email,
                send_sms: PAYMENT_CONFIG.send_sms,
                allow_repeated_payments: PAYMENT_CONFIG.allow_repeated_payments
            };

            console.log('Creating Instamojo payment request:', {
                transactionId,
                amount: paymentRequest.amount,
                purpose: paymentRequest.purpose
            });

            // In production, this would be a server-side API call
            // For testing, we'll simulate the response
            const response = await this.simulatePaymentRequest(paymentRequest, transactionId);
            
            return {
                success: true,
                transactionId: transactionId,
                paymentUrl: response.longurl,
                paymentRequestId: response.id,
                data: response
            };

        } catch (error) {
            console.error('Instamojo payment request failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Simulate payment request (for testing without backend)
     * In production, this will be replaced with actual API call from server
     */
    async simulatePaymentRequest(paymentRequest, transactionId) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            id: `MOJO${transactionId}`,
            longurl: `https://test.instamojo.com/@test/${transactionId}`,
            shorturl: `https://imjo.in/${transactionId.slice(-6)}`,
            status: 'Pending',
            ...paymentRequest
        };
    }

    /**
     * Verify payment status
     * @param {string} paymentRequestId - Payment request ID
     * @param {string} paymentId - Payment ID from callback
     * @returns {Promise<Object>} Payment verification response
     */
    async verifyPayment(paymentRequestId, paymentId) {
        try {
            console.log('Verifying payment:', { paymentRequestId, paymentId });

            // In production, this would call:
            // GET /api/1.1/payment-requests/{payment_request_id}/{payment_id}/
            
            // Simulated response for testing
            const response = await this.simulatePaymentVerification(paymentRequestId, paymentId);
            
            return {
                success: response.status === 'Credit',
                status: response.status,
                amount: response.amount,
                buyerName: response.buyer_name,
                buyerEmail: response.buyer_email,
                buyerPhone: response.buyer_phone,
                paymentId: response.payment_id,
                fees: response.fees,
                data: response
            };

        } catch (error) {
            console.error('Payment verification failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Simulate payment verification (for testing)
     */
    async simulatePaymentVerification(paymentRequestId, paymentId) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            payment_request: {
                id: paymentRequestId,
                status: 'Completed'
            },
            payment: {
                payment_id: paymentId,
                status: 'Credit',
                amount: '7500.00',
                buyer_name: 'Test User',
                buyer_email: 'test@example.com',
                buyer_phone: '9999999999',
                fees: '187.50',
                currency: 'INR',
                created_at: new Date().toISOString()
            }
        };
    }

    /**
     * Handle webhook callback from Instamojo
     * @param {Object} webhookData - Webhook payload
     * @returns {Object} Processed webhook data
     */
    handleWebhook(webhookData) {
        try {
            // Verify webhook signature (in production)
            // const isValid = this.verifyWebhookSignature(webhookData);
            
            const paymentStatus = webhookData.status;
            const isSuccessful = paymentStatus === 'Credit';

            return {
                success: isSuccessful,
                paymentId: webhookData.payment_id,
                amount: webhookData.amount,
                status: paymentStatus,
                buyerName: webhookData.buyer_name,
                buyerEmail: webhookData.buyer_email,
                buyerPhone: webhookData.buyer_phone,
                mac: webhookData.mac // For signature verification
            };

        } catch (error) {
            console.error('Webhook processing failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verify webhook signature (production security)
     * @param {Object} webhookData - Webhook payload
     * @returns {boolean} Signature validity
     */
    verifyWebhookSignature(webhookData) {
        // Reconstruct MAC from webhook data
        const { mac, ...data } = webhookData;
        const message = Object.keys(data)
            .sort()
            .map(key => `${key}=${data[key]}`)
            .join('|');
        
        // In production, use crypto library to verify HMAC
        // const expectedMac = crypto.createHmac('sha1', this.config.salt)
        //                           .update(message)
        //                           .digest('hex');
        
        // return mac === expectedMac;
        
        return true; // Simplified for now
    }

    /**
     * Format amount for Instamojo (must be string with 2 decimals)
     * @param {number} amount - Amount in rupees
     * @returns {string} Formatted amount
     */
    formatAmount(amount) {
        return parseFloat(amount).toFixed(2);
    }

    /**
     * Get payment request details
     * @param {string} paymentRequestId - Payment request ID
     * @returns {Promise<Object>} Payment request details
     */
    async getPaymentRequestDetails(paymentRequestId) {
        try {
            console.log('Fetching payment request:', paymentRequestId);
            
            // In production: GET /api/1.1/payment-requests/{id}/
            
            return {
                success: true,
                data: {
                    id: paymentRequestId,
                    status: 'Pending',
                    // ... other details
                }
            };

        } catch (error) {
            console.error('Failed to fetch payment request:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Create global instance
const instamojoService = new InstamojoService();
