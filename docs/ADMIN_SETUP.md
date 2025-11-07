# Admin Dashboard Setup Guide

## Environment Variables Configuration

The admin dashboard now uses environment-based authentication for security. You need to set these variables in your Vercel project:

### Required Environment Variables

Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add these two variables:

1. **ADMIN_USERNAME**
   - Value: Your desired admin username (e.g., "kiran" or "admin_sneha2026")
   - Environment: Production, Preview, Development (select all)

2. **ADMIN_PASSWORD**
   - Value: Your secure password (use a strong password!)
   - Environment: Production, Preview, Development (select all)

### Important Security Notes

⚠️ **Default Credentials** (if environment variables are not set):
- Username: `admin`
- Password: `admin123`

🔐 **Best Practices:**
- Use a strong, unique password
- Don't share credentials in chat/email
- Change password regularly
- Never commit credentials to GitHub

---

## Admin Dashboard Features

### Desktop-Optimized Layout
- **8-Column Table**: ID, Name, Mobile, Email, Type, Amount, Payment Status, Date
- **Responsive Design**: Works on both desktop and mobile
- **Clean Interface**: Removed clutter for better usability

### Sorting Capability
- **Click Column Headers** to sort data
- **Toggle Direction**: Click again to reverse sort order
- **Sortable Columns**: ID, Name, Mobile, Type, Amount, Date
- **Visual Indicator**: ↕ symbol on sortable headers

### Refresh Functionality
- **🔄 Refresh Button** in toolbar
- **Real-time Data**: Fetches latest registrations from database
- **Quick Updates**: See new registrations without page reload

### Filters & Search
- **Filter by Type**: All registration types dropdown
- **Filter by Payment**: Paid, Pending, Failed
- **Filter by Meal**: Veg, Non-Veg, Jain
- **Search Box**: Search by name, mobile, or email

### Statistics Dashboard
- **Total Registrations**: Count of all registrations
- **Total Revenue**: Sum of all payments
- **Payment Status**: Paid vs Pending breakdown
- **Meal Preferences**: Veg, Non-Veg, Jain distribution

---

## How Admin Login Works

### Authentication Flow
1. User enters username and password
2. Frontend sends POST request to `/api/admin/login`
3. API validates credentials against environment variables
4. If valid, API returns success
5. Frontend stores session flag and shows dashboard
6. Dashboard loads real-time data from database

### API Endpoint: `/api/admin/login`

**Request:**
```json
POST /api/admin/login
{
  "username": "your_username",
  "password": "your_password"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "error": "Invalid username or password"
}
```

---

## Testing the Admin Dashboard

### Step 1: Set Environment Variables in Vercel
1. Go to Vercel Dashboard
2. Navigate to your project settings
3. Add `ADMIN_USERNAME` and `ADMIN_PASSWORD`
4. Save changes
5. Wait for automatic redeployment (~30 seconds)

### Step 2: Access Admin Dashboard
1. Go to: `https://sneha2026.in/admin/`
2. Enter your credentials (from environment variables)
3. Click "Login"

### Step 3: Verify Features
- ✅ Check if login works with your credentials
- ✅ Verify table shows 8 columns
- ✅ Click column headers to test sorting
- ✅ Click refresh button to reload data
- ✅ Test filters and search functionality
- ✅ Check statistics on dashboard

---

## Current Database Data

As of deployment:
- **57 Registrations** loaded successfully
- **₹10,09,500** total revenue
- **Payment statuses**: Completed and Pending
- **Meal preferences**: Veg, Non-Veg, Jain tracked

---

## Troubleshooting

### Login Not Working
- **Check environment variables** are set correctly in Vercel
- **Wait for redeployment** after changing variables
- **Clear browser cache** and cookies
- **Try incognito mode** to rule out autofill issues

### Table Not Loading
- **Check browser console** for errors (F12 → Console)
- **Verify database connection** (should see 57 registrations)
- **Refresh page** or click refresh button
- **Check API endpoint**: `/api/registrations/list` should return data

### Sorting Not Working
- **Check if JavaScript loaded** (look for errors in console)
- **Ensure you're clicking header** (not the ↕ symbol itself)
- **Try different columns** to see if specific column has issue

### Password Autofilling
- **Form has `autocomplete="off"`** to prevent this
- **Clear browser saved passwords** for sneha2026.in
- **Use incognito/private mode** for testing

---

## Next Steps

1. ✅ Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in Vercel
2. ✅ Wait for automatic deployment
3. ✅ Test login with your credentials
4. ✅ Verify all features work (sorting, refresh, filters)
5. ⏳ Apply for Twilio WhatsApp production approval
6. ⏳ Update Cashfree to production mode (add API keys)
7. ⏳ Test complete registration flow end-to-end

---

## Security Recommendations

🔐 **Use Strong Passwords**
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Avoid common words or personal info

🔐 **Don't Share Credentials**
- Use password manager if needed
- Don't send passwords via email/WhatsApp
- Change password if compromised

🔐 **Monitor Access**
- Check admin dashboard regularly
- Review registration data for anomalies
- Keep Vercel deployment logs enabled

---

## Support

If you encounter any issues:
1. Check browser console for errors
2. Verify environment variables are set
3. Test in incognito mode
4. Clear cache and reload
5. Check Vercel deployment logs

**Remember**: The admin dashboard now uses **real database data**, so any registrations you see are actual entries from your PostgreSQL database.
