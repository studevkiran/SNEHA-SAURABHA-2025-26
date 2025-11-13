# 🚀 Gupshup WhatsApp Integration Guide

## Why Gupshup?
- ✅ India-based, excellent support
- ✅ ₹0.25-0.35 per message (3000 messages = ₹1,050)
- ✅ Fast template approval (2-4 hours)
- ✅ Use your existing business number
- ✅ Simple API integration

## Step 1: Create Gupshup Account

1. **Go to**: https://www.gupshup.io/whatsapp-business-api
2. Click **"Get Started Free"** or **"Sign Up"**
3. Sign up with:
   - Email: your_email@example.com
   - Phone: Your business number
   - Company: SNEHA SAURABHA / Rotary District 3181
4. **Verify email and phone**
5. **OR** Login if you already have account: https://www.gupshup.io/developer/home

## Step 2: Access WhatsApp API

1. After login, go to: https://www.gupshup.io/whatsappassistant/
2. Click **"Get Started with WhatsApp API"**
3. Choose: **"I want to use my existing number"**
   - OR: **"Get a new number"** (if you don't have one)

## Step 3: Facebook Business Manager Setup

You'll need:
1. **Facebook Business Manager Account**
   - Go to: https://business.facebook.com/
   - Create account (free)
   - Add your business name: "Rotary District 3181" or "SNEHA SAURABHA"

2. **Facebook Business Page**
   - Create a page for your organization
   - OR link existing Rotary page

3. **Connect in Gupshup**
   - Gupshup will guide you to connect Facebook
   - Click "Connect Facebook Business Manager"
   - Authorize Gupshup

## Step 4: Register Your Phone Number

1. **Phone Number Requirements**:
   - Must NOT have WhatsApp installed
   - Can be: New SIM, Landline, or Existing business number
   - For testing: Buy a new ₹100 SIM card

2. **In Gupshup**:
   - Enter phone number (without WhatsApp)
   - They'll send OTP via SMS or call
   - Verify the OTP
   - Wait 1-2 days for Meta approval

## Step 5: Get API Credentials

Once approved:

1. Go to: **Settings** → **API Keys**
2. Copy these values:
   - **App Name** (e.g., sneha-saurabha-2026)
   - **API Key** (long string)
   
3. Note your WhatsApp sender number

## Step 6: Create Message Template

1. Go to: **Templates** → **Create Template**

2. **Template Details**:
   - **Name**: `registration_confirmation` (lowercase, no spaces)
   - **Category**: Utility
   - **Language**: English

3. **Message Content**:
```
✅ *REGISTRATION CONFIRMED*

Hi {{1}}, 👋

🎯 Thank you for registering to SNEHA SAURABHA 2025-26, District Conference happening at Silent Shores, Mysore on 30th & 31st January & 01st February 2026

📋 *Registration Details:*
✒️ Registration No.: {{2}}
👤 Name: {{3}}
📞 Mobile: {{4}}
📧 Email: {{5}}
🍽️ Food Preference: {{6}}
🎪 Club: {{7}}
✅ Amount Paid: ₹{{8}}

Looking forward to an inspiring experience together!

Warm regards,
Team Sneha Saurabha 2025-26 – Rotary District Conference 3181

*Need help?*
WhatsApp: +91 99805 57785
```

4. **Add Placeholders**:
   - {{1}} = Customer first name
   - {{2}} = Registration ID
   - {{3}} = Full name
   - {{4}} = Mobile number
   - {{5}} = Email
   - {{6}} = Meal preference
   - {{7}} = Club name
   - {{8}} = Amount

5. **Submit for Approval**
   - Click "Submit"
   - Wait 2-4 hours (usually faster!)
   - Check status in Templates section

## Step 7: Add to Vercel Environment Variables

Once approved, add to Vercel:

```
GUPSHUP_APP_NAME=your_app_name
GUPSHUP_API_KEY=your_api_key_here
GUPSHUP_PHONE_NUMBER=919902772262
GUPSHUP_TEMPLATE_ID=registration_confirmation
```

**How to add:**
1. Go to: https://vercel.com/kirans-projects-cb89f9d8/sneha2026/settings/environment-variables
2. Add each variable above
3. Set to **Production** environment
4. Save

## Step 8: Deploy and Test

```bash
vercel --prod
```

Then test at: https://sneha2026.vercel.app/test-whatsapp.html

## Pricing Breakdown

**For 3000 registrations:**
- 3000 messages × ₹0.35 = **₹1,050**
- No monthly fees
- Pay only for what you send

**Message Types:**
- **Utility** (registration confirmations): ₹0.25/msg
- **Marketing** (promotional): ₹0.35/msg
- **Service** (support replies): ₹0.15/msg

## Template Approval Tips

✅ **Do:**
- Use clear business language
- Include opt-out option (if marketing)
- Use placeholders for personalization
- Keep under 1024 characters

❌ **Don't:**
- Use spammy words ("Free", "Win", "Click now")
- Add external links (unless needed)
- Use ALL CAPS excessively
- Include promotional content in utility templates

## Testing Checklist

After setup:
- [ ] Account created and verified
- [ ] Phone number registered with Meta
- [ ] Template approved by WhatsApp
- [ ] API credentials added to Vercel
- [ ] Environment variables saved
- [ ] Code deployed to production
- [ ] Test message sent successfully
- [ ] Message received on mobile

## Support

**Gupshup Support:**
- Email: support@gupshup.io
- Docs: https://docs.gupshup.io/
- Dashboard: https://www.gupshup.io/whatsappassistant/

**Common Issues:**
- **Template rejected**: Too promotional, simplify language
- **Number not approved**: Check Facebook Business Manager status
- **Messages not sending**: Verify API key and app name
- **Rate limiting**: Gupshup allows 80 messages/second

## Production Readiness

✅ Once template is approved, you can:
- Send to ANY phone number (not just verified)
- Send 3000+ messages
- Track delivery status
- Get read receipts
- Reply to customer messages

**Estimated Timeline:**
- Day 1: Account setup, number registration
- Day 2-3: Meta approval for number
- Day 3: Template submission
- Day 3-4: Template approval (2-4 hours usually)
- Day 4: Go live! 🚀

---

**Next Steps:**
1. Create Gupshup account: https://www.gupshup.io/developer/home
2. Complete Facebook Business Manager setup
3. Register your phone number
4. Create template (copy message above)
5. Add credentials to Vercel
6. Deploy and test!

**Need help? Contact Gupshup support or check their docs!** 📱✨
