# 🚨 URGENT FIX: Cashfree Payment Failures for ₹75,000 and ₹1,00,000

**Error**: "order amount cannot be greater than the max order amount set with Cashfree"

**Date**: November 14, 2025  
**Issue**: Payments for Patron Sponsor (₹1,00,000) and large amounts failing

---

## 🔍 ROOT CAUSE

Your **Cashfree account** has a **maximum order amount limit** set. This is a merchant account restriction, not a code issue.

**Error from Cashfree API**:
```
{
  "success": false,
  "error": "order amount cannot be greater than the max order amount set with Cashfree"
}
```

---

## ✅ IMMEDIATE SOLUTION

### Step 1: Login to Cashfree Dashboard

**URL**: https://merchant.cashfree.com/merchants/login

### Step 2: Navigate to Settings

**Path**: Dashboard → Settings → Business Settings → Payment Settings

### Step 3: Increase Max Order Amount

Look for one of these settings:
- **"Maximum Transaction Amount"**
- **"Max Order Amount"**
- **"Transaction Limit"**

**Current Limit**: Probably ₹10,000 or ₹50,000  
**Required**: ₹5,00,000 (to support Patron Sponsor)

**Set to**: ₹5,00,000 or higher

### Step 4: Save and Wait

- Click "Save" or "Update"
- Changes may take **5-15 minutes** to propagate
- Cashfree might require **KYC verification** for high limits

---

## 🔄 ALTERNATIVE: Contact Cashfree Support

If you can't find the setting or it's disabled:

**Email**: support@cashfree.com  
**Phone**: +91 80808 46965  
**Subject**: "Increase Maximum Transaction Amount for Merchant ID: [YOUR_MERCHANT_ID]"

**Message Template**:
```
Hi Cashfree Team,

We are running a Rotary District Conference registration system 
(SNEHA-SAURABHA 2025-26) and need to process high-value transactions.

Current Issue: Payments above ₹50,000 are being rejected with error:
"order amount cannot be greater than the max order amount set with Cashfree"

Our Registration Types:
- Patron Sponsor: ₹5,00,000
- Platinum Sponsor: ₹2,00,000
- Gold Sponsor: ₹1,00,000
- Silver Sponsor: ₹25,000

Please increase our maximum transaction amount to ₹5,00,000.

Merchant ID: [YOUR_MERCHANT_ID]
Website: https://sneha2026.in

Thank you!
```

---

## 🎯 REGISTRATION AMOUNTS AFFECTED

| Type | Amount | Status |
|------|--------|--------|
| Patron Sponsor | ₹5,00,000 | ❌ Blocked |
| Platinum Sponsor | ₹2,00,000 | ❌ Blocked |
| Gold Sponsor | ₹1,00,000 | ❌ Blocked |
| Silver Sponsor | ₹25,000 | ⚠️ May be blocked |
| Rotarian with Spouse | ₹14,000 | ✅ Working |
| Rotarian | ₹7,500 | ✅ Working |

---

## 🔧 TEMPORARY WORKAROUND (Not Recommended)

If you need immediate registrations for sponsors:

### Option 1: Split Payment
- Accept ₹50,000 first payment
- Create manual invoice for remaining amount
- Process offline/bank transfer

### Option 2: Use Different Gateway
- Set up Razorpay (if available) for high-value transactions
- Razorpay typically has higher default limits

### Option 3: Manual Registration
- Collect payment via bank transfer
- Manually add registration using admin panel
- Use manual WhatsApp send feature (already created)

---

## 📋 CHECKLIST

Before contacting support, gather this info:

- [ ] Cashfree Merchant ID
- [ ] Current max transaction limit (if visible)
- [ ] Business verification status (KYC complete?)
- [ ] Account type (Test/Sandbox vs Production)
- [ ] Business registration documents (GST, PAN, etc.)

---

## 🚀 AFTER LIMIT IS INCREASED

### Test High-Value Payment

```bash
# Test with Patron Sponsor amount
# Go to: https://sneha2026.in
# Select: Patron Sponsor (₹5,00,000)
# Fill form and click Pay Now
# Should work without errors
```

### Verify in Cashfree Dashboard

1. Check "Transactions" tab
2. Look for order with ₹5,00,000
3. Status should show "Success" or "Pending"
4. No error about max amount

---

## 🎯 WHY THIS HAPPENS

**Common Reasons for Low Limits**:

1. **Sandbox/Test Mode**: Test accounts have low limits (₹10,000-₹50,000)
2. **New Merchant**: New accounts start with conservative limits
3. **Pending KYC**: Incomplete business verification restricts limits
4. **Risk Assessment**: Cashfree sets limits based on business risk profile
5. **Account Type**: Basic plans have lower limits than premium plans

---

## 💡 PREVENTION

After fixing:

1. **Document Your Limit**: Note it in `.env.local` file:
   ```bash
   # Cashfree Account Limits
   # Max Transaction Amount: ₹5,00,000
   # Updated: Nov 14, 2025
   ```

2. **Monitor Transactions**: Set up alerts for failed high-value payments

3. **Add Validation**: Add client-side warning for high amounts:
   ```javascript
   if (amount > 500000) {
     alert('Large amount detected. If payment fails, contact support.');
   }
   ```

---

## 🔍 HOW TO CHECK YOUR CURRENT LIMIT

### Method 1: Cashfree Dashboard
- Login → Settings → Business Settings
- Look for "Transaction Limits" or similar

### Method 2: Make Test Transaction
- Try ₹10,000 → Works ✅
- Try ₹50,000 → Works/Fails?
- Try ₹1,00,000 → Fails ❌
- Your limit is between the working and failing amounts

### Method 3: Check API Documentation
- Cashfree sends limit info in API response headers (sometimes)

---

## 📞 SUPPORT CONTACTS

**Cashfree Support**:
- Email: support@cashfree.com
- Phone: +91 80808 46965
- Dashboard: Chat widget (bottom-right)

**For Urgent Issues**:
- Twitter: @cashfreedev
- LinkedIn: Cashfree Payments

---

## ✅ SUMMARY

**Problem**: Cashfree account has max transaction limit  
**Solution**: Increase limit in Cashfree dashboard or contact support  
**Target**: ₹5,00,000 (to support all sponsor types)  
**Time**: 5-15 minutes (if self-service) or 1-2 hours (if support needed)  
**Cost**: Free (no charges for increasing limit)

---

**Status**: ⏳ Waiting for Cashfree limit increase  
**Blocking**: Patron, Platinum, Gold, Silver sponsor registrations  
**Working**: All other registration types (below ₹15,000)
