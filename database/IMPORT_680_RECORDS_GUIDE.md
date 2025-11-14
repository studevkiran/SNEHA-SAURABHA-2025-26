# Guide: Import 680 Manual Registration Records

## Overview
This guide helps you import all 680 manually-added registration records from the provided tally into the database.

## Data Summary
- **Total Registrations**: 680 (confirmed: 679, pending: 1)
- **Registration Types**:
  - Rotarian: 550
  - Rotarian with Spouse: 79
  - Silver Sponsor: 38
  - Gold Sponsor: 7
  - Platinum Sponsor: 0
  - Patron Sponsor: 2
  - Ann: 0
  - Silver Donor: 2 (interpreted as Silver Sponsor)

## Steps to Import

### Option 1: Direct SQL Import (Recommended)
1. Create CSV file from the provided data
2. Use PostgreSQL COPY command or pgAdmin import
3. Fastest and most reliable method

### Option 2: Node.js Script Import
1. Run the provided script
2. Handles errors and validation
3. Provides detailed progress

### Option 3: Manual Entry via Admin Dashboard
1. Use the admin panel's manual registration feature
2. Time-consuming but most controlled

## Important Notes

### Registration ID Format
- Format: `2026RTY0001` to `2026RTY0687`
- Note: Some numbers are skipped (0022, 0091, 0092, 0099, 0101, 0118, 0152, 0655)

### Missing Information
Since the tally doesn't include:
- Mobile numbers → Use placeholder "N/A" or "0000000000"
- Email addresses → Use placeholder "N/A" or generate from name
- Meal preferences → Default to "Veg"
- T-shirt sizes → Leave blank or set to "M"

### Club Name Mapping Issues
Some club names in the tally might not match exactly with `clubs.json`:
- "Kollegala" vs "Kollegal"
- "Mysore Jayaprakash Nagar" vs standard name
- Verify all club names before import

### Payment Information
- All records are SUCCESS (already paid/confirmed)
- Payment method: "Manual"
- Transaction ID: Use registration number
- Payment date: Use registration date from tally

### Registration Types to Amount Mapping
```javascript
'Rotarian': 7500
'Rotarian with Spouse': 14000
'Ann': 7500
'Silver Sponsor': 25000
'Gold Sponsor': 100000
'Platinum Sponsor': 200000
'Patron Sponsor': 500000
'Silver Donor': 25000 (treat as Silver Sponsor)
```

## Database Schema
```sql
INSERT INTO registrations (
    registration_id,      -- 2026RTY0001
    order_id,             -- MANUAL_REG_XXXXXX
    name,                 -- Rtn. Full Name
    mobile,               -- N/A or placeholder
    email,                -- N/A or placeholder
    club,                 -- Club Name
    club_id,              -- Club ID from mapping
    registration_type,    -- Rotarian, Ann, etc.
    registration_amount,  -- Based on type
    meal_preference,      -- Default: Veg
    payment_status,       -- SUCCESS
    payment_method,       -- Manual
    transaction_id,       -- Registration ID
    payment_date,         -- From tally date
    registration_source,  -- Manual
    added_by,             -- Admin Import
    created_at,           -- Registration date
    updated_at            -- Registration date
)
```

## Verification Steps

After import, verify:

1. **Total Count**:
   ```sql
   SELECT COUNT(*) FROM registrations WHERE registration_source = 'Manual';
   -- Should be 680
   ```

2. **By Registration Type**:
   ```sql
   SELECT registration_type, COUNT(*) 
   FROM registrations 
   WHERE registration_source = 'Manual'
   GROUP BY registration_type;
   ```

3. **Revenue Total**:
   ```sql
   SELECT SUM(registration_amount) 
   FROM registrations 
   WHERE registration_source = 'Manual';
   ```

4. **Check for Duplicates**:
   ```sql
   SELECT registration_id, COUNT(*) 
   FROM registrations 
   GROUP BY registration_id 
   HAVING COUNT(*) > 1;
   -- Should return 0 rows
   ```

5. **Missing Registration Numbers**:
   - Verify: 0022, 0091, 0092, 0099, 0101, 0118, 0152, 0655 are intentionally skipped

## Next Steps

After successful import:
1. ✅ Verify all 680 records imported
2. ✅ Check revenue totals match expectations
3. ✅ Test admin dashboard displays correctly
4. ✅ Update mobile/email for key registrants if needed
5. ✅ Set meal preferences based on actual data if available
6. ✅ Assign T-shirt sizes if data available

## Contact Information Update

For VIP registrations (Sponsors, DG, etc.), update:
- Mobile numbers
- Email addresses
- Meal preferences
- T-shirt sizes

This ensures proper communication and logistics.

## Backup Before Import

```bash
# Create backup before import
pg_dump database_url > backup_before_680_import.sql
```

## Rollback If Needed

```sql
-- If import fails, rollback
DELETE FROM registrations WHERE registration_source = 'Manual' AND added_by = 'Admin Import';
```

---

**Status**: Ready for import
**Date Created**: 14 November 2025
**Records**: 680 manual registrations
