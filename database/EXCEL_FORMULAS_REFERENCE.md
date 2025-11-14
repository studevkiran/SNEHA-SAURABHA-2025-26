# EXCEL FORMULA REFERENCE FOR 680 REGISTRATIONS IMPORT

## Quick Setup Guide

### Step 1: Create Raw Data Sheet

Create a sheet named "RawData" with these columns:

| A | B | C | D | E |
|---|---|---|---|---|
| RegNo | Date | Club | Name | Type |
| 2026RTY0001 | 24-01-2025 | Mysore Midtown | Rtn. Ramakrishna Kannan | ROTARIAN |
| 2026RTY0002 | 24-01-2025 | Mangalore South | Rtn. Satish Bolar | ROTARIAN |

### Step 2: Create Club Lookup Sheet

Create a sheet named "ClubLookup" with:

| A | B |
|---|---|
| ClubName | ClubID |
| Mysore Midtown | 59 |
| Mysore North | 62 |
| Mangalore South | 47 |
... (all 92 clubs)

### Step 3: Create Transformation Sheet

Create a sheet named "ForImport" with formulas:

## Column Formulas (Row 2 onwards)

### A: registration_id
```excel
=RawData!A2
```

### B: order_id
```excel
="MANUAL_REG_"&RIGHT(RawData!A2,3)
```

### C: name
```excel
=RawData!D2
```

### D: mobile
```excel
="0000000000"
```

### E: email
```excel
="noreply@sneha2026.in"
```

### F: club
```excel
=RawData!C2
```

### G: club_id
```excel
=IFERROR(VLOOKUP(F2,ClubLookup!A:B,2,FALSE),56)
```
*(Returns 56 for Mysore if club not found)*

### H: registration_type
```excel
=IF(RawData!E2="ROTARIAN","Rotarian",
  IF(RawData!E2="ROTARIAN WITH SPOUSE","Rotarian with Spouse",
    IF(RawData!E2="ROTARY ANNE","Ann",
      IF(RawData!E2="SILVER SPONSOR","Silver Sponsor",
        IF(RawData!E2="GOLD SPONSOR","Gold Sponsor",
          IF(RawData!E2="PLATINUM SPONSOR","Platinum Sponsor",
            IF(RawData!E2="PATRON SPONSOR","Patron Sponsor",
              IF(RawData!E2="SILVER DONOR","Silver Sponsor",
                "Rotarian"))))))))
```

### I: registration_amount
```excel
=IF(H2="Rotarian",7500,
  IF(H2="Rotarian with Spouse",14000,
    IF(H2="Ann",7500,
      IF(H2="Guest",5000,
        IF(H2="Silver Sponsor",25000,
          IF(H2="Gold Sponsor",100000,
            IF(H2="Platinum Sponsor",200000,
              IF(H2="Patron Sponsor",500000,
                7500))))))))
```

### J: meal_preference
```excel
="Veg"
```

### K: payment_status
```excel
="SUCCESS"
```

### L: payment_method
```excel
="Manual"
```

### M: transaction_id
```excel
=A2
```

### N: payment_date (Convert DD-MM-YYYY to YYYY-MM-DD)
```excel
=TEXT(DATEVALUE(MID(RawData!B2,4,2)&"/"&LEFT(RawData!B2,2)&"/"&RIGHT(RawData!B2,4)),"yyyy-mm-dd")
```
*Or simpler if your Excel has DATE function:*
```excel
=TEXT(DATE(RIGHT(RawData!B2,4),MID(RawData!B2,4,2),LEFT(RawData!B2,2)),"yyyy-mm-dd")
```

### O: registration_source
```excel
="Manual"
```

### P: added_by
```excel
="Admin Import"
```

### Q: created_at
```excel
=N2
```

### R: updated_at
```excel
=N2
```

---

## Complete Club Lookup Data

Copy-paste this into your ClubLookup sheet:

```
ClubName	ClubID
B C Road City	1
Baikampady	2
Bajpe	3
Bannur	4
Bantwal	5
Bantwal Loretto Hills	6
Bantwal Town	7
Bellare Town	8
Belthangady	9
Birumale Hills Puttur	10
Central Mysore	11
Chamarajanagara	93
Chamarajanagara Silk City	14
Deralakatte	16
E Club of Mysore Center	18
Gonikoppal	25
H D Kote	26
Hemavathi Kodlipete	27
Heritage Mysuru	27
Hunsur	28
Ivory City	29
Kollegala	32
Kollegala Midtown	33
Krishnarajanagara	34
Krishnaraja	34
Kushalnagara	35
Madikeri	36
Madhyanthar	37
Mangalore	38
Mangalore Central	39
Mangalore City	39
Mangalore Coastal	40
Mangalore Down Town	40
Mangalore East	41
Mangalore Hillside	40
Mangalore Metro	44
Mangalore Midtown	43
Mangalore North	42
Mangalore Port Town	45
Mangalore Seaside	46
Mangalore South	47
Mangalore Sunrise	45
Misty Hills Madikeri	51
Modankap	51
Moodabidri	52
Moodabidri Temple Town	53
Mulki	54
Mysore	56
Mysore Ambari	57
Mysore Brindavan	57
Mysore East	60
Mysore Elite	61
Mysore Jayaprakash Nagar	62
Mysore Metro	58
Mysore Midtown	59
Mysore North	62
Mysore Royal	64
Mysore SouthEast	63
Mysore Sreegandha	65
Mysore Stars	65
Mysore West	66
Mysuru Diamond	67
Nanjangud	55
Panchasheel	70
Periyapatna Icons	71
Periyapatna Midtown	72
Puttur	74
Puttur Central	75
Puttur City	75
Puttur East	76
Puttur Elite	77
Puttur Swarna	78
Puttur Yuva	78
Shanivarashanthe	78
Siddakatte	78
Somarpete Hills	78
Subramanya	79
Sullia	80
Sullia City	81
Surathkal	82
Uppinangdi	87
Vijayanagara Mysore	88
Virajpete	89
Vittal	90
Yelandur Greenway	92
```

---

## Step-by-Step Process

### 1. Setup Sheets
- Create 3 sheets: RawData, ClubLookup, ForImport
- Add column headers

### 2. Fill RawData
- Paste your 680 registration records
- Format: RegNo | Date | Club | Name | Type

### 3. Fill ClubLookup
- Copy-paste the club mapping table above

### 4. Add Formulas to ForImport
- Row 1: Headers (registration_id, order_id, name, ...)
- Row 2: Copy all formulas from above
- Drag down to row 681 (680 records + 1 header)

### 5. Convert to Values
- Select all formula cells in ForImport sheet
- Copy
- Paste Special → Values Only

### 6. Export as CSV
- File → Save As
- Format: CSV UTF-8 (Comma delimited)
- Name: 680-registrations.csv

### 7. Import to Database
- Use pgAdmin Import/Export feature
- Or use psql COPY command
- Map columns correctly

---

## Validation Formulas

Add these in separate columns to verify data:

### Check Missing Club IDs
```excel
=IF(ISNA(G2),"❌ Club Not Found","✅")
```

### Check Amount Calculation
```excel
=IF(I2>0,"✅","❌ Invalid Amount")
```

### Check Date Format
```excel
=IF(ISERROR(N2),"❌ Date Error","✅")
```

### Check Registration Number
```excel
=IF(LEN(A2)=11,"✅","❌ Invalid RegNo")
```

---

## Sample Excel Layout

```
Sheet: RawData
┌──────────────┬────────────┬─────────────────┬──────────────────────────┬─────────────────────┐
│ RegNo        │ Date       │ Club            │ Name                     │ Type                │
├──────────────┼────────────┼─────────────────┼──────────────────────────┼─────────────────────┤
│ 2026RTY0001  │ 24-01-2025 │ Mysore Midtown  │ Rtn. Ramakrishna Kannan  │ ROTARIAN            │
│ 2026RTY0002  │ 24-01-2025 │ Mangalore South │ Rtn. Satish Bolar        │ ROTARIAN            │
└──────────────┴────────────┴─────────────────┴──────────────────────────┴─────────────────────┘

Sheet: ClubLookup
┌─────────────────┬────────┐
│ ClubName        │ ClubID │
├─────────────────┼────────┤
│ Mysore Midtown  │ 59     │
│ Mysore North    │ 62     │
└─────────────────┴────────┘

Sheet: ForImport (with formulas, then convert to values)
┌────────────────┬────────────────┬──────────────────────────┬────────────┬─────────────────────┐
│ registration_id│ order_id       │ name                     │ mobile     │ email               │
├────────────────┼────────────────┼──────────────────────────┼────────────┼─────────────────────┤
│ 2026RTY0001    │ MANUAL_REG_001 │ Rtn. Ramakrishna Kannan  │ 0000000000 │ noreply@sneha2026.in│
└────────────────┴────────────────┴──────────────────────────┴────────────┴─────────────────────┘
```

---

## Tips for Success

1. **Test with 10 records first** - Verify formulas work correctly
2. **Use Excel Tables** - Easier to manage and extend
3. **Data Validation** - Add dropdown lists for consistency
4. **Freeze Panes** - Freeze header row while scrolling
5. **Conditional Formatting** - Highlight errors in red
6. **Save Often** - Don't lose your work!

---

## Common Excel Issues & Fixes

### Issue: VLOOKUP returns #N/A
**Fix**: Check spelling of club names, add error handling with IFERROR

### Issue: Date shows as number
**Fix**: Ensure TEXT function formats correctly, check cell format

### Issue: Formula not dragging down
**Fix**: Use absolute references ($A$1) where needed, check cell locks

### Issue: CSV has extra quotes
**Fix**: Use CSV UTF-8 format, check text qualifier in import wizard

---

## Time Estimate

- Setup sheets: 10 minutes
- Enter raw data: 30-60 minutes (or copy-paste)
- Verify formulas: 10 minutes
- Convert to values: 5 minutes
- Export CSV: 5 minutes
- Import to database: 10 minutes
- Verify import: 15 minutes

**Total**: ~2 hours

---

**Ready to start?** Follow the steps above and you'll have all 680 records imported smoothly!
