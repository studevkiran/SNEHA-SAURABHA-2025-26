# 🔧 Payment Recovery Guide

## Problem Description

**Customer:** Eulalia D'souza  
**Order ID:** ORDER_1763458065882_121  
**Transaction ID:** 4593282646  
**Amount:** ₹8,000  
**Status:** Paid Successfully on 18 Nov 2025  
**Issue:** Payment successful but NO registration in database, NO WhatsApp, NO receipt

---

## Root Cause Analysis

This happens when:
1. ✅ Customer completes payment successfully on Cashfree
2. ✅ Payment attempt is stored in `payment_attempts` table
3. ❌ Cashfree webhook is not received/processed
4. ❌ Registration is not created in `registrations` table
5. ❌ WhatsApp confirmation is not sent
6. ❌ Receipt is not generated

**Common Reasons:**
- Network timeout during webhook callback
- Database connection failure
- Webhook signature verification failure
- Server restart during processing
- Vercel function timeout

---

## Immediate Solution

### **Option 1: Use Recovery Tool (Recommended)**

1. Go to: **https://sneha2026.in/admin/recover-payment.html**

2. Enter the details:
   - **Order ID:** `ORDER_1763458065882_121`
   - **Transaction ID:** `4593282646` (optional)

3. Click **"Check & Recover Registration"**

4. The tool will:
   - ✅ Verify payment attempt exists
   - ✅ Verify payment status with Cashfree
   - ✅ Generate registration ID
   - ✅ Create registration in database
   - ✅ Send WhatsApp confirmation
   - ✅ Generate receipt

### **Option 2: Manual Database Recovery**

If the tool doesn't work, manually execute:

```sql
-- 1. Check payment attempt
SELECT * FROM payment_attempts WHERE order_id = 'ORDER_1763458065882_121';

-- 2. If payment attempt exists, create registration
INSERT INTO registrations (
  registration_id, name, mobile, email, club, zone, 
  registration_type, meal_preference, tshirt_size,
  order_id, amount, payment_status, transaction_id, created_at
)
SELECT 
  'SSDC' || EXTRACT(EPOCH FROM NOW())::bigint || FLOOR(RANDOM() * 1000)::int,
  name, mobile, email, club, zone,
  registration_type, meal_preference, tshirt_size,
  order_id, amount, 'SUCCESS', '4593282646', NOW()
FROM payment_attempts
WHERE order_id = 'ORDER_1763458065882_121';

-- 3. Update payment attempt
UPDATE payment_attempts 
SET payment_status = 'SUCCESS', 
    registration_id = (SELECT registration_id FROM registrations WHERE order_id = 'ORDER_1763458065882_121')
WHERE order_id = 'ORDER_1763458065882_121';
```

---

## Prevention for Future

### 1. **Enable Webhook Logging**
Add to `api/cashfree/webhook.js`:
```javascript
console.log('📥 Webhook received:', JSON.stringify(payload, null, 2));
```

### 2. **Add Retry Mechanism**
Implement automatic retry for failed webhook processing

### 3. **Payment Status Checker**
Add a cron job to check for successful payments without registrations:
```javascript
SELECT pa.* 
FROM payment_attempts pa
LEFT JOIN registrations r ON pa.order_id = r.order_id
WHERE pa.payment_status = 'PENDING' 
  AND pa.created_at > NOW() - INTERVAL '24 hours'
  AND r.order_id IS NULL;
```

### 4. **Alert System**
Send admin alert when payment succeeds but registration fails

---

## For This Specific Case

**IMMEDIATE ACTION REQUIRED:**

1. **Go to Recovery Tool:** https://sneha2026.in/admin/recover-payment.html

2. **Enter:**
   - Order ID: `ORDER_1763458065882_121`
   - Transaction ID: `4593282646`

3. **Click Recover**

4. **Expected Result:**
   - Registration ID will be generated (e.g., `SSDC1763458XXXX`)
   - Customer will receive WhatsApp confirmation
   - Receipt will be available at: https://sneha2026.in/receipt.html?id=REGISTRATION_ID

5. **Verify:**
   - Check admin dashboard: https://sneha2026.in/admin/
   - Search for "Eulalia" or mobile "9845253293"
   - Confirm registration appears

6. **Manual WhatsApp (if needed):**
   - Go to: https://sneha2026.in/admin/send-whatsapp.html
   - Enter registration ID
   - Send confirmation

---

## Contact Information

**Customer Details:**
- Name: Eulalia D'souza
- Mobile: +91 9845253293
- Email: eula.dsouza@liatravels.com
- Amount Paid: ₹8,000

**Next Steps:**
1. Run recovery tool immediately
2. Verify registration created
3. Confirm customer received WhatsApp
4. Follow up if any issues

---

## Tool Locations

- **Recovery Tool:** https://sneha2026.in/admin/recover-payment.html
- **Admin Dashboard:** https://sneha2026.in/admin/
- **Tally Page:** https://sneha2026.in/admin/tally.html
- **WhatsApp Sender:** https://sneha2026.in/admin/send-whatsapp.html
- **Receipt Generator:** https://sneha2026.in/receipt.html?id=REGISTRATION_ID

---

**Created:** 18 November 2025  
**Status:** ✅ Recovery tool deployed and ready to use
