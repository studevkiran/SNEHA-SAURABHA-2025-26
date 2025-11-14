/**
 * STEP-BY-STEP IMPORT GUIDE FOR 680 REGISTRATIONS
 * Date: 14 November 2025
 */

# RECOMMENDED APPROACH: Use Excel/Google Sheets + CSV Import

## Step 1: Prepare the Data

Create a spreadsheet with these columns:
- registration_id (e.g., 2026RTY0001)
- order_id (e.g., MANUAL_REG_2026RTY0001)
- name (e.g., Rtn. Ramakrishna Kannan)
- mobile (use 0000000000 as placeholder)
- email (use noreply@sneha2026.in as placeholder)
- club (e.g., Mysore Midtown)
- club_id (lookup from clubs.json)
- registration_type (Rotarian, Rotarian with Spouse, Silver Sponsor, etc.)
- registration_amount (7500, 14000, 25000, etc.)
- meal_preference (Veg)
- payment_status (SUCCESS)
- payment_method (Manual)
- transaction_id (same as registration_id)
- payment_date (YYYY-MM-DD format)
- registration_source (Manual)
- added_by (Admin Import)
- created_at (YYYY-MM-DD format)
- updated_at (YYYY-MM-DD format)

## Step 2: Convert Registration Data

From your tally format:
```
2026RTY0001|24-01-2025|Mysore Midtown|Rtn. Ramakrishna Kannan|ROTARIAN
```

To spreadsheet row:
```
2026RTY0001, MANUAL_REG_2026RTY0001, Rtn. Ramakrishna Kannan, 0000000000, noreply@sneha2026.in, Mysore Midtown, 59, Rotarian, 7500, Veg, SUCCESS, Manual, 2026RTY0001, 2025-01-24, Manual, Admin Import, 2025-01-24, 2025-01-24
```

## Step 3: Export as CSV

Save the spreadsheet as CSV with these settings:
- Encoding: UTF-8
- Delimiter: comma (,)
- Quote character: double quote (")
- Headers: included

## Step 4: Import via PostgreSQL

### Option A: Using pgAdmin (GUI)
1. Open pgAdmin and connect to your database
2. Right-click on `registrations` table → Import/Export
3. Select "Import"
4. Choose your CSV file
5. Map columns correctly
6. Click OK to import

### Option B: Using psql Command Line
```bash
psql $POSTGRES_URL -c "\COPY registrations (registration_id, order_id, name, mobile, email, club, club_id, registration_type, registration_amount, meal_preference, payment_status, payment_method, transaction_id, payment_date, registration_source, added_by, created_at, updated_at) FROM '/path/to/680-registrations.csv' WITH (FORMAT csv, HEADER true)"
```

### Option C: Using Node.js Script
```bash
# Set environment variable first
export POSTGRES_URL="your_database_url_here"

# Run import script
node database/import-680-registrations.js
```

## Step 5: Verify Import

```sql
-- Check total count
SELECT COUNT(*) FROM registrations WHERE registration_source = 'Manual';
-- Expected: 680

-- Check by type
SELECT registration_type, COUNT(*) 
FROM registrations 
WHERE registration_source = 'Manual'
GROUP BY registration_type
ORDER BY COUNT(*) DESC;

-- Expected results:
-- Rotarian: 550
-- Rotarian with Spouse: 79
-- Silver Sponsor: 38
-- Gold Sponsor: 7
-- Patron Sponsor: 2
-- Others...

-- Check total revenue
SELECT SUM(registration_amount) 
FROM registrations 
WHERE registration_source = 'Manual';
-- Calculate expected based on counts

-- Check for duplicates
SELECT registration_id, COUNT(*) 
FROM registrations 
GROUP BY registration_id 
HAVING COUNT(*) > 1;
-- Should return 0 rows

-- Check date range
SELECT 
  MIN(payment_date) as earliest,
  MAX(payment_date) as latest,
  COUNT(*) as total
FROM registrations 
WHERE registration_source = 'Manual';
-- Expected: 24-01-2025 to 12-11-2025, total 680
```

## Step 6: Update Contact Information

After import, update key registrations with real contact info:

```sql
-- Update mobile and email for specific registrations
UPDATE registrations 
SET 
  mobile = 'actual_mobile_number',
  email = 'actual_email@example.com'
WHERE registration_id = '2026RTY0001';

-- Bulk update meal preferences if data available
UPDATE registrations 
SET meal_preference = 'Non-Veg'
WHERE registration_id IN ('2026RTY0001', '2026RTY0002', ...);
```

## CLUB ID REFERENCE

Quick lookup for club IDs:

| Club Name | ID |
|-----------|----| 
| Mysore Midtown | 59 |
| Mysore North | 62 |
| Mangalore South | 47 |
| Mysore East | 60 |
| Bannur | 4 |
| Bantwal | 5 |
| Chamarajanagara | 93 |
| Kollegala | 32 |
| Sullia | 80 |
| Puttur East | 76 |

(See data/clubs.json for complete list of 92 clubs)

## REGISTRATION TYPE TO AMOUNT

| Type | Amount (₹) |
|------|-----------|
| Rotarian | 7,500 |
| Rotarian with Spouse | 14,000 |
| Ann | 7,500 |
| Guest | 5,000 |
| Silver Sponsor | 25,000 |
| Gold Sponsor | 1,00,000 |
| Platinum Sponsor | 2,00,000 |
| Patron Sponsor | 5,00,000 |

## TROUBLESHOOTING

### Issue: Club Name Not Found
- Check exact spelling in clubs.json
- Common mismatches:
  - "Kollegal" vs "Kollegala"
  - "Chamarajanagar" vs "Chamarajanagara"
  - "Krishnaraja" vs "Krishnarajanagara"

### Issue: Duplicate Registration ID
- Check if record already exists
- Use UPDATE instead of INSERT if updating

### Issue: Date Format Error
- Ensure dates are in YYYY-MM-DD format
- Convert DD-MM-YYYY to YYYY-MM-DD

### Issue: Invalid Club ID
- Verify club_id exists in clubs.json
- Use default ID 56 (Mysore) if unknown

## BACKUP BEFORE IMPORT

```bash
# Create backup
pg_dump $POSTGRES_URL > backup_before_680_import_$(date +%Y%m%d).sql

# Restore if needed
psql $POSTGRES_URL < backup_before_680_import_20251114.sql
```

## ROLLBACK IF NEEDED

```sql
-- Delete all manual imports
DELETE FROM registrations 
WHERE registration_source = 'Manual' 
  AND added_by = 'Admin Import';

-- Or delete specific date range
DELETE FROM registrations 
WHERE registration_source = 'Manual' 
  AND created_at >= '2025-01-24'
  AND created_at <= '2025-11-12';
```

## NEXT STEPS AFTER IMPORT

1. ✅ Verify count (680 total)
2. ✅ Verify revenue totals
3. ✅ Update VIP contact information
4. ✅ Set meal preferences (if data available)
5. ✅ Assign T-shirt sizes
6. ✅ Test admin dashboard display
7. ✅ Generate reports
8. ✅ Send confirmation messages (if needed)

## NEED HELP?

If you encounter issues:
1. Check error messages carefully
2. Verify database connection string
3. Ensure all required columns have values
4. Check data types match schema
5. Look for special characters in names

---

**Ready to Import**: Follow steps above
**Estimated Time**: 15-30 minutes (depending on method)
**Risk Level**: Low (with backup)
