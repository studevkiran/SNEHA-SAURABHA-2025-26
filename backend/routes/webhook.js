const express = require('express');
const router = express.Router();
const instamojoService = require('../services/instamojo');

/**
 * POST /api/webhook/instamojo
 * Handle Instamojo webhook callbacks
 */
router.post('/instamojo', (req, res) => {
    try {
        console.log('📨 Webhook received from Instamojo');
        console.log('Webhook data:', req.body);

        const result = instamojoService.processWebhook(req.body);

        if (result.success) {
            console.log('✅ Webhook processed successfully');
            console.log('Payment status:', result.status);
            
            // Here you would:
            // 1. Update database with payment status
            // 2. Send confirmation email/SMS
            // 3. Send WhatsApp confirmation
            // 4. Update registration status
            
            // For now, just acknowledge receipt
            res.status(200).json({
                success: true,
                message: 'Webhook processed'
            });
        } else {
            console.error('❌ Webhook validation failed:', result.error);
            res.status(400).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('💥 Webhook processing error:', error);
        res.status(500).json({
            success: false,
            error: 'Webhook processing failed'
        });
    }
});

module.exports = router;
