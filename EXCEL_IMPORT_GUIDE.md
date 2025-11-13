# 📊 Excel Import Guide for Club Members

## Step 1: Prepare Your Excel File

Your Excel should have these columns (order doesn't matter):
- **Club Name** (required) - e.g., "RC Mysore", "RC Bangalore"
- **Member Name** (required) - e.g., "John Doe"
- **Email** (optional but recommended) - e.g., "john@example.com"
- **Mobile** (optional) - e.g., "9876543210"
- **Member Type** (optional, defaults to "Rotarian") - Options: "Rotarian", "Ann", "Annet"

### Example Excel Format:

| Club Name       | Member Name    | Email              | Mobile      | Member Type |
|----------------|----------------|--------------------|-----------  |-------------|
| RC Mysore      | John Doe       | john@example.com   | 9876543210  | Rotarian    |
| RC Mysore      | Jane Smith     | jane@example.com   | 9876543211  | Ann         |
| RC Bangalore   | Bob Johnson    | bob@example.com    | 9876543212  | Rotarian    |

---

## Step 2: Convert Excel to JSON

### Option A: Use Online Tool (Recommended for Non-Technical)
1. Go to: https://www.convertcsv.com/excel-to-json.htm
2. Upload your Excel file
3. Select "Output: Array of objects"
4. Click "Convert Excel to JSON"
5. Copy the JSON output

### Option B: Use Excel Save As
1. Open your Excel file
2. File → Save As → Choose "CSV (Comma delimited)"
3. Save as `club-members.csv`
4. Use the import tool below to convert CSV → JSON

### Option C: Manual JSON (for small datasets)
```json
[
  {
    "clubName": "RC Mysore",
    "memberName": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "memberType": "Rotarian"
  },
  {
    "clubName": "RC Mysore",
    "memberName": "Jane Smith",
    "email": "jane@example.com",
    "mobile": "9876543211",
    "memberType": "Ann"
  }
]
```

---

## Step 3: Import via API

### Method 1: Using cURL (Command Line)

Save your JSON to a file `members.json`, then run:

```bash
curl -X POST "https://www.sneha2026.in/api/members/import" \
  -H "Content-Type: application/json" \
  -d @members.json
```

### Method 2: Using Admin Panel (Coming Soon)

We'll add an import button in the admin dashboard where you can:
1. Upload Excel file directly
2. Preview data
3. Click "Import"

---

## Step 4: Run Database Migration

Before importing, create the table:

```bash
# Connect to your database and run:
psql $DATABASE_URL -f database/club-members-schema.sql
```

Or use the Neon/Vercel Postgres dashboard to run the SQL from `club-members-schema.sql`.

---

## Step 5: Test the Import

After importing, test:

```bash
# Get members from a specific club
curl "https://www.sneha2026.in/api/members/by-club?clubName=RC%20Mysore"
```

Expected response:
```json
{
  "success": true,
  "clubName": "RC Mysore",
  "count": 25,
  "members": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "mobile": "9876543210",
      "type": "Rotarian"
    }
  ]
}
```

---

## 📝 Import Request Format

When calling `/api/members/import`, send:

```json
{
  "members": [
    {
      "clubName": "RC Mysore",
      "clubId": "RC_MYSORE", // Optional, will be matched automatically
      "memberName": "John Doe",
      "email": "john@example.com",
      "mobile": "9876543210",
      "memberType": "Rotarian"
    }
  ],
  "overwrite": false  // Set to true to update existing members
}
```

---

## 🎯 Next Steps After Import

1. **Test Quick Registration**:
   - Select "RC Mysore" from club dropdown
   - Name dropdown will populate with members
   - Email & phone auto-fill

2. **Add More Members**:
   - Use admin panel to add manually
   - Or re-import with new Excel file

3. **Update Existing Members**:
   - Re-import with `"overwrite": true`

---

## 🔧 Troubleshooting

### Issue: Import fails with "Table does not exist"
**Solution**: Run the schema SQL first:
```bash
psql $DATABASE_URL -f database/club-members-schema.sql
```

### Issue: Members not showing in dropdown
**Solution**: Check club name spelling matches exactly

### Issue: Duplicate members
**Solution**: Re-import with `"overwrite": true` to update

---

## 📞 Need Help?

After you share your Excel structure, I'll:
1. Create a custom import script for your exact format
2. Add Excel upload directly in admin panel
3. Set up the quick registration UI

**Share your Excel column names and I'll proceed!** 🚀
