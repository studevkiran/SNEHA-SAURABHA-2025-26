# 🚀 Quick Deployment Guide

## Step 1: Push to GitHub

```bash
git add .
git commit -m "Production ready: Cashfree integration complete"
git push origin main
```

## Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Import GitHub repo: `studevkiran/SNEHA-SAURABHA-2025-26`
3. Add environment variables (see below)
4. Deploy!

## Environment Variables for Vercel

```bash
# Cashfree (TEST MODE - Start with this!)
# Get credentials from Cashfree Dashboard
CASHFREE_APP_ID=YOUR_TEST_APP_ID
CASHFREE_SECRET_KEY=YOUR_TEST_SECRET_KEY
CASHFREE_API_URL=https://sandbox.cashfree.com/pg

# URLs (Replace YOUR-APP with your Vercel domain)
CASHFREE_RETURN_URL=https://YOUR-APP.vercel.app/payment-callback.html
CASHFREE_NOTIFY_URL=https://YOUR-APP.vercel.app/api/cashfree/webhook

# Admin (⚠️ CHANGE PASSWORD!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeThisSecurePassword123!
```

## Step 3: Configure Cashfree Webhook

1. Login to Cashfree Dashboard
2. Go to Developers → Webhooks
3. Add: `https://your-app.vercel.app/api/cashfree/webhook`
4. Enable: `PAYMENT_SUCCESS`, `PAYMENT_FAILED`

## Step 4: Test

1. Visit your Vercel URL
2. Complete a test registration
3. Use Cashfree test payment
4. Verify success page appears

## 🔄 Switch to Production

When ready for real payments:

```bash
# Get PRODUCTION credentials from Cashfree Dashboard
CASHFREE_APP_ID=YOUR_PRODUCTION_APP_ID
CASHFREE_SECRET_KEY=YOUR_PRODUCTION_SECRET_KEY
CASHFREE_API_URL=https://api.cashfree.com/pg
```

## ✅ Done!

Your registration site is live! 🎉
