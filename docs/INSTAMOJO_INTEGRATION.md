# Instamojo Payment Gateway Integration Guide

## Overview
Complete integration of Instamojo Payment Gateway for SNEHA-SAURABHA 2025-26 conference registration with test credentials ready for deployment.

## Test Credentials (Current)
```javascript
API Key: 084c9e123d2732c22f4ebb4f8c37481d
Auth Token: 0cfbbdd9e0a37c7773f564281dd66f48
Private Salt: 06bb23a2ec6a4da5825189278b5de344
Environment: TEST
Endpoint: https://test.instamojo.com/api/1.1/
```

## Project Structure
```
├── config/
│   └── instamojo-config.js      # Payment gateway configuration
├── scripts/
│   └── instamojo-service.js     # Payment service layer
├── docs/
│   └── INSTAMOJO_INTEGRATION.md # This file
```

## Features Implemented

### ✅ Payment Request Creation
- Automatic transaction ID generation (SS_YYYYMMDD_HHMMSS_RANDOM)
- Complete buyer information capture
- Dynamic amount and purpose
- Email and SMS notifications enabled
- Webhook support configured

### ✅ Payment Verification
- Payment status checking
- Secure callback handling
- Transaction validation

### ✅ Security Features
- Webhook signature verification (HMAC-SHA1)
- Private salt for security
- Secure API authentication
- Test/Production environment separation

## How It Works

### 1. Payment Flow
```
User Fills Form → Review Details → Click "Pay with Instamojo" 
→ Payment Link Created → Redirect to Instamojo 
→ User Pays → Webhook Callback → Payment Verified 
→ Success Screen → Email/SMS Confirmation
```

### 2. Transaction ID Format
```
SS_20251031123045_ABC123
│  │              │
│  │              └─ Random 6-char code
│  └─ Timestamp (YYYYMMDDHHMMSS)
└─ Sneha Sourabha prefix
```

## Setup Instructions

### Step 1: Test Environment (Current)
✅ Already configured with test credentials
- Test API endpoint active
- Mock payment flow working
- Console logging enabled

### Step 2: Production Deployment

#### A. Get Production Credentials
1. Log into Instamojo Dashboard: https://www.instamojo.com
2. Go to API & Plugins → Generate Credentials
3. Copy:
   - Private API Key
   - Private Auth Token
   - Private Salt Key

#### B. Update Configuration
Edit `config/instamojo-config.js`:
```javascript
PRODUCTION: {
    apiKey: 'YOUR_PRODUCTION_API_KEY',
    authToken: 'YOUR_PRODUCTION_AUTH_TOKEN',
    salt: 'YOUR_PRODUCTION_SALT',
    apiEndpoint: 'https://www.instamojo.com/api/1.1/',
    redirectUrl: 'https://yourdomain.com/payment-success.html',
    webhookUrl: 'https://yourdomain.com/api/webhook/instamojo'
}

// Change this to 'PRODUCTION'
const CURRENT_ENV = 'PRODUCTION';
```

#### C. Set Up Webhook
1. Go to Instamojo Dashboard → API & Plugins → Webhooks
2. Add new webhook:
   - **URL**: `https://yourdomain.com/api/webhook/instamojo`
   - **Events**: Payment Successful
3. Copy webhook secret and add to config

### Step 3: Backend Implementation (Required for Production)

You need a server-side component to:
- Create payment requests securely
- Handle webhook callbacks
- Store payment records
- Send confirmations

#### Option A: Firebase Cloud Functions (Recommended)

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

// Create payment request
exports.createPayment = functions.https.onCall(async (data, context) => {
    const config = functions.config().instamojo;
    
    try {
        const response = await axios.post(
            'https://www.instamojo.com/api/1.1/payment-requests/',
            {
                purpose: `SNEHA-SAURABHA 2025-26 - ${data.type}`,
                amount: data.amount,
                buyer_name: data.fullName,
                email: data.email,
                phone: data.mobile,
                redirect_url: config.redirect_url,
                webhook: config.webhook_url,
                send_email: true,
                send_sms: true
            },
            {
                headers: {
                    'X-Api-Key': config.api_key,
                    'X-Auth-Token': config.auth_token
                }
            }
        );
        
        // Store in Firestore
        await admin.firestore().collection('registrations').add({
            ...data,
            paymentRequestId: response.data.payment_request.id,
            transactionId: response.data.payment_request.id,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return {
            success: true,
            paymentUrl: response.data.payment_request.longurl,
            transactionId: response.data.payment_request.id
        };
        
    } catch (error) {
        console.error('Payment creation failed:', error);
        throw new functions.https.HttpsError('internal', 'Payment failed');
    }
});

// Handle webhook callback
exports.handleWebhook = functions.https.onRequest(async (req, res) => {
    const config = functions.config().instamojo;
    const webhookData = req.body;
    
    // Verify webhook signature
    const crypto = require('crypto');
    const mac = webhookData.mac;
    delete webhookData.mac;
    
    const message = Object.keys(webhookData)
        .sort()
        .map(key => `${key}=${webhookData[key]}`)
        .join('|');
    
    const expectedMac = crypto
        .createHmac('sha1', config.salt)
        .update(message)
        .digest('hex');
    
    if (mac !== expectedMac) {
        return res.status(400).send('Invalid signature');
    }
    
    // Update payment status
    if (webhookData.status === 'Credit') {
        await admin.firestore()
            .collection('registrations')
            .where('paymentRequestId', '==', webhookData.payment_request_id)
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.update({
                        status: 'completed',
                        paymentId: webhookData.payment_id,
                        paidAmount: webhookData.amount,
                        paidAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                });
            });
        
        // Send confirmation email/WhatsApp
        // ... implementation
    }
    
    res.status(200).send('OK');
});
```

#### Set Firebase Config:
```bash
firebase functions:config:set \
  instamojo.api_key="YOUR_API_KEY" \
  instamojo.auth_token="YOUR_AUTH_TOKEN" \
  instamojo.salt="YOUR_SALT" \
  instamojo.redirect_url="https://yourdomain.com/success" \
  instamojo.webhook_url="https://your-project.cloudfunctions.net/handleWebhook"
```

#### Option B: Node.js/Express Backend

```javascript
// server.js
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());

// Create payment request
app.post('/api/create-payment', async (req, res) => {
    try {
        const response = await axios.post(
            process.env.INSTAMOJO_API_ENDPOINT + 'payment-requests/',
            {
                purpose: `SNEHA-SAURABHA 2025-26 - ${req.body.type}`,
                amount: req.body.amount,
                buyer_name: req.body.fullName,
                email: req.body.email,
                phone: req.body.mobile,
                redirect_url: process.env.REDIRECT_URL,
                webhook: process.env.WEBHOOK_URL,
                send_email: true,
                send_sms: true
            },
            {
                headers: {
                    'X-Api-Key': process.env.INSTAMOJO_API_KEY,
                    'X-Auth-Token': process.env.INSTAMOJO_AUTH_TOKEN
                }
            }
        );
        
        res.json({
            success: true,
            paymentUrl: response.data.payment_request.longurl,
            transactionId: response.data.payment_request.id
        });
        
    } catch (error) {
        console.error('Payment failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Webhook handler
app.post('/api/webhook/instamojo', (req, res) => {
    const webhookData = req.body;
    const mac = webhookData.mac;
    delete webhookData.mac;
    
    // Verify signature
    const message = Object.keys(webhookData)
        .sort()
        .map(key => `${key}=${webhookData[key]}`)
        .join('|');
    
    const expectedMac = crypto
        .createHmac('sha1', process.env.INSTAMOJO_SALT)
        .update(message)
        .digest('hex');
    
    if (mac !== expectedMac) {
        return res.status(400).send('Invalid signature');
    }
    
    // Process payment
    if (webhookData.status === 'Credit') {
        // Update database, send confirmations
        console.log('Payment successful:', webhookData.payment_id);
    }
    
    res.status(200).send('OK');
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

**.env file:**
```
INSTAMOJO_API_KEY=YOUR_API_KEY
INSTAMOJO_AUTH_TOKEN=YOUR_AUTH_TOKEN
INSTAMOJO_SALT=YOUR_SALT
INSTAMOJO_API_ENDPOINT=https://www.instamojo.com/api/1.1/
REDIRECT_URL=https://yourdomain.com/payment-success.html
WEBHOOK_URL=https://yourdomain.com/api/webhook/instamojo
```

### Step 4: Update Frontend Code

In `scripts/instamojo-service.js`, replace simulated calls with real API:

```javascript
async createPaymentRequest(registrationData) {
    try {
        // Call your backend API
        const response = await fetch('/api/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Redirect to Instamojo payment page
            window.location.href = data.paymentUrl;
        }
        
        return data;
        
    } catch (error) {
        console.error('Payment request failed:', error);
        return { success: false, error: error.message };
    }
}
```

## Testing Guide

### Test in Development
1. Start local server: `python3 -m http.server 8000`
2. Open: `http://localhost:8000`
3. Fill registration form
4. Click "Pay with Instamojo"
5. Check console for payment link
6. Currently simulates success after 2 seconds

### Test with Real Instamojo
1. Use test credentials (already configured)
2. Backend must be deployed
3. Payment will go to test gateway
4. Use test cards from Instamojo documentation

### Test Cards (Instamojo Test Environment)
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVV: Any 3 digits
Name: Any name
```

## Production Checklist

- [ ] Get production API credentials
- [ ] Update `instamojo-config.js` with production keys
- [ ] Change `CURRENT_ENV` to 'PRODUCTION'
- [ ] Set up backend server (Firebase/Node.js)
- [ ] Configure environment variables
- [ ] Set up webhook endpoint
- [ ] Test webhook with test payment
- [ ] Configure redirect URLs
- [ ] Set up SSL certificate
- [ ] Test complete payment flow
- [ ] Set up payment failure handling
- [ ] Configure email notifications
- [ ] Set up WhatsApp integration
- [ ] Test refund process (if needed)
- [ ] Monitor payment logs
- [ ] Set up payment reconciliation

## Security Best Practices

1. **Never expose credentials in frontend**
   - All API calls must go through backend
   - Use environment variables
   - Never commit keys to Git

2. **Verify webhook signatures**
   - Always validate MAC hash
   - Reject invalid signatures
   - Log all webhook attempts

3. **Validate amounts**
   - Check amount matches registration type
   - Prevent amount tampering
   - Log discrepancies

4. **Use HTTPS**
   - SSL certificate required
   - Secure all API endpoints
   - Redirect HTTP to HTTPS

5. **Store payment data securely**
   - Encrypt sensitive information
   - PCI DSS compliance
   - Regular security audits

## API Reference

### Create Payment Request
```
POST https://www.instamojo.com/api/1.1/payment-requests/

Headers:
  X-Api-Key: YOUR_API_KEY
  X-Auth-Token: YOUR_AUTH_TOKEN

Body:
{
  "purpose": "Registration Fee",
  "amount": "7500.00",
  "buyer_name": "John Doe",
  "email": "john@example.com",
  "phone": "9999999999",
  "redirect_url": "https://yourdomain.com/success",
  "webhook": "https://yourdomain.com/webhook",
  "send_email": true,
  "send_sms": true
}
```

### Get Payment Details
```
GET https://www.instamojo.com/api/1.1/payment-requests/{id}/{payment_id}/

Headers:
  X-Api-Key: YOUR_API_KEY
  X-Auth-Token: YOUR_AUTH_TOKEN
```

### Webhook Payload
```json
{
  "payment_id": "MOJO...",
  "payment_request_id": "...",
  "status": "Credit",
  "amount": "7500.00",
  "buyer_name": "John Doe",
  "buyer_email": "john@example.com",
  "buyer_phone": "9999999999",
  "currency": "INR",
  "fees": "187.50",
  "mac": "webhook_signature_hash"
}
```

## Troubleshooting

### Payment Link Not Generated
- Check API credentials
- Verify backend is running
- Check network console for errors
- Validate request payload

### Webhook Not Received
- Verify webhook URL is accessible
- Check server logs
- Ensure HTTPS is configured
- Test with Instamojo webhook tester

### Payment Verified But Not Updating
- Check webhook signature validation
- Verify database connection
- Check error logs
- Ensure transaction ID matches

### Amount Mismatch
- Verify amount formatting (2 decimals)
- Check currency (must be INR)
- Validate registration type pricing

## Support Resources

- **Instamojo Documentation**: https://docs.instamojo.com
- **API Reference**: https://docs.instamojo.com/reference
- **Webhook Guide**: https://docs.instamojo.com/page/webhooks
- **Test Cards**: https://docs.instamojo.com/page/test-card-details
- **Support**: support@instamojo.com

## Next Steps

1. **Immediate**: Test current implementation
2. **Before Production**: Set up backend server
3. **Deploy**: Update to production credentials
4. **Monitor**: Track all transactions
5. **Optimize**: Add analytics and reporting

---

**Current Status**: ✅ Test Environment Ready  
**Next Action**: Deploy backend and test with real gateway  
**Production Ready**: After backend deployment and testing
