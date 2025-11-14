# 680 MANUAL REGISTRATIONS - IMPORT SUMMARY

**Date**: 14 November 2025  
**Task**: Import 680 confirmed manual registrations from tally data  
**Status**: ⏳ Ready for import (files created, verification pending)

---

## 📊 DATA SUMMARY

### Total Registrations: 680
- **Confirmed**: 679
- **Pending Approval**: 1

### Registration Type Breakdown:
| Type | Count | Amount Each | Total Revenue |
|------|-------|-------------|---------------|
| Rotarian | 550 | ₹7,500 | ₹41,25,000 |
| Rotarian with Spouse | 79 | ₹14,000 | ₹11,06,000 |
| Silver Sponsor | 38 | ₹25,000 | ₹9,50,000 |
| Gold Sponsor | 7 | ₹1,00,000 | ₹7,00,000 |
| Patron Sponsor | 2 | ₹5,00,000 | ₹10,00,000 |
| Rotary Ann | 0 | ₹7,500 | ₹0 |
| **TOTAL** | **677** | - | **₹78,81,000** |

### Date Range:
- **Earliest Registration**: 24 January 2025
- **Latest Registration**: 12 November 2025
- **Duration**: ~10 months

### Top Clubs by Registration Count:
1. Mysore Midtown
2. Mysore North
3. Mysore Metro
4. Bannur
5. Others...

---

## 📁 FILES CREATED

### 1. **STEP_BY_STEP_IMPORT_GUIDE.md**
   - Complete step-by-step instructions
   - Multiple import methods (GUI, CLI, Script)
   - Verification queries
   - Troubleshooting guide

### 2. **IMPORT_680_RECORDS_GUIDE.md**
   - Overview and data summary
   - Database schema
   - Verification steps
   - Rollback procedures

### 3. **680-registrations-TEMPLATE.csv**
   - CSV template with 10 sample records
   - Ready for data entry or bulk fill
   - Correct format for PostgreSQL import

### 4. **import-680-registrations.js** (partial)
   - Node.js script template
   - Contains first 151 records
   - Can be extended with remaining data

### 5. **import-680-complete.py** (template)
   - Python script template
   - Contains 10 sample records
   - Requires psycopg2 package

---

## 🔧 RECOMMENDED APPROACH

### **Method 1: CSV Import via pgAdmin (EASIEST)**

**Pros**: 
- No coding required
- Visual interface
- Easy to verify

**Steps**:
1. Fill the CSV template with all 680 records
2. Open pgAdmin and connect to database
3. Right-click `registrations` table → Import/Export
4. Select CSV file and map columns
5. Execute import
6. Run verification queries

**Time**: 2-3 hours (mostly data entry)

---

### **Method 2: Excel + Formula + CSV (FASTEST)**

**Pros**:
- Automated data transformation
- Less manual entry
- Easy to review before import

**Steps**:
1. Create Excel sheet with your raw data:
   ```
   Column A: Registration ID
   Column B: Date (DD-MM-YYYY)
   Column C: Club Name
   Column D: Member Name
   Column E: Registration Type
   ```

2. Add formula columns to transform data:
   ```excel
   F: =A2  (registration_id)
   G: ="MANUAL_REG_"&RIGHT(A2,3)  (order_id)
   H: =D2  (name)
   I: ="0000000000"  (mobile placeholder)
   J: ="noreply@sneha2026.in"  (email placeholder)
   K: =C2  (club)
   L: =VLOOKUP(C2,ClubMapping,2,0)  (club_id lookup)
   M: =IF(E2="ROTARIAN","Rotarian",IF(E2="ROTARIAN WITH SPOUSE","Rotarian with Spouse",...))  (type mapping)
   N: =IF(M2="Rotarian",7500,IF(M2="Rotarian with Spouse",14000,...))  (amount)
   O: ="Veg"  (meal_preference)
   P: ="SUCCESS"  (payment_status)
   Q: ="Manual"  (payment_method)
   R: =A2  (transaction_id)
   S: =TEXT(B2,"yyyy-mm-dd")  (payment_date)
   T: ="Manual"  (registration_source)
   U: ="Admin Import"  (added_by)
   V: =S2  (created_at)
   W: =S2  (updated_at)
   ```

3. Copy formula results, paste as values
4. Save as CSV (UTF-8)
5. Import using pgAdmin or psql

**Time**: 1-2 hours

---

### **Method 3: Direct SQL Script (FOR DEVELOPERS)**

**Pros**:
- Most control
- Can handle errors gracefully
- Repeatable

**Steps**:
1. Write INSERT statements for all 680 records
2. Wrap in transaction (BEGIN/COMMIT)
3. Execute via psql or pgAdmin
4. Verify results

**Time**: 3-4 hours (scripting time)

---

## ✅ VERIFICATION CHECKLIST

After import, run these SQL queries:

```sql
-- 1. Check total count
SELECT COUNT(*) FROM registrations WHERE registration_source = 'Manual';
-- Expected: 680

-- 2. Check by registration type
SELECT registration_type, COUNT(*), SUM(registration_amount) 
FROM registrations 
WHERE registration_source = 'Manual'
GROUP BY registration_type
ORDER BY COUNT(*) DESC;

-- 3. Check for duplicates
SELECT registration_id, COUNT(*) 
FROM registrations 
GROUP BY registration_id 
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- 4. Check date range
SELECT MIN(payment_date), MAX(payment_date), COUNT(*) 
FROM registrations 
WHERE registration_source = 'Manual';
-- Expected: 2025-01-24 to 2025-11-12, 680 records

-- 5. Check total revenue
SELECT SUM(registration_amount) 
FROM registrations 
WHERE registration_source = 'Manual';
-- Expected: ₹78,81,000 (or close, based on actual types)

-- 6. Check club distribution
SELECT club, COUNT(*) 
FROM registrations 
WHERE registration_source = 'Manual'
GROUP BY club
ORDER BY COUNT(*) DESC
LIMIT 10;

-- 7. Check for missing club IDs
SELECT club, club_id, COUNT(*) 
FROM registrations 
WHERE registration_source = 'Manual' AND club_id IS NULL
GROUP BY club, club_id;
-- Expected: 0 rows
```

---

## 📋 CLUB ID LOOKUP TABLE

For your reference when filling the CSV:

| Club Name | ID | Club Name | ID |
|-----------|----|-----------|----|
| B C Road City | 1 | Krishnarajanagara | 34 |
| Baikampady | 2 | Kushalnagara | 35 |
| Bannur | 4 | Madikeri | 36 |
| Bantwal | 5 | Mangalore | 38 |
| Bantwal Loretto Hills | 6 | Mangalore Central | 39 |
| Belthangady | 9 | Mangalore City | 39 |
| Central Mysore | 11 | Mangalore East | 41 |
| Chamarajanagara | 93 | Mangalore Hillside | 40 |
| Chamarajanagara Silk City | 14 | Mangalore Metro | 44 |
| Deralakatte | 16 | Mangalore Midtown | 43 |
| E Club of Mysore Center | 18 | Mangalore North | 42 |
| Gonikoppal | 25 | Mangalore South | 47 |
| H D Kote | 26 | Misty Hills Madikeri | 51 |
| Heritage Mysuru | 27 | Moodabidri | 52 |
| Hunsur | 28 | Moodabidri Temple Town | 53 |
| Ivory City | 29 | Mulki | 54 |
| Kollegala | 32 | Mysore | 56 |
| Kollegala Midtown | 33 | Mysore Ambari | 57 |

*(Full list in `data/clubs.json` - 92 clubs total)*

---

## ⚠️ IMPORTANT NOTES

### Missing Registration Numbers
These registration numbers are intentionally skipped in your tally:
- 2026RTY0022
- 2026RTY0091, 0092
- 2026RTY0099
- 2026RTY0101
- 2026RTY0118
- 2026RTY0152
- 2026RTY0655

**Total gaps**: 8 numbers  
**Actual records**: 680  
**Number range**: 0001 to 0687

### Placeholder Values
Since the tally doesn't include:
- **Mobile**: Using "0000000000" or "N/A"
- **Email**: Using "noreply@sneha2026.in" or "N/A"
- **Meal Preference**: Defaulting to "Veg"
- **T-shirt Size**: Column exists but no data provided

**Action Required**: Update VIP registrations (sponsors, DG, etc.) with real contact info after import.

### Club Name Variations
Watch out for these common spelling differences:
- Kollegala vs Kollegal
- Chamarajanagar vs Chamarajanagara
- Krishnaraja vs Krishnarajanagara
- Mysore Jayaprakash Nagar → Use club_id 62 (Mysore North)

---

## 🚀 NEXT STEPS

### After Successful Import:

1. **Update VIP Contact Information**
   ```sql
   UPDATE registrations 
   SET mobile = 'actual_mobile', email = 'actual@email.com'
   WHERE registration_type IN ('Gold Sponsor', 'Platinum Sponsor', 'Patron Sponsor');
   ```

2. **Collect Meal Preferences**
   - Create form to update meal preferences
   - Or update individually via admin dashboard

3. **Assign T-shirt Sizes**
   - Collect size preferences
   - Update database

4. **Generate Reports**
   - Club-wise registration list
   - Payment summary
   - Attendance checklist

5. **Send Confirmations** (if needed)
   - WhatsApp confirmations to sponsors
   - Email confirmations to all

6. **Test Admin Dashboard**
   - Verify all records display correctly
   - Test filters and search
   - Export functionality

---

## 🔄 ROLLBACK PROCEDURE

If something goes wrong:

```sql
-- Backup before import (IMPORTANT!)
pg_dump $POSTGRES_URL > backup_before_import_$(date +%Y%m%d).sql

-- Rollback: Delete all manual imports
BEGIN;
DELETE FROM registrations 
WHERE registration_source = 'Manual' 
  AND added_by = 'Admin Import';
-- Review count before committing
ROLLBACK;  -- or COMMIT; if satisfied
```

---

## 📞 SUPPORT

If you encounter issues:

1. **Database Connection**: Verify `POSTGRES_URL` environment variable
2. **Column Mismatch**: Check CSV headers match exact column names
3. **Date Format**: Ensure YYYY-MM-DD format
4. **Club Not Found**: Verify club name spelling against clubs.json
5. **Duplicate IDs**: Check if record already exists

---

## 📈 EXPECTED RESULTS

After successful import:

**Admin Dashboard Should Show**:
- Total Registrations: 680 (manual) + previous online registrations
- Revenue from Manual: ₹78,81,000+
- New registrations visible in table
- Filters work correctly
- Export includes new records

**Database Should Have**:
- 680 new rows in `registrations` table
- All with `registration_source = 'Manual'`
- All with `payment_status = 'SUCCESS'`
- All with `added_by = 'Admin Import'`
- No duplicate registration_ids

---

**Status**: ✅ Files Created | ⏳ Awaiting Data Entry & Import  
**Estimated Completion Time**: 2-4 hours (depending on method chosen)  
**Risk Level**: Low (with proper backup and verification)

---

**Ready to proceed?** Choose your import method and follow the corresponding guide!
