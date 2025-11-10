# Cashfree Payment Gateway Setup

## Current Issue
Authentication error: `"authentication Failed"` means the Cashfree API keys in Vercel are either:
- Not set
- Using test/sandbox credentials instead of production credentials
- Expired or invalid

## How to Fix

### Step 1: Get Your Cashfree Production Credentials

1. Login to [Cashfree Dashboard](https://merchant.cashfree.com/)
2. Go to **Developers** → **API Keys**
3. Copy your **PRODUCTION** credentials:
   - App ID
   - Secret Key

⚠️ **Important:** Make sure you're copying PRODUCTION keys, not test/sandbox keys!

### Step 2: Update Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: **SNEHA-SAURABHA-2025-26**
3. Go to **Settings** → **Environment Variables**
4. Add or update these variables:

```
CASHFREE_APP_ID=<your_production_app_id>
CASHFREE_SECRET_KEY=<your_production_secret_key>
```

5. Select environment: **Production, Preview, Development** (check all)
6. Click **Save**

### Step 3: Redeploy

After updating environment variables, Vercel will automatically redeploy. Or you can manually trigger:

```bash
vercel --prod
```

### Step 4: Test Payment

1. Go to your live site
2. Select "Tester (₹1 Only)" registration
3. Fill details and proceed to payment
4. Complete the ₹1 payment to verify everything works

## Verification

If setup is correct, you should see:
- ✅ Payment gateway opens (Cashfree checkout page)
- ✅ You can select payment method (UPI, Card, etc.)
- ✅ Payment processes successfully
- ✅ Redirects back to success page

If you still see authentication error:
- Double-check the API keys are correct (no extra spaces)
- Verify you're using PRODUCTION keys, not test keys
- Check if your Cashfree account is activated for production

## Current Configuration

The code is already set to:
- SDK Mode: `production` ✅
- Payment flow: Cashfree checkout integration ✅
- Backend API: `/api/cashfree/initiate` ✅

Only the API keys need to be updated in Vercel environment variables.

---

**Need Help?**
- Cashfree Support: support@cashfree.com
- Cashfree Docs: https://docs.cashfree.com/
