# 🚀 Gupshup WhatsApp - Quick Start Guide

## ✅ What You Need (5 Minutes)

### 1. Sign Up
**Go to**: https://www.gupshup.io/whatsapp-business-api

- Click "Get Started Free"
- Email: your_email@domain.com
- Create password
- Verify email

### 2. Get Your Credentials

After login, go to Dashboard:

1. **API Key**: Dashboard → Settings → API Key (copy this)
2. **App Name**: Your WhatsApp sender number/name
3. **Phone Number**: Register your business number

### 3. Create Message Template

**Template Name**: `registration_confirmation`

**Template Category**: Utility

**Template Content**:
```
Hi {{1}}, 👋

🎯 Thank you for registering to SNEHA SAURABHA 2025-26, District Conference
happening at Silent Shores, Mysore on 30th & 31st January & 01st February 2026

We're thrilled to have you on board for this district event that celebrates knowledge, friendship and fellowship.

📋 Registration Details:

✒️ Registration No.: {{2}}
👤 Name: {{1}}
📞 Mobile: {{7}}
📧 Email: {{8}}
🍽️ Food Preference: {{5}}

✅ Amount Paid: {{4}}

Looking forward to an inspiring experience together!

Warm regards,
Team Sneha Saurabha 2025-26 – Rotary District Conference 3181
```

**Parameters** (8 total):
1. {{1}} = Name
2. {{2}} = Registration ID
3. {{3}} = Registration Type
4. {{4}} = Amount
5. {{5}} = Meal Preference
6. {{6}} = Club Name
7. {{7}} = Mobile
8. {{8}} = Email

### 4. Add Environment Variables to Vercel

```bash
WHATSAPP_PROVIDER=gupshup
GUPSHUP_API_KEY=your_api_key_here
GUPSHUP_APP_NAME=your_app_name
GUPSHUP_TEMPLATE_ID=registration_confirmation
```

### 5. Deploy

```bash
vercel --prod
```

## 🎯 Pricing

- **Utility messages**: ₹0.34 per message
- **3000 registrations**: ₹1,020
- **No monthly fees**
- **Pay as you go**

## ⏱️ Timeline

1. **Today**: Sign up, get API key (5 mins)
2. **Day 1**: Submit template for approval
3. **Day 2-3**: Template approved by WhatsApp (2-4 hours typical)
4. **Day 3**: Start sending! 🚀

## 📞 Support

- Gupshup Support: support@gupshup.io
- India Phone: +91-22-33630000
- Help Docs: https://docs.gupshup.io/

## 🔗 Important Links

- Sign Up: https://www.gupshup.io/whatsapp-business-api
- Dashboard: https://www.gupshup.io/developer/home
- API Docs: https://docs.gupshup.io/docs/whatsapp-api-introduction
- Template Guide: https://docs.gupshup.io/docs/whatsapp-templates

---

**✅ Integration Code Ready!**
- API file created: `api/send-whatsapp-gupshup.js`
- Auto-triggered after successful payment
- Just add your credentials and deploy!
