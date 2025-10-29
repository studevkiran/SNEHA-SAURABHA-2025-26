# PhonePe Payment Gateway Integration Guide

## 📋 Current Setup

### Test Credentials (Already Configured)
```
Client ID: TEST-M233JOFST81KT_25102
Client Version: 1
Client Secret: NzQ0Yjc5Y2QtYjY1NC00Mjk3LThiZTMtMmEwNThlM2U0ODQ5
Environment: TEST/SANDBOX
```

## 🚀 How It Works

### Current Implementation (Frontend Only)
1. User fills registration form
2. Clicks "Pay with PhonePe"
3. Payment service initiates transaction
4. **Simulated payment** (for testing without backend)
5. Success/failure handled
6. Receipt generated with QR code

### Production Implementation (With Backend)
1. User fills registration form
2. Frontend sends data to your backend API
3. Backend creates PhonePe payment request
4. PhonePe returns payment URL
5. User redirected to PhonePe payment page
6. User completes payment
7. PhonePe sends callback to your server
8. Server verifies payment
9. Frontend shows success/receipt

---

## 🔧 Setup for Production

### Step 1: Get Production Credentials from PhonePe
1. Go to [PhonePe Merchant Dashboard](https://business.phonepe.com/)
2. Complete KYC and registration
3. Get your production credentials:
   - Merchant ID
   - Salt Key
   - Salt Index
   - Client Secret

### Step 2: Update Configuration
Edit `config/phonepe-config.js`:

```javascript
PRODUCTION: {
    merchantId: 'YOUR_ACTUAL_MERCHANT_ID',
    clientSecret: 'YOUR_ACTUAL_CLIENT_SECRET',
    apiEndpoint: 'https://api.phonepe.com/apis/hermes',
    saltKey: 'YOUR_ACTUAL_SALT_KEY',
    saltIndex: 'YOUR_SALT_INDEX'
},

// Change this line:
CURRENT_ENV: 'PRODUCTION',  // Change from 'TEST' to 'PRODUCTION'
```

### Step 3: Set Up Backend (Required for Production)

**Why Backend is Needed:**
- Generate secure checksums (can't expose salt key in frontend)
- Verify payment callbacks
- Store transaction data
- Prevent payment tampering

**Backend Options:**

#### Option A: Firebase Cloud Functions (Recommended)
```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

exports.initiatePayment = functions.https.onCall(async (data, context) => {
    // Create payment request
    // Generate checksum
    // Call PhonePe API
    // Return payment URL
});

exports.phonepeCallback = functions.https.onRequest(async (req, res) => {
    // Verify checksum
    // Update payment status in Firestore
    // Send confirmation email/WhatsApp
});
```

#### Option B: Node.js Express Server
```javascript
// server.js
const express = require('express');
const crypto = require('crypto');
const app = express();

app.post('/api/initiate-payment', async (req, res) => {
    // Handle payment initiation
});

app.post('/api/phonepe-callback', async (req, res) => {
    // Handle PhonePe callback
});
```

### Step 4: Update Callback URLs
In PhonePe dashboard, set:
```
Callback URL: https://yourdomain.com/api/phonepe-callback
Redirect URL: https://yourdomain.com/payment-success
```

### Step 5: Update Frontend Code
In `config/phonepe-config.js`:
```javascript
CALLBACK_URL: 'https://yourdomain.com/api/phonepe-callback',
REDIRECT_URL: 'https://yourdomain.com/payment-success',
```

---

## 🧪 Testing

### Test Mode (Current Setup)
- Uses sandbox credentials
- No real money transactions
- Payment flow simulated
- Perfect for UI testing

### Test Payment Flows
```javascript
// In browser console:
// Test successful payment
initiatePhonePePayment();

// Test failed payment
processPayment('failed');
```

### Production Testing
1. Use PhonePe test cards (provided by PhonePe)
2. Test UPI with your personal account
3. Verify callback handling
4. Check database updates
5. Confirm email/WhatsApp delivery

---

## 📱 Payment Flow Diagram

```
User Registration
       ↓
Review Details
       ↓
Click "Pay with PhonePe"
       ↓
Frontend → Backend API
       ↓
Backend → PhonePe API
       ↓
PhonePe Returns Payment URL
       ↓
User Redirected to PhonePe
       ↓
User Completes Payment
       ↓
PhonePe → Backend Callback
       ↓
Backend Verifies Payment
       ↓
Backend Updates Database
       ↓
Backend Sends Confirmation
       ↓
User Redirected to Success Page
       ↓
Show Receipt with QR Code
```

---

## 🔒 Security Checklist

### ✅ Before Going Live
- [ ] Move salt key to backend (NEVER in frontend)
- [ ] Implement checksum verification
- [ ] Use HTTPS everywhere
- [ ] Validate all callback data
- [ ] Store credentials in environment variables
- [ ] Add rate limiting
- [ ] Log all transactions
- [ ] Implement fraud detection
- [ ] Set up monitoring/alerts
- [ ] Test callback failure scenarios

### Environment Variables (Backend)
```bash
# .env file (NEVER commit to GitHub)
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_SALT_KEY=your_salt_key
PHONEPE_SALT_INDEX=1
PHONEPE_CLIENT_SECRET=your_client_secret
PHONEPE_API_ENDPOINT=https://api.phonepe.com/apis/hermes
```

---

## 📊 Transaction Data Structure

```javascript
{
  transactionId: "SS170987654321",
  confirmationId: "SS12345678",
  merchantId: "M233JOFST81KT",
  merchantTransactionId: "TXN1698765432",
  amount: 450000, // in paise (₹4,500)
  status: "SUCCESS", // or FAILED
  paymentMethod: "UPI",
  upiId: "user@paytm",
  timestamp: "2025-10-29T10:30:00Z",
  userData: {
    name: "John Doe",
    mobile: "9876543210",
    email: "john@example.com",
    registrationType: "Rotarian"
  }
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Checksum Mismatch
**Solution:** Ensure salt key is correct and checksum generation logic matches PhonePe docs

### Issue 2: Callback Not Received
**Solution:** Check callback URL in dashboard, verify server is publicly accessible

### Issue 3: Payment Success but Database Not Updated
**Solution:** Add retry logic, implement queue system, check logs

### Issue 4: CORS Errors
**Solution:** Configure backend CORS to allow your frontend domain

---

## 📞 PhonePe Support

- **Developer Docs:** https://developer.phonepe.com/docs
- **Support Email:** developer.support@phonepe.com
- **Integration Help:** Your relationship manager
- **Test Environment:** https://mercury-t2.phonepe.com/

---

## 🚀 Next Steps

1. **This Week:**
   - ✅ Test current setup locally
   - ✅ Verify UI/UX
   - ✅ Test payment flow

2. **When Backend Ready:**
   - Add server-side payment initiation
   - Implement callback handling
   - Add database storage
   - Test end-to-end

3. **Before Launch:**
   - Switch to production credentials
   - Complete security audit
   - Load testing
   - Go live!

---

## 📝 Notes

- **Current Status:** Frontend integration complete, using test credentials
- **Next Required:** Backend API for production
- **Timeline:** Backend can be added when needed (we have 3 months)
- **Cost:** PhonePe charges 1.5-2% per transaction

---

**Last Updated:** 29 October 2025  
**Status:** Test Mode Active ✅
