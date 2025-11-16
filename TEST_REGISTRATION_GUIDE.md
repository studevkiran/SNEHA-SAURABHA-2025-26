# Test Registration & Cleanup Guide

## Safe Testing Process

### Step 1: Do Test Registration

**Test with Real Payment Flow:**

1. Go to: https://sneha2026.in/index.html

2. Fill registration with **identifiable test data:**
   ```
   Name: TEST DELETE ME
   Mobile: 9999999999
   Email: testdelete@test.com
   Registration Type: Guest (cheapest - ₹5,000)
   Club: Any club
   Meal: Veg
   T-Shirt: Any size
   ```

3. Complete payment through Cashfree (real ₹5,000 payment)

4. Note the **Registration ID** (e.g., 2026RTY0700)

5. Check WhatsApp message arrives

### Step 2: Verify Everything Works

- [ ] Payment successful
- [ ] Registration ID generated
- [ ] WhatsApp message received (no "Read more" button)
- [ ] Entry appears in tally page
- [ ] Entry appears in Excel exports

### Step 3: Delete Test Entry from Database

**Option A: Using Database Client (Recommended)**

1. Connect to your Neon database:
   ```
   Host: ep-proud-tooth-a1kvg1dz-pooler.ap-southeast-1.aws.neon.tech
   Database: neondb
   User: neondb_owner
   Password: npg_NuxOHm60aXTi
   ```

2. Run SQL to delete:
   ```sql
   -- View the test entry first
   SELECT * FROM registrations 
   WHERE mobile = '9999999999' 
   OR email LIKE '%testdelete%'
   OR name LIKE '%TEST DELETE%';
   
   -- Delete the test entry
   DELETE FROM registrations 
   WHERE mobile = '9999999999' 
   OR email LIKE '%testdelete%'
   OR name LIKE '%TEST DELETE%';
   ```

**Option B: Mark as Test (Softer Approach)**

```sql
-- Just mark as test instead of deleting
UPDATE registrations 
SET payment_status = 'test' 
WHERE mobile = '9999999999' 
OR email LIKE '%testdelete%';
```

This way it won't show in Excel exports but remains in database.

---

## Alternative: Use Coupon Codes

If you don't want to pay ₹5,000 for testing:

### Create Test Coupon

1. Login to Neon database

2. Create 100% discount coupon:
   ```sql
   INSERT INTO coupons (code, discount_percentage, max_uses, valid_until, active)
   VALUES ('TEST100', 100, 5, '2025-12-31', true);
   ```

3. Use code `TEST100` during registration - payment will be ₹0

4. Test the flow without actual payment

5. Delete test entries afterward:
   ```sql
   DELETE FROM registrations 
   WHERE coupon_code = 'TEST100';
   ```

---

## Quick Cleanup Script

Save this as `delete-test-entries.sql`:

```sql
-- Delete all test entries (be careful!)
DELETE FROM registrations 
WHERE 
    payment_status = 'test'
    OR mobile IN ('0000000001', '9999999999')
    OR email LIKE '%test@%'
    OR name LIKE '%TEST%'
    OR name LIKE '%test%';

-- Show remaining count
SELECT COUNT(*) as total_registrations FROM registrations 
WHERE payment_status != 'test';
```

---

## Safety Checklist

Before deleting:

- [ ] Confirmed it's a test entry (check registration ID, name, mobile)
- [ ] Noted down registration details (just in case)
- [ ] Backed up database (optional but recommended)
- [ ] Used WHERE clause (never DELETE without WHERE!)

---

## Database Connection Tools

**Option 1: psql (Command Line)**
```bash
psql "postgresql://neondb_owner:npg_NuxOHm60aXTi@ep-proud-tooth-a1kvg1dz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

**Option 2: DBeaver / pgAdmin (GUI)**
- Download DBeaver: https://dbeaver.io/download/
- Add PostgreSQL connection with above credentials

**Option 3: Neon Web Console**
- Login: https://console.neon.tech/
- Go to your project → SQL Editor
- Run queries directly

---

## After Testing Complete

1. Delete/mark all test entries
2. Verify tally page shows correct count
3. Download Excel to confirm test entries removed
4. Ready for production! ✅

---

## Questions?

- Test entry still showing? Check if it matches filter criteria
- Payment refund? Contact Cashfree support with order ID
- Database locked? Check for active connections
- Need more test coupons? Run the INSERT query again with different code

---

**Current Database Password:** `npg_NuxOHm60aXTi`  
**Tally Page:** https://sneha2026.in/admin/tally.html  
**Registration Page:** https://sneha2026.in/index.html
