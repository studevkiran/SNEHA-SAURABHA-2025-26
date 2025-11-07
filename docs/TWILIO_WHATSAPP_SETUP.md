# Twilio WhatsApp Integration Setup Guide

## Step 1: Create Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up (Free trial includes $15 credit)
3. Verify your email and phone number

## Step 2: Get WhatsApp Enabled

1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow the sandbox setup (for testing)
3. For production, apply for WhatsApp Business API approval

## Step 3: Get Your Credentials

From Twilio Console Dashboard:
- **Account SID**: Found on dashboard (starts with AC...)
- **Auth Token**: Found on dashboard (click to reveal)
- **WhatsApp Number**: Your Twilio WhatsApp-enabled number (format: whatsapp:+14155238886)

## Step 4: Create Message Template

For production, you need to create and get approved a message template in Twilio.

**Template Name**: `sneha_saurabha_confirmation`

**Template Content** (with variables):
```
Hi {{1}},

🎯 Thank you for registering to SNEHA SAURABHA 2025-26, District Conference
happening at Silent Shores, Mysore on 30th & 31st January & 01st February 2026

We're thrilled to have you on board for this district event that celebrates knowledge, friendship and fellowship.

📋 Registration Details:

✒️Registration No.: {{2}}
📄Receipt No.: {{3}}
👤 Name: {{4}}
📞 Mobile: {{5}}
📧 Email: {{6}}
🍽️ Food Preference: {{7}}

✅ Amount Paid: ₹{{8}}

Looking forward to an inspiring experience together!

Warm regards,
Team Sneha Saurabha 2025-26 – Rotary District Conference 3181
```

## Step 5: Add Environment Variables to Vercel

Go to Vercel Dashboard → Settings → Environment Variables and add:

```
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## Step 6: Test in Sandbox Mode

Before going live, test with Twilio Sandbox:
1. Send "join <sandbox-keyword>" to Twilio sandbox number
2. Use sandbox number for testing
3. Test with your own phone number first

## Step 7: Go Live

1. Apply for WhatsApp Business API access in Twilio Console
2. Submit business verification documents
3. Wait for approval (usually 1-2 weeks)
4. Update TWILIO_WHATSAPP_NUMBER with your approved business number

## Pricing

- **Sandbox (Testing)**: FREE
- **Production Messages**: 
  - India: ~₹0.35 per message
  - 500 messages = ~₹175
  - 1000 messages = ~₹350

## Support

- Twilio Docs: https://www.twilio.com/docs/whatsapp
- Template Approval: https://console.twilio.com/us1/develop/sms/content-editor
