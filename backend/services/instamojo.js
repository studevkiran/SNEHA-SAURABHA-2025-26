const axios = require('axios');
const crypto = require('crypto');

class InstamojoService {
    constructor() {
        this.environment = process.env.NODE_ENV || 'TEST';
        this.apiKey = process.env.INSTAMOJO_API_KEY;
        this.authToken = process.env.INSTAMOJO_AUTH_TOKEN;
        this.salt = process.env.INSTAMOJO_SALT;
        // Instamojo uses the SAME endpoint for both test and production
        // The difference is in the credentials used (test vs production API keys)
        this.apiEndpoint = process.env.INSTAMOJO_API_ENDPOINT || 'https://www.instamojo.com/api/1.1';
        this.frontendUrl = process.env.FRONTEND_URL;
    }

    /**
     * Create payment request with Instamojo
     */
    async createPaymentRequest(data) {
        try {
            // If in SIMULATION mode, return mock data
            if (this.environment === 'SIMULATION') {
                return this.simulatePaymentRequest(data);
            }

            const paymentData = {
                purpose: `SNEHA-SAURABHA 2025-26 - ${data.type}`,
                amount: parseFloat(data.amount).toFixed(2),
                buyer_name: data.fullName,
                email: data.email,
                phone: data.mobile,
                redirect_url: `${this.frontendUrl}/payment-callback.html`,
                send_email: true,
                send_sms: true,
                allow_repeated_payments: false
            };

            console.log('📤 Creating Instamojo payment request:', {
                purpose: paymentData.purpose,
                amount: paymentData.amount,
                buyer: paymentData.buyer_name
            });

            const response = await axios.post(
                `${this.apiEndpoint}/payment-requests/`,
                paymentData,
                {
                    headers: {
                        'X-Api-Key': this.apiKey,
                        'X-Auth-Token': this.authToken,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10 second timeout
                }
            );

            if (response.data.success) {
                console.log('✅ Payment request created successfully');
                return {
                    success: true,
                    paymentRequestId: response.data.payment_request.id,
                    paymentUrl: response.data.payment_request.longurl,
                    shortUrl: response.data.payment_request.shorturl,
                    status: response.data.payment_request.status
                };
            } else {
                console.error('❌ Payment request failed:', response.data);
                return {
                    success: false,
                    error: response.data.message || 'Payment request creation failed'
                };
            }

        } catch (error) {
            console.error('💥 Instamojo API Error:', error.message);
            
            // If API is unreachable, fallback to simulation
            if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
                console.warn('⚠️ Instamojo API unreachable, falling back to simulation mode');
                return this.simulatePaymentRequest(data);
            }
            
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Payment request failed'
            };
        }
    }

    /**
     * Simulate payment request for offline testing
     */
    simulatePaymentRequest(data) {
        const transactionId = `MOJO${Date.now()}`;
        const paymentUrl = `${this.frontendUrl}/payment-gateway.html?` +
            `purpose=${encodeURIComponent(`SNEHA-SAURABHA 2025-26 - ${data.type}`)}` +
            `&amount=${data.amount}` +
            `&name=${encodeURIComponent(data.fullName)}` +
            `&email=${encodeURIComponent(data.email)}` +
            `&phone=${data.mobile}` +
            `&txn_id=${transactionId}`;

        console.log('🎭 SIMULATION MODE: Created mock payment request');
        
        return {
            success: true,
            paymentRequestId: transactionId,
            paymentUrl: paymentUrl,
            shortUrl: `https://imjo.in/${transactionId.slice(-6)}`,
            status: 'Pending'
        };
    }

    /**
     * Get payment request details
     */
    async getPaymentDetails(paymentRequestId, paymentId) {
        try {
            console.log('🔍 Fetching payment details:', { paymentRequestId, paymentId });

            const response = await axios.get(
                `${this.apiEndpoint}/payment-requests/${paymentRequestId}/${paymentId}/`,
                {
                    headers: {
                        'X-Api-Key': this.apiKey,
                        'X-Auth-Token': this.authToken
                    }
                }
            );

            if (response.data.success) {
                console.log('✅ Payment details retrieved');
                const payment = response.data.payment_request;
                
                return {
                    success: true,
                    status: payment.status,
                    amount: payment.amount,
                    buyerName: payment.buyer_name,
                    buyerEmail: payment.buyer_email,
                    buyerPhone: payment.buyer_phone,
                    paymentId: paymentId,
                    transactionId: payment.payment?.payment_id,
                    fees: payment.payment?.fees,
                    createdAt: payment.created_at
                };
            }

            return {
                success: false,
                error: 'Payment details not found'
            };

        } catch (error) {
            console.error('💥 Error fetching payment details:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(webhookData) {
        try {
            const { mac, ...data } = webhookData;
            
            // Create message from sorted data
            const message = Object.keys(data)
                .sort()
                .map(key => `${key}=${data[key]}`)
                .join('|');
            
            // Calculate expected MAC
            const expectedMac = crypto
                .createHmac('sha1', this.salt)
                .update(message)
                .digest('hex');
            
            const isValid = mac === expectedMac;
            
            if (isValid) {
                console.log('✅ Webhook signature verified');
            } else {
                console.warn('⚠️ Invalid webhook signature');
            }
            
            return isValid;

        } catch (error) {
            console.error('💥 Webhook verification error:', error);
            return false;
        }
    }

    /**
     * Process webhook callback
     */
    processWebhook(webhookData) {
        const isValid = this.verifyWebhookSignature(webhookData);
        
        if (!isValid) {
            return {
                success: false,
                error: 'Invalid signature'
            };
        }

        return {
            success: true,
            status: webhookData.status,
            paymentId: webhookData.payment_id,
            paymentRequestId: webhookData.payment_request_id,
            amount: webhookData.amount,
            buyerName: webhookData.buyer_name,
            buyerEmail: webhookData.buyer_email,
            buyerPhone: webhookData.buyer_phone,
            fees: webhookData.fees,
            mac: webhookData.mac
        };
    }
}

module.exports = new InstamojoService();
