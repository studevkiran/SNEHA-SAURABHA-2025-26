# WhatsApp Confirmation Message - Implementation Guide

## Overview
This guide explains how to set up automated WhatsApp confirmation messages for SNEHA SAURABHA 2025-26 registration system.

---

## Option 1: Twilio WhatsApp Business API (Recommended)

### Why Twilio?
- ✅ Reliable and well-documented
- ✅ Easy integration
- ✅ Official WhatsApp Business API partner
- ✅ Pay-as-you-go pricing
- ✅ Template message support

### Setup Steps:

#### 1. Create Twilio Account
- Go to: https://www.twilio.com/
- Sign up for free trial (includes $15 credit)
- Verify your phone number

#### 2. Set Up WhatsApp Sandbox (for testing)
```bash
# Send a WhatsApp message to Twilio's sandbox number
# Number: +1 415 523 8886
# Message: join <your-sandbox-code>
```

#### 3. Get Credentials
- Account SID: Found in Twilio Console Dashboard
- Auth Token: Found in Twilio Console Dashboard
- WhatsApp Number: `whatsapp:+14155238886` (sandbox) or your approved number

#### 4. Add Environment Variables
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

#### 5. Install Twilio SDK
```bash
npm install twilio
```

#### 6. Implementation Code

**File: `api/send-whatsapp-confirmation.js`** (Vercel Serverless Function)

```javascript
const twilio = require('twilio');

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            mobile,
            fullName,
            registrationId,
            typeName,
            clubName,
            mealPreference,
            price,
            transactionId,
            paymentDate
        } = req.body;

        // Validate required fields
        if (!mobile || !fullName || !registrationId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Initialize Twilio client
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        // Format mobile number (ensure it starts with country code)
        const formattedMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`;

        // Create message content
        const message = `🎉 *REGISTRATION CONFIRMED*

*SNEHA SAURABHA 2025-26*
Rotary District Conference

📋 *Registration Details:*
• ID: ${registrationId}
• Name: ${fullName}
• Type: ${typeName}
• Club: ${clubName}
• Meal: ${mealPreference}

💰 *Payment Details:*
• Amount: ₹${price.toLocaleString('en-IN')}
• Transaction ID: ${transactionId}
• Date: ${paymentDate}

📍 *Event Information:*
• Venue: Silent Shores Resort, Mysore
• Dates: 30-31 Jan & 1 Feb 2026

⚠️ *IMPORTANT:*
Please carry this confirmation message and your downloaded PDF receipt for venue check-in.

📞 For queries: +91 9980557785

Thank you for registering! We look forward to seeing you at the event.`;

        // Send WhatsApp message
        const response = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${formattedMobile}`,
            body: message
        });

        console.log('✅ WhatsApp message sent:', response.sid);

        return res.status(200).json({
            success: true,
            messageSid: response.sid,
            message: 'WhatsApp confirmation sent successfully'
        });

    } catch (error) {
        console.error('❌ Error sending WhatsApp:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
```

#### 7. Update Frontend (Call API after payment success)

**In `public/scripts/app.js` - after payment success:**

```javascript
// Inside processPayment function, after registrationData is populated
async function sendWhatsAppConfirmation() {
    try {
        const response = await fetch('/api/send-whatsapp-confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mobile: registrationData.mobile,
                fullName: registrationData.fullName,
                registrationId: registrationData.confirmationId,
                typeName: registrationData.typeName,
                clubName: registrationData.clubName,
                mealPreference: registrationData.mealPreference,
                price: registrationData.price,
                transactionId: registrationData.transactionId,
                paymentDate: registrationData.paymentDate
            })
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('✅ WhatsApp confirmation sent successfully');
        } else {
            console.error('⚠️ WhatsApp sending failed:', data.error);
        }
    } catch (error) {
        console.error('❌ Error calling WhatsApp API:', error);
    }
}

// Call it after payment success
if (status === 'success') {
    // ... existing code to populate acknowledgment page ...
    
    // Send WhatsApp confirmation (don't wait for it)
    sendWhatsAppConfirmation().catch(err => {
        console.error('WhatsApp error:', err);
    });
    
    // Show acknowledgment screen
    showScreen('screen-acknowledgment');
}
```

---

## Option 2: MSG91 (Indian Provider)

### Why MSG91?
- ✅ India-based provider
- ✅ Competitive pricing
- ✅ Good for Indian phone numbers
- ✅ Easy documentation

### Setup Steps:

#### 1. Create MSG91 Account
- Go to: https://msg91.com/
- Sign up and verify email
- Complete KYC if required

#### 2. Get API Credentials
- Auth Key: Found in MSG91 Dashboard
- Sender ID: Your registered sender ID (e.g., "SNEHA")

#### 3. Environment Variables
```env
MSG91_AUTH_KEY=your_auth_key_here
MSG91_SENDER_ID=SNEHA
```

#### 4. Implementation Code

**File: `api/send-whatsapp-msg91.js`**

```javascript
import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { mobile, fullName, registrationId, price } = req.body;

        const message = `🎉 Registration Confirmed!\n\nID: ${registrationId}\nName: ${fullName}\nAmount: ₹${price}\n\nSNEHA SAURABHA 2025-26\nSilent Shores Resort, Mysore\n30-31 Jan & 1 Feb 2026`;

        const response = await axios.post(
            `https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/`,
            {
                integrated_number: process.env.MSG91_SENDER_ID,
                content_type: 'text',
                payload: {
                    messaging_product: 'whatsapp',
                    to: `91${mobile}`,
                    type: 'text',
                    text: {
                        body: message
                    }
                }
            },
            {
                headers: {
                    'authkey': process.env.MSG91_AUTH_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        return res.status(200).json({ success: true, data: response.data });

    } catch (error) {
        console.error('MSG91 Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
```

---

## Option 3: WhatsApp Business API (Official)

### Requirements:
- Facebook Business Manager account
- Verified business
- WhatsApp Business Account
- More complex setup but official

### Setup:
1. Go to: https://developers.facebook.com/
2. Create Business App
3. Add WhatsApp Product
4. Get approval from Meta
5. Use Graph API to send messages

**Note:** This is more suitable for large-scale operations and requires Meta's approval.

---

## Testing Checklist

### Before Going Live:

1. **Test with Sandbox** (Twilio)
   - [ ] Send test message to your number
   - [ ] Verify message formatting
   - [ ] Check special characters render correctly

2. **Test Registration Flow**
   - [ ] Complete a test registration
   - [ ] Verify WhatsApp message arrives within 30 seconds
   - [ ] Check all data is correct in message

3. **Error Handling**
   - [ ] Test with invalid phone numbers
   - [ ] Test when WhatsApp API is down
   - [ ] Ensure app doesn't break if WhatsApp fails

4. **Load Testing**
   - [ ] Test multiple registrations in quick succession
   - [ ] Monitor API rate limits
   - [ ] Check message delivery rates

---

## Production Considerations

### 1. Template Messages (for Twilio)
For production, you MUST use pre-approved template messages:
```
Template Name: registration_confirmation
Language: English
Category: TRANSACTIONAL

Template Content:
Your registration for SNEHA SAURABHA is confirmed!
Registration ID: {{1}}
Name: {{2}}
Amount: {{3}}
Event: 30-31 Jan & 1 Feb 2026
```

### 2. Rate Limits
- Twilio: ~1 message per second (can be increased)
- MSG91: Check your plan limits
- Add queue system for high volume

### 3. Cost Estimation
**Twilio Pricing:**
- WhatsApp Template messages: $0.005 per message (India)
- ~₹0.42 per message
- For 1000 registrations: ~₹420

**MSG91 Pricing:**
- Check current pricing on their website
- Usually competitive for Indian numbers

### 4. Fallback Strategy
```javascript
async function sendConfirmation(data) {
    try {
        // Primary: WhatsApp
        await sendWhatsApp(data);
    } catch (error) {
        console.error('WhatsApp failed, trying SMS');
        // Fallback: SMS
        await sendSMS(data);
    }
}
```

---

## Security Best Practices

1. **Never expose API keys in frontend code**
2. **Use environment variables for all credentials**
3. **Validate phone numbers before sending**
4. **Rate limit API endpoint to prevent abuse**
5. **Log all WhatsApp sends for audit trail**
6. **Store message delivery status in database**

---

## Monitoring & Logs

### What to Log:
```javascript
{
  timestamp: new Date(),
  registrationId: 'RN15V1234',
  mobile: '9876543210',
  messageSid: 'SM...', // Twilio message ID
  status: 'sent' | 'delivered' | 'failed',
  error: null or error message
}
```

### Set up Alerts for:
- Failed message delivery
- API errors
- Rate limit warnings
- Unusual sending patterns

---

## Quick Start (For Testing NOW)

### Option 1: Twilio Sandbox (Fastest)

```bash
# 1. Sign up on Twilio
# 2. Get sandbox WhatsApp number
# 3. Join sandbox from your phone

# 4. Test with curl
curl -X POST https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json \
  --data-urlencode "From=whatsapp:+14155238886" \
  --data-urlencode "To=whatsapp:+919876543210" \
  --data-urlencode "Body=Test message from SNEHA SAURABHA" \
  -u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN
```

### Option 2: Test Without WhatsApp
Use SMS as temporary solution while setting up WhatsApp:
```javascript
// Send SMS instead
await client.messages.create({
    from: '+1234567890', // Your Twilio number
    to: '+919876543210',
    body: 'Registration confirmed! ID: RN15V1234'
});
```

---

## Next Steps

1. **Choose provider** (Recommend: Twilio for quick start)
2. **Set up sandbox account** (takes 5 minutes)
3. **Test with your phone number**
4. **Implement API endpoint** (copy code above)
5. **Integrate with payment flow**
6. **Test end-to-end flow**
7. **Apply for production approval** (if needed)
8. **Go live!**

---

## Support & Resources

### Twilio:
- Docs: https://www.twilio.com/docs/whatsapp
- Support: https://support.twilio.com/
- Status: https://status.twilio.com/

### MSG91:
- Docs: https://docs.msg91.com/
- Support: support@msg91.com

### Need Help?
Contact: +91 9980557785
