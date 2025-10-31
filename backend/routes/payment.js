const express = require('express');
const router = express.Router();
const instamojoService = require('../services/instamojo');

/**
 * POST /api/payment/create
 * Create a new payment request
 */
router.post('/create', async (req, res) => {
    try {
        const { fullName, email, mobile, type, amount } = req.body;

        // Validate required fields
        if (!fullName || !email || !mobile || !type || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email address'
            });
        }

        // Validate phone
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(mobile)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid mobile number'
            });
        }

        // Validate amount
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid amount'
            });
        }

        console.log('💳 Payment request received:', {
            name: fullName,
            email,
            mobile,
            type,
            amount
        });

        // Create payment request
        const result = await instamojoService.createPaymentRequest({
            fullName,
            email,
            mobile,
            type,
            amount
        });

        if (result.success) {
            res.json({
                success: true,
                paymentRequestId: result.paymentRequestId,
                paymentUrl: result.paymentUrl,
                shortUrl: result.shortUrl,
                message: 'Payment request created successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('❌ Payment creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create payment request'
        });
    }
});

/**
 * GET /api/payment/verify/:paymentRequestId/:paymentId
 * Verify payment status
 */
router.get('/verify/:paymentRequestId/:paymentId', async (req, res) => {
    try {
        const { paymentRequestId, paymentId } = req.params;

        console.log('🔍 Verifying payment:', { paymentRequestId, paymentId });

        const result = await instamojoService.getPaymentDetails(paymentRequestId, paymentId);

        if (result.success) {
            res.json({
                success: true,
                payment: result
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('❌ Payment verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify payment'
        });
    }
});

module.exports = router;
