# Google Sheets Database Setup Guide

## Overview

Your registration system now uses **Google Sheets** as the primary database with automatic backup logging. This makes it easy to:
- View and sort data directly in Google Sheets
- Share access with team members
- Export data easily
- Have automatic daily backup logs

## Architecture

```
Registration Flow:
1. User registers → API receives data
2. Save to Google Sheets (primary)
3. Save to PostgreSQL (backup, if available)
4. Log to backup file (/tmp/registration-logs/)
5. Send WhatsApp confirmation
6. Admin dashboard reads from Google Sheets
```

---

## Step 1: Create Google Sheets Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click "+ Blank" to create new spreadsheet
3. Name it: **SNEHA SAURABHA 2025-26 Registrations**
4. Rename the first sheet to: **Registrations**

### Set Up Columns (Row 1 - Headers):

Copy and paste these headers in Row 1:

```
A: Registration ID
B: Order ID
C: Timestamp
D: Name
E: Mobile
F: Email
G: Club
H: Club ID
I: Registration Type
J: Amount
K: Meal Preference
L: Payment Status
M: Payment Method
N: Transaction ID
O: UPI ID
P: Registration Status
Q: Verified
R: Manually Added
```

### Format the Sheet:

1. **Bold Row 1** (headers)
2. **Freeze Row 1**: View → Freeze → 1 row
3. **Apply Filters**: Data → Create a filter
4. **Auto-resize columns**: Select all → Format → Fit to data

---

## Step 2: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Project name: `sneha-saurabha-2025-26`
4. Click "Create"

---

## Step 3: Enable Google Sheets API

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google Sheets API"
3. Click on it → Click "Enable"

---

## Step 4: Create Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click "+ CREATE CREDENTIALS" → "Service account"
3. Fill in:
   - **Service account name**: `registration-system`
   - **Service account ID**: (auto-generated)
4. Click "Create and Continue"
5. Skip role selection (optional) → Click "Continue"
6. Click "Done"

---

## Step 5: Generate JSON Key

1. In Credentials page, find your service account
2. Click on the service account email
3. Go to **Keys** tab
4. Click "Add Key" → "Create new key"
5. Select **JSON** → Click "Create"
6. **Save the downloaded JSON file** (e.g., `credentials.json`)

---

## Step 6: Share Google Sheet with Service Account

1. Open your Google Sheet
2. Click "Share" button (top right)
3. Copy the **service account email** from the JSON file:
   - It looks like: `registration-system@sneha-saurabha-2025-26.iam.gserviceaccount.com`
4. Paste it in the "Add people and groups" field
5. Set permission to **Editor**
6. **Uncheck** "Notify people"
7. Click "Share"

---

## Step 7: Get Sheet ID

1. Open your Google Sheet
2. Look at the URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```
3. Copy the **SHEET_ID** (the long string between `/d/` and `/edit`)

Example URL:
```
https://docs.google.com/spreadsheets/d/1abc123XYZ456def789GHI/edit
```
Sheet ID: `1abc123XYZ456def789GHI`

---

## Step 8: Add to Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **SNEHA-SAURABHA-2025-26**
3. Go to **Settings** → **Environment Variables**

### Add These Variables:

**Variable 1: GOOGLE_SHEETS_CREDENTIALS**
- Name: `GOOGLE_SHEETS_CREDENTIALS`
- Value: *Entire contents of the JSON file you downloaded*
  - Open `credentials.json` in a text editor
  - Copy **everything** (from opening `{` to closing `}`)
  - Paste as value
- Environment: Check ALL (Production, Preview, Development)
- Click "Save"

**Variable 2: GOOGLE_SHEET_ID**
- Name: `GOOGLE_SHEET_ID`
- Value: Your sheet ID (from Step 7)
- Environment: Check ALL
- Click "Save"

---

## Testing

### After Setting Environment Variables:

1. Wait 60 seconds for Vercel to redeploy
2. Make a test registration on your website
3. Check Google Sheets - new row should appear!

### What Should Appear:

- New row with all registration details
- Timestamp showing when registered
- Payment status, meal preference, etc.
- All sortable and filterable in Google Sheets!

---

## Admin Dashboard

### Do You Still Need the Admin Dashboard?

**YES, if you want:**
- ✅ Easy view of statistics (total registrations, revenue)
- ✅ Built-in filters and search
- ✅ Quick access without opening Google Sheets
- ✅ Export functionality

**NO, if you prefer:**
- ✅ Direct access to Google Sheets (easier to share)
- ✅ Native Google Sheets features (better sorting, formulas)
- ✅ Simpler setup (no admin login management)

**Current setup supports BOTH:**
- Admin dashboard reads from Google Sheets
- You can also view/edit directly in Google Sheets
- Changes in Google Sheets appear in admin dashboard after refresh

---

## Backup Logs

### Automatic Daily Logs:

Every registration is logged to:
```
/tmp/registration-logs/registrations-YYYY-MM-DD.log
```

Example: `/tmp/registration-logs/registrations-2025-11-07.log`

### Log Format:

Each line is a JSON object:
```json
{
  "timestamp": "2025-11-07T14:30:00.000Z",
  "type": "REGISTRATION",
  "data": {
    "registration_id": "REG1730987400000",
    "name": "John Doe",
    "mobile": "9876543210",
    ...
  }
}
```

### Log Types:

- `REGISTRATION` - New registration created
- `PAYMENT_VERIFICATION` - Payment verified
- `WHATSAPP_SENT` - WhatsApp confirmation sent

### Accessing Logs:

Logs are stored in Vercel's temporary storage (`/tmp/`):
- **Persists during** function execution
- **Lost when** function cold starts (after ~15 minutes inactivity)
- **Best for**: Debugging and short-term backup
- **Not for**: Long-term storage (use Google Sheets for that)

---

## Data Flow Summary

### On Registration:

1. **User submits** registration form
2. **API receives** data
3. **Saves to**:
   - ✅ Google Sheets (primary)
   - ✅ PostgreSQL (if available)
   - ✅ Backup log file
4. **Payment verification** via Cashfree
5. **Updates**:
   - ✅ Google Sheets payment status
   - ✅ Backup log
6. **Sends** WhatsApp confirmation
7. **Logs** WhatsApp send status

### On Admin Dashboard Load:

1. **Fetches** from Google Sheets first
2. **Falls back** to PostgreSQL if Google Sheets fails
3. **Applies** filters and search
4. **Displays** in dashboard

---

## Troubleshooting

### "Google Sheets not initialized" Error:

- Check `GOOGLE_SHEETS_CREDENTIALS` environment variable is set
- Verify JSON is valid (no extra spaces, complete)
- Wait for Vercel redeployment after setting variables

### "GOOGLE_SHEET_ID not set" Error:

- Add `GOOGLE_SHEET_ID` environment variable
- Use the ID from sheet URL (not the full URL)

### "Permission denied" Error:

- Share the Google Sheet with service account email
- Set permission to "Editor"
- Check service account email matches the one in JSON

### Data Not Appearing in Sheet:

- Check sheet name is exactly "Registrations"
- Verify service account has Editor permission
- Check Vercel deployment logs for errors
- Make test registration and check browser console

---

## Advantages of This Setup

### ✅ Benefits:

1. **Easy Access**: Open Google Sheets anytime, anywhere
2. **Easy Sharing**: Share with team members (read-only or edit)
3. **Native Features**: Use Google Sheets formulas, charts, pivot tables
4. **Auto-sorted**: Apply filters, sort any column instantly
5. **Easy Export**: Download as Excel, CSV, PDF natively
6. **Real-time**: Changes appear immediately in Google Sheets
7. **Backup**: Daily log files + PostgreSQL fallback
8. **No Database Costs**: Google Sheets is free

### 🎯 Best Practices:

1. **Don't delete** Row 1 (headers)
2. **Don't rename** the "Registrations" sheet
3. **Protect** important columns (Format → Protect range)
4. **Regular backups**: File → Download → Excel/CSV
5. **Monitor logs**: Check Vercel function logs for errors

---

## Next Steps

1. ✅ Create Google Sheet with headers
2. ✅ Create Google Cloud project
3. ✅ Enable Google Sheets API
4. ✅ Create service account and download JSON key
5. ✅ Share sheet with service account email
6. ✅ Get Sheet ID from URL
7. ✅ Add environment variables to Vercel:
   - `GOOGLE_SHEETS_CREDENTIALS`
   - `GOOGLE_SHEET_ID`
8. ✅ Wait for Vercel redeploy (60 seconds)
9. ✅ Test registration
10. ✅ Check Google Sheets for new row!

---

## Admin Dashboard Decision

**Keep admin dashboard if**: You want quick stats and built-in filters
**Remove admin dashboard if**: You only need Google Sheets access

To remove admin dashboard:
1. Delete `admin/` folder
2. Delete `public/admin/` folder
3. Remove admin-related API endpoints

**Current recommendation**: Keep both! Admin dashboard reads from Google Sheets anyway, and provides additional functionality like:
- Quick stats dashboard
- Built-in search and filters
- Login protection
- Export features

---

## Support

### Common Questions:

**Q: Can multiple people edit the Google Sheet?**
A: Yes! Share it with Editor permission for team members.

**Q: Will manual edits in Google Sheets sync to admin dashboard?**
A: Yes! Admin dashboard reads from Google Sheets. Click refresh to see changes.

**Q: What happens if Google Sheets API fails?**
A: System falls back to PostgreSQL database automatically.

**Q: Where are backup logs stored?**
A: In `/tmp/registration-logs/` on Vercel (temporary storage).

**Q: Can I add columns to the sheet?**
A: Yes! Add new columns after Column R. Don't change A-R columns.

---

**Ready to deploy!** Once you set the environment variables, registrations will automatically save to Google Sheets.
