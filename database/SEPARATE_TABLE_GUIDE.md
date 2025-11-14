# 🎯 SMART APPROACH: Separate Table for 680 Manual Registrations

**Strategy**: Import → Review → Update → Verify → Merge  
**Advantage**: Safe, flexible, no risk to existing data  
**Time**: Import (30 min) + Review/Update (as needed) + Merge (5 min)

---

## 🏗️ ARCHITECTURE

```
┌─────────────────────────────┐
│  manual_registrations       │  ← Import 680 records here
│  (Staging/Temporary Table)  │
│                             │
│  • Quick import             │
│  • No contact info required │
│  • Review at your pace      │
│  • Update when ready        │
│  • Flag as verified         │
└─────────────────────────────┘
              ↓
        ┌─────────┐
        │ Review  │
        │ Update  │
        │ Verify  │
        └─────────┘
              ↓
┌─────────────────────────────┐
│  registrations              │  ← Merge only when ready
│  (Main Production Table)    │
│                             │
│  • Clean verified data      │
│  • Complete contact info    │
│  • Production ready         │
└─────────────────────────────┘
```

---

## 🚀 STEP-BY-STEP PROCESS

### **STEP 1: Create Separate Table** (5 mins)

```bash
# Run the SQL file to create manual_registrations table
psql $POSTGRES_URL -f database/create-manual-registrations-table.sql
```

**What this creates**:
- ✅ `manual_registrations` table (staging area)
- ✅ `manual_regs_need_update` view (shows missing contact info)
- ✅ `manual_regs_summary` view (statistics)
- ✅ Helper functions (update, verify, merge)

---

### **STEP 2: Import 680 Records** (30 mins)

**Option A: Use Node.js Script** (Fastest)
```bash
# Edit import-to-manual-table.js - paste all 680 records in DATA variable
# Then run:
node database/import-to-manual-table.js
```

**Option B: Use CSV Import**
```bash
# Create CSV with columns: registration_id, name, club, club_id, registration_type, 
# registration_amount, registration_date
# Then import:
psql $POSTGRES_URL -c "\COPY manual_registrations (registration_id, name, club, club_id, registration_type, registration_amount, registration_date) FROM 'file.csv' CSV HEADER"
```

**Option C: Direct SQL Insert**
```sql
-- Simple batch insert
INSERT INTO manual_registrations (registration_id, name, club, club_id, registration_type, registration_amount, registration_date) VALUES
('2026RTY0001', 'Rtn. Ramakrishna Kannan', 'Mysore Midtown', 59, 'Rotarian', 7500, '2025-01-24'),
('2026RTY0002', 'Rtn. Satish Bolar', 'Mangalore South', 47, 'Rotarian', 7500, '2025-01-24'),
-- ... all 680 rows
;
```

---

### **STEP 3: Review Imported Data** (10 mins)

```sql
-- Check total count
SELECT COUNT(*) FROM manual_registrations;
-- Expected: 680

-- View summary by type
SELECT * FROM manual_regs_summary;
-- Shows: type, count, revenue, verified status

-- See who needs contact info update
SELECT * FROM manual_regs_need_update LIMIT 20;
-- Shows: VIP sponsors first, then by priority
```

---

### **STEP 4: Update Contact Information** (As Needed)

**Priority Order**:
1. Patron Sponsors (₹5,00,000) - 2 records
2. Platinum Sponsors (₹2,00,000) - 0 records
3. Gold Sponsors (₹1,00,000) - 7 records
4. Silver Sponsors (₹25,000) - 38 records
5. Others - Update as you get info

**Update Methods**:

**Method 1: Using Helper Function**
```sql
-- Update individual registration
SELECT update_manual_contact(
  '2026RTY0006',           -- registration_id
  '9876543210',            -- mobile
  'sponsor@example.com',   -- email
  'Non-Veg',              -- meal_preference (optional)
  'XL'                    -- tshirt_size (optional)
);
```

**Method 2: Direct SQL Update**
```sql
-- Update specific registration
UPDATE manual_registrations
SET 
  mobile = '9876543210',
  email = 'sponsor@example.com',
  meal_preference = 'Non-Veg',
  tshirt_size = 'XL',
  needs_contact_update = FALSE,
  updated_at = CURRENT_TIMESTAMP
WHERE registration_id = '2026RTY0006';
```

**Method 3: Bulk Update from CSV**
```sql
-- Create temp table with contact info
CREATE TEMP TABLE contact_updates (
  registration_id VARCHAR(20),
  mobile VARCHAR(15),
  email VARCHAR(255),
  meal VARCHAR(20),
  tshirt VARCHAR(10)
);

-- Import CSV
\COPY contact_updates FROM 'contacts.csv' CSV HEADER;

-- Bulk update
UPDATE manual_registrations m
SET 
  mobile = c.mobile,
  email = c.email,
  meal_preference = COALESCE(c.meal, m.meal_preference),
  tshirt_size = COALESCE(c.tshirt, m.tshirt_size),
  needs_contact_update = FALSE,
  updated_at = CURRENT_TIMESTAMP
FROM contact_updates c
WHERE m.registration_id = c.registration_id;
```

---

### **STEP 5: Mark as Verified** (As You Go)

**Verify Individual Record**
```sql
-- Mark single registration as verified
SELECT verify_manual_registration('2026RTY0006');
```

**Bulk Verify**
```sql
-- Verify all sponsors (after contact info updated)
UPDATE manual_registrations
SET is_verified = TRUE
WHERE registration_type LIKE '%Sponsor%'
  AND NOT needs_contact_update;

-- Verify all with complete contact info
UPDATE manual_registrations
SET is_verified = TRUE
WHERE mobile IS NOT NULL 
  AND mobile != '' 
  AND mobile != '0000000000'
  AND email IS NOT NULL 
  AND email != '' 
  AND email != 'noreply@sneha2026.in';

-- Verify all (if you're okay with placeholder contacts)
UPDATE manual_registrations
SET is_verified = TRUE
WHERE is_verified = FALSE;
```

---

### **STEP 6: Merge to Main Table** (5 mins)

**When Ready to Merge**:
```sql
-- Merge all verified registrations to main table
SELECT * FROM merge_manual_to_main();

-- Returns:
-- merged_count | failed_count | error_details
-- 680          | 0            | {}
```

**Check Results**:
```sql
-- Verify merge success
SELECT COUNT(*) FROM manual_registrations WHERE is_merged = TRUE;
-- Should match merged_count

-- Check main table
SELECT COUNT(*) FROM registrations WHERE registration_source = 'Manual';
-- Should show merged records
```

---

## 📊 USEFUL QUERIES

### **Dashboard Queries**

```sql
-- Overall summary
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN is_verified THEN 1 END) as verified,
  COUNT(CASE WHEN is_merged THEN 1 END) as merged,
  COUNT(CASE WHEN needs_contact_update THEN 1 END) as needs_update,
  SUM(registration_amount) as total_revenue
FROM manual_registrations;

-- By registration type
SELECT * FROM manual_regs_summary;

-- Priority updates (VIPs first)
SELECT 
  registration_id, name, club, registration_type, registration_amount
FROM manual_registrations
WHERE needs_contact_update = TRUE
ORDER BY registration_amount DESC
LIMIT 50;

-- Already verified and ready to merge
SELECT COUNT(*) FROM manual_registrations 
WHERE is_verified = TRUE AND is_merged = FALSE;
```

### **Export Queries**

```sql
-- Export list for contact collection
\COPY (SELECT registration_id, name, club, registration_type FROM manual_registrations WHERE needs_contact_update ORDER BY registration_amount DESC) TO 'need_contacts.csv' CSV HEADER;

-- Export verified list
\COPY (SELECT * FROM manual_registrations WHERE is_verified = TRUE) TO 'verified_registrations.csv' CSV HEADER;
```

---

## ✅ ADVANTAGES OF THIS APPROACH

### **1. Safety**
- ✅ No risk to existing production data
- ✅ Easy rollback (just drop temp table)
- ✅ Review before committing

### **2. Flexibility**
- ✅ Import quickly without complete data
- ✅ Update contact info at your own pace
- ✅ Verify in batches (sponsors first, others later)
- ✅ Merge when confident

### **3. Tracking**
- ✅ Track verification status
- ✅ Track merge status
- ✅ Flag records needing updates
- ✅ Add notes for special cases

### **4. Workflow**
```
Day 1: Import all 680 → 30 minutes
Day 2-7: Update VIP contacts (47 sponsors) → As you receive info
Day 8-14: Update other contacts → As available
Day 15: Verify all → 10 minutes
Day 15: Merge to main table → 5 minutes
```

---

## 🔄 WORKFLOW EXAMPLE

### **Scenario: Update Sponsors First**

```sql
-- Day 1: Import all 680 records
-- (Run import script - all records in staging)

-- Day 2: Focus on Patron Sponsors (₹5L each)
SELECT registration_id, name, club 
FROM manual_registrations 
WHERE registration_type = 'Patron Sponsor';
-- 2 records - Get their contact info

-- Update Patron Sponsors
UPDATE manual_registrations 
SET 
  mobile = '9876543210',
  email = 'patron@example.com',
  needs_contact_update = FALSE,
  is_verified = TRUE
WHERE registration_id IN ('2026RTY0264', '2026RTY0348');

-- Day 3-5: Gold Sponsors (₹1L each)
-- Get contact info for 7 gold sponsors
-- Update and verify

-- Day 6-10: Silver Sponsors (₹25K each)
-- Get contact info for 38 silver sponsors
-- Update and verify

-- Day 11-14: Rotarians
-- Update as info comes in
-- OR leave with placeholders if acceptable

-- Day 15: Merge verified to production
SELECT * FROM merge_manual_to_main();
-- All verified records now in main table
```

---

## 🎯 RECOMMENDED WORKFLOW

### **Option 1: VIP-First Approach** (Best for sponsors)
1. Import all 680 → 30 min
2. Update Patron (2) + Gold (7) + Silver (38) = 47 sponsors → 1-2 days
3. Verify sponsors → 5 min
4. Merge sponsors first → 5 min
5. Update & merge Rotarians later → As info available

### **Option 2: Quick Import Approach** (Best if time-sensitive)
1. Import all 680 with placeholders → 30 min
2. Verify all (accept placeholders) → 5 min
3. Merge all → 5 min
4. Update contact info in main table later → Ongoing

### **Option 3: Batch Approach** (Best for organized process)
1. Import all 680 → 30 min
2. Week 1: Update & merge sponsors (47 records)
3. Week 2: Update & merge Rotarians batch 1 (200 records)
4. Week 3: Update & merge Rotarians batch 2 (200 records)
5. Week 4: Update & merge remaining (233 records)

---

## 🆘 TROUBLESHOOTING

### **Issue: Import fails with duplicate key**
```sql
-- Check existing record
SELECT * FROM manual_registrations WHERE registration_id = '2026RTY0001';
-- Delete if needed
DELETE FROM manual_registrations WHERE registration_id = '2026RTY0001';
```

### **Issue: Club ID not found**
```sql
-- Find records with missing club_id
SELECT DISTINCT club FROM manual_registrations WHERE club_id IS NULL;
-- Update manually
UPDATE manual_registrations SET club_id = 59 WHERE club = 'Mysore Midtown';
```

### **Issue: Merge fails**
```sql
-- Check error details
SELECT * FROM merge_manual_to_main();
-- Look at error_details array
-- Fix issues and retry
```

---

## 📋 CLEANUP (After Successful Merge)

```sql
-- Verify all merged successfully
SELECT COUNT(*) FROM manual_registrations WHERE is_merged = FALSE;
-- Should be 0

-- Optional: Keep table for reference
-- OR drop if no longer needed
DROP TABLE IF EXISTS manual_registrations CASCADE;
DROP VIEW IF EXISTS manual_regs_need_update;
DROP VIEW IF EXISTS manual_regs_summary;
DROP FUNCTION IF EXISTS update_manual_contact;
DROP FUNCTION IF EXISTS verify_manual_registration;
DROP FUNCTION IF EXISTS merge_manual_to_main;
```

---

## 🎉 SUMMARY

**This approach is PERFECT because**:
- ✅ Import fast (30 min) without worrying about contact details
- ✅ Update VIP info first (sponsors) over a few days
- ✅ Verify and merge in batches or all at once
- ✅ No risk to existing data
- ✅ Full tracking and visibility
- ✅ Can rollback anytime before merge

**Start now**: Run `create-manual-registrations-table.sql` and begin importing!

---

**Files Created**:
- `create-manual-registrations-table.sql` - Creates staging table
- `import-to-manual-table.js` - Import script
- `SEPARATE_TABLE_GUIDE.md` - This guide
