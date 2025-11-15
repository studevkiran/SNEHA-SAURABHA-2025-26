# Complete Database Setup Guide

## Overview
This guide will help you:
1. Clear existing test data
2. Import 680 manual registrations from Guest.xlsx
3. Set up auto-increment to continue from 0690
4. Standardize club names (Midtown variations)
5. Handle cancelled/dummy registrations

## Step 1: Database Connection

Make sure you have your Neon PostgreSQL credentials in `.env.local`:
```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

## Step 2: Clear All Current Data

```sql
-- Delete all test registrations
DELETE FROM registrations;

-- Reset the sequence (optional, but recommended)
-- This ensures clean state
TRUNCATE TABLE registrations RESTART IDENTITY CASCADE;
```

## Step 3: Import Guest.xlsx Data

The file `public/Guest.xlsx` contains 680 manual registrations.

**Format Expected:**
- Registration ID format: `2026RTY0001` to `2026RTY0680`
- Some entries marked as "CANCELLED" (dummy/placeholder entries)
- Gaps in sequence will remain as NULL entries

**Import Script**: Use `database/import-guest-registrations.js`

## Step 4: Registration Number Format

### Current Format
- Manual entries: `2026RTY0001` to `2026RTY0689` (from Excel)
- New registrations: `GST00V0690`, `ROT01V0691`, etc.

### New Format (Standardized)
All registrations will use **last 4 digits** as sequential counter:
- `0001` to `0689` - Manual registrations (with gaps for CANCELLED)
- `0690` onwards - New online registrations

### Registration ID Pattern
```
[TYPE][SEQUENCE][VARIANT][4-DIGIT]
```

Examples:
- Guest: `GST00V0690`
- Rotarian: `ROT01V0691`
- Annet: `ANT02V0692`

## Step 5: Auto-Increment Logic

The system will:
1. Query the database for the highest 4-digit number
2. Add 1 to continue sequence
3. Even if you delete test data, it continues from last used number

**Implementation in `api/registrations/create.js`:**

```javascript
// Get the last registration number from database
const lastReg = await pool.query(`
  SELECT registration_id 
  FROM registrations 
  ORDER BY created_at DESC 
  LIMIT 1
`);

let sequenceNumber = 690; // Start from 690 (after 680 manual + gaps)

if (lastReg.rows.length > 0) {
  // Extract last 4 digits from registration_id
  const lastId = lastReg.rows[0].registration_id;
  const lastDigits = lastId.match(/(\d{4})$/);
  if (lastDigits) {
    sequenceNumber = parseInt(lastDigits[1]) + 1;
  }
}

// Format as 4 digits: 0690, 0691, etc.
const formattedNumber = sequenceNumber.toString().padStart(4, '0');
```

## Step 6: Fix Club Names

### Problem
- "mid-town" (with hyphen)
- "mid town" (with space)
- "Midtown" (correct)

### Solution
Run this SQL update:

```sql
-- Standardize all Midtown variations
UPDATE registrations 
SET club_name = 'Midtown'
WHERE LOWER(club_name) IN ('mid-town', 'mid town', 'midtown');

-- Also update in clubs JSON if needed
```

## Step 7: Handle CANCELLED Registrations

For dummy/placeholder entries in tally:

```sql
-- Mark cancelled entries
UPDATE registrations 
SET 
  full_name = 'CANCELLED',
  mobile = NULL,
  email = 'cancelled@placeholder.com',
  payment_status = 'CANCELLED'
WHERE full_name IS NULL OR full_name = '';
```

In `admin/tally.html`, display logic:
```javascript
// Show CANCELLED for empty entries
const displayName = reg.full_name || 'CANCELLED';
const displayMobile = reg.mobile || '---';
const displayEmail = reg.email || '---';
```

## Complete SQL Script

```sql
-- 1. Clear all existing data
TRUNCATE TABLE registrations RESTART IDENTITY CASCADE;

-- 2. Your manual import will happen via Node.js script
-- (See import-guest-registrations.js)

-- 3. Fix club names
UPDATE registrations 
SET club_name = 'Midtown'
WHERE LOWER(club_name) IN ('mid-town', 'mid town', 'midtown');

-- 4. Mark cancelled entries
UPDATE registrations 
SET 
  full_name = 'CANCELLED',
  payment_status = 'CANCELLED'
WHERE full_name IS NULL OR full_name = '' OR LOWER(full_name) = 'cancelled';

-- 5. Verify
SELECT 
  registration_id,
  full_name,
  club_name,
  payment_status,
  created_at
FROM registrations
ORDER BY registration_id;
```

## Usage

1. Run the import script:
```bash
node database/import-guest-registrations.js
```

2. Verify in tally:
```
https://www.sneha2026.in/admin/tally.html
```

3. Test new registration:
- Go to website
- Complete registration
- Should get `GST00V0690` or `ROT01V0690`

## Verification Checklist

- [ ] All 680 manual entries imported
- [ ] CANCELLED entries show as "CANCELLED"
- [ ] Club names standardized (Midtown)
- [ ] New registrations start from 0690
- [ ] Sequence continues even after deletion
- [ ] Tally page shows all data correctly
- [ ] Excel export works with CANCELLED entries

## Notes

- **Do NOT delete manual entries** (0001-0689)
- **Test registrations** can be deleted (0690+)
- **Sequence continues** from highest number in database
- **4-digit format** makes accounting easier
- **CANCELLED placeholders** maintain sequence integrity
