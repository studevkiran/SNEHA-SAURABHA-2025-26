# 📱 Infobip WhatsApp Integration Guide

## Step 1: Get Infobip Credentials

1. **Login to Infobip Portal**: https://portal.infobip.com/homepage
2. **Get API Key**:
   - Go to **Settings** (gear icon) → **API Keys**
   - Click **Create API Key**
   - Name it: "SNEHA-SAURABHA WhatsApp"
   - Copy the API Key (you'll only see it once!)

3. **Get Base URL**:
   - Usually: `https://api.infobip.com`
   - Or check your account region (EU/US)

4. **Get WhatsApp Sender**:
   - Go to **Channels & Numbers** → **WhatsApp**
   - Note your WhatsApp Business number (e.g., `919980557785`)

## Step 2: Add to Vercel Environment Variables

1. Go to Vercel Dashboard: https://vercel.com/kirans-projects-cb89f9d8/sneha2026
2. Click **Settings** → **Environment Variables**
3. Add these 3 variables:

```
INFOBIP_API_KEY = your_api_key_here
INFOBIP_BASE_URL = https://api.infobip.com
INFOBIP_WHATSAPP_NUMBER = 919980557785
```

4. Click **Save**

## Step 3: Test the Integration

After deployment, when a user completes payment:
- ✅ They'll automatically receive WhatsApp confirmation
- ✅ Message includes Registration ID, Name, Event Details
- ✅ Uses your 100 free testing messages

## Message Format

```
✅ REGISTRATION CONFIRMED

Registration ID: ROT01V1234
Name: John Doe
Type: Rotarian
Amount: ₹5,000

📅 Event: SNEHA-SAURABHA 2025-26
📍 Venue: Silent Shores, Mysore
📆 Date: 30-31 Jan & 1 Feb 2026

Meal: Veg
Club: Mangalore

Thank you for registering!

Need help? WhatsApp: +91 99805 57785
```

## Testing Checklist

✅ API Key added to Vercel
✅ WhatsApp number configured
✅ Make test registration with ₹1
✅ Check if WhatsApp message received
✅ Check Infobip portal for message status

## Troubleshooting

**No message received?**
1. Check Infobip portal → **Logs** → **Messages**
2. Verify WhatsApp number is correct format (919980557785)
3. Check Vercel logs: `vercel logs --follow`

**"Quota exceeded" error?**
- You've used all 100 free messages
- Top up your account in Infobip portal

**Message shows as "Pending"?**
- WhatsApp number not verified with Infobip
- Contact Infobip support to verify number

## Cost Information

- **Free Tier**: 100 messages for testing
- **After 100**: Pay as you go (check Infobip pricing)
- **Recommendation**: Use carefully during testing
- **Tip**: Test with your own number first!

## Current Status

🔧 Integration code is ready in the project
⏳ Waiting for environment variables to be set
🚀 Will work automatically after deployment

---

**Next Step:** Add the 3 environment variables in Vercel, then redeploy!
