# WhatsApp Confirmation Integration Guide

## Overview
This guide explains how to integrate WhatsApp confirmation messages for successful registrations in the SNEHA SAURABHA 2025-26 conference registration system.

## Options for WhatsApp Integration

### Option 1: Twilio WhatsApp API (Recommended)
**Pros:**
- Easy to set up and use
- Reliable delivery
- Good documentation
- Pay-as-you-go pricing
- Template approval process is straightforward

**Cons:**
- Slightly more expensive than alternatives
- Requires approval for WhatsApp Business templates

**Setup:**
1. Create a Twilio account at https://www.twilio.com
2. Set up WhatsApp Business Profile
3. Get approved WhatsApp templates
4. Get API credentials

### Option 2: MSG91 WhatsApp API
**Pros:**
- India-based service
- Competitive pricing
- Good for Indian phone numbers
- Fast template approval

**Cons:**
- Documentation could be better
- Limited international reach

**Setup:**
1. Create account at https://msg91.com
2. Set up WhatsApp Business API
3. Create and approve templates
4. Get API credentials

### Option 3: WhatsApp Business API (Direct)
**Pros:**
- Most cost-effective long-term
- Complete control
- No intermediary

**Cons:**
- Complex setup
- Requires business verification
- Longer approval process
- Needs Facebook Business Manager

### Option 4: Interakt / AiSensy (India-focused)
**Pros:**
- Designed for Indian businesses
- Easy template creation
- Quick approvals
- Good support

**Cons:**
- Monthly subscription based
- May be overkill for one-time event

---

## Recommended Implementation: Twilio WhatsApp API

### Step 1: Setup Twilio Account

1. Sign up at https://www.twilio.com/try-twilio
2. Verify your phone number
3. Enable WhatsApp in your Twilio console
4. Note your:
   - Account SID
   - Auth Token
   - WhatsApp-enabled phone number (starts with whatsapp:+14...)

### Step 2: Create WhatsApp Message Template

**Template Name:** `sneha_saurabha_confirmation`

**Template Content:**
```
Dear {{1}},

✅ Your registration for SNEHA SAURABHA 2025-26 is confirmed!

📋 Confirmation ID: {{2}}
💰 Amount Paid: ₹{{3}}

📅 Event Date: 30-31 Jan & 1 Feb 2026
📍 Venue: Silent Shores Resort, Mysore

Your detailed registration ticket will be sent shortly.

See you at Mysore! 🙏

- Team SNEHA SAURABHA
Rotary District 3181
```

### Step 3: Get Template Approved

1. Submit template in Twilio console
2. Wait for WhatsApp approval (usually 24-48 hours)
3. Once approved, note the template SID

### Step 4: Environment Variables

Add to your `.env` file:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
WHATSAPP_TEMPLATE_SID=your_template_sid_here
```

### Step 5: Create API Endpoint

Create `/api/send-whatsapp-confirmation.js`:

```javascript
// api/send-whatsapp-confirmation.js
const twilio = require('twilio');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { 
      mobile, 
      name, 
      confirmationId, 
      amount 
    } = req.body;

    // Validate required fields
    if (!mobile || !name || !confirmationId || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Format mobile number for WhatsApp (must include country code)
    const formattedMobile = mobile.startsWith('+91') 
      ? `whatsapp:${mobile}` 
      : `whatsapp:+91${mobile}`;

    // Initialize Twilio client
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Send WhatsApp message using approved template
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: formattedMobile,
      body: `Dear ${name},

✅ Your registration for SNEHA SAURABHA 2025-26 is confirmed!

📋 Confirmation ID: ${confirmationId}
💰 Amount Paid: ₹${amount.toLocaleString('en-IN')}

📅 Event Date: 30-31 Jan & 1 Feb 2026
📍 Venue: Silent Shores Resort, Mysore

Your detailed registration ticket will be sent shortly.

See you at Mysore! 🙏

- Team SNEHA SAURABHA
Rotary District 3181`
    });

    console.log('✅ WhatsApp message sent:', message.sid);

    return res.status(200).json({
      success: true,
      messageSid: message.sid,
      message: 'WhatsApp confirmation sent successfully'
    });

  } catch (error) {
    console.error('❌ WhatsApp send error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send WhatsApp message'
    });
  }
}
```

### Step 6: Update Payment Verification API

Modify `/api/cashfree/verify.js` to send WhatsApp after successful payment:

```javascript
// Add this after successful payment verification
if (paymentSuccess && registration) {
  // Send WhatsApp confirmation
  try {
    const whatsappResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/send-whatsapp-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: registration.mobile,
        name: registration.name,
        confirmationId: registration.confirmationId,
        amount: registration.amount
      })
    });

    const whatsappResult = await whatsappResponse.json();
    
    if (whatsappResult.success) {
      console.log('✅ WhatsApp confirmation sent to:', registration.mobile);
    } else {
      console.error('❌ WhatsApp send failed:', whatsappResult.error);
      // Don't fail the payment verification if WhatsApp fails
    }
  } catch (whatsappError) {
    console.error('❌ WhatsApp API error:', whatsappError);
    // Continue - WhatsApp failure shouldn't affect registration
  }
}
```

### Step 7: Install Dependencies

```bash
npm install twilio
```

### Step 8: Testing

**Test Mode (Sandbox):**
1. Add your test number to Twilio WhatsApp sandbox
2. Send "join <your-sandbox-name>" from your WhatsApp
3. Test the API endpoint

**Production Mode:**
1. Complete business verification
2. Submit templates for approval
3. Use approved templates only
4. Monitor delivery reports

---

## Alternative: MSG91 Implementation

### Environment Variables
```env
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_SENDER_ID=your_sender_id
MSG91_TEMPLATE_ID=your_template_id
```

### API Endpoint
```javascript
// api/send-whatsapp-confirmation.js (MSG91 version)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { mobile, name, confirmationId, amount } = req.body;

    if (!mobile || !name || !confirmationId || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    const formattedMobile = mobile.startsWith('91') ? mobile : `91${mobile}`;

    const response = await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/', {
      method: 'POST',
      headers: {
        'authkey': process.env.MSG91_AUTH_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        integrated_number: process.env.MSG91_SENDER_ID,
        content_type: 'template',
        payload: {
          messaging_product: 'whatsapp',
          to: formattedMobile,
          type: 'template',
          template: {
            name: process.env.MSG91_TEMPLATE_ID,
            language: {
              code: 'en'
            },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: name },
                  { type: 'text', text: confirmationId },
                  { type: 'text', text: amount.toString() }
                ]
              }
            ]
          }
        }
      })
    });

    const result = await response.json();

    if (result.type === 'success') {
      return res.status(200).json({
        success: true,
        messageId: result.message,
        message: 'WhatsApp confirmation sent successfully'
      });
    } else {
      throw new Error(result.message || 'Failed to send WhatsApp');
    }

  } catch (error) {
    console.error('❌ MSG91 WhatsApp error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send WhatsApp message'
    });
  }
}
```

---

## Pricing Comparison (Approximate)

| Service | Setup Cost | Per Message | Monthly Fee | Best For |
|---------|-----------|-------------|-------------|----------|
| Twilio | Free | ₹0.60-1.20 | None | Global reach, reliability |
| MSG91 | Free | ₹0.40-0.80 | None | India-focused, budget |
| WhatsApp Direct | Business verification | ₹0.30-0.60 | Varies | High volume |
| Interakt/AiSensy | Free | Included | ₹2000-5000 | Marketing + automation |

**For 500 registrations:**
- Twilio: ~₹300-600
- MSG91: ~₹200-400
- Direct API: ~₹150-300 (after setup costs)

---

## Testing Checklist

- [ ] Twilio account created and verified
- [ ] WhatsApp Business Profile set up
- [ ] Message template created and approved
- [ ] Environment variables configured
- [ ] API endpoint created and deployed
- [ ] Test message sent successfully
- [ ] Payment verification triggers WhatsApp
- [ ] Mobile number formatting works correctly
- [ ] Error handling tested (invalid number, API failure)
- [ ] Delivery reports monitored

---

## Troubleshooting

### Common Issues

1. **"Template not found"**
   - Ensure template is approved by WhatsApp
   - Check template name/ID is correct
   - Verify template language code

2. **"Invalid phone number"**
   - Must include country code (+91 for India)
   - Format: `whatsapp:+919876543210`
   - Remove spaces, dashes, parentheses

3. **"Authentication failed"**
   - Check Account SID and Auth Token
   - Verify environment variables are loaded
   - Check credentials haven't expired

4. **"Rate limit exceeded"**
   - Implement queue system for bulk sends
   - Add delays between messages
   - Upgrade Twilio plan if needed

5. **Message not delivered**
   - Verify recipient has WhatsApp
   - Check number is correctly formatted
   - Review Twilio console for delivery status
   - Ensure template matches approved version

---

## Production Deployment

### Pre-launch
1. ✅ Complete business verification
2. ✅ Get all templates approved
3. ✅ Test with 10+ different numbers
4. ✅ Set up monitoring and logging
5. ✅ Configure fallback (SMS if WhatsApp fails)

### Launch
1. Monitor delivery rates
2. Check for failed messages
3. Have backup SMS system ready
4. Keep support contact available

### Post-launch
1. Review delivery reports daily
2. Handle bounced messages
3. Respond to user queries
4. Archive messages for records

---

## Next Steps

1. Choose WhatsApp service provider
2. Create account and get credentials
3. Create message template
4. Get template approved
5. Implement API endpoint
6. Test with sandbox/test numbers
7. Deploy to production
8. Monitor first batch of confirmations

---

## Support Contacts

- **Twilio Support:** https://support.twilio.com
- **MSG91 Support:** support@msg91.com
- **WhatsApp Business:** https://business.whatsapp.com

---

**Note:** Always test thoroughly in sandbox/staging before production deployment. Keep API credentials secure and never commit them to version control.
