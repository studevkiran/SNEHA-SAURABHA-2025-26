# 🔒 MAINTENANCE MODE - VERCEL ENVIRONMENT VARIABLE SETUP

## ✅ Implementation Complete

Your website now has professional maintenance mode that you can toggle ON/OFF from Vercel dashboard without touching any code!

---

## 🚀 HOW TO USE (Simple 3 Steps)

### To PAUSE Registrations (Turn ON Maintenance):

1. **Go to Vercel Dashboard**
   - Open: https://vercel.com/dashboard
   - Select your project: `sneha-saurabha-2025-26`

2. **Add Environment Variables**
   - Click **Settings** tab
   - Click **Environment Variables** in left sidebar
   - Add these variables:

   | Variable Name | Value |
   |--------------|-------|
   | `MAINTENANCE_MODE` | `true` |
   | `MAINTENANCE_MESSAGE` | `Registrations temporarily paused due to payment gateway maintenance. We will resume shortly!` |
   | `MAINTENANCE_RESUME` | `17th January 2026, 10:00 AM` |

3. **Redeploy**
   - Go to **Deployments** tab
   - Click the `...` menu on latest deployment
   - Click **Redeploy**
   - ✅ Done! Registrations are now paused

### To RESUME Registrations (Turn OFF Maintenance):

1. **Go to Vercel Dashboard → Settings → Environment Variables**
2. **Change** `MAINTENANCE_MODE` from `true` to `false`
3. **Redeploy** (same as above)
4. ✅ Done! Registrations are now active

---

## 🎯 WHAT HAPPENS WHEN MAINTENANCE IS ON

### For Website Visitors:
1. **Orange Banner Appears** at top of page showing:
   - ⚠️ "Registrations Temporarily Paused"
   - Your custom message
   - Expected resume time
   - Contact number for urgent queries

2. **"Register Now" Button Disabled**
   - Button becomes grayed out
   - Cannot be clicked

3. **Alert on Click**
   - If someone tries to register, shows alert with full details

### What Still Works:
- ✅ Admin dashboard (unaffected)
- ✅ Website viewing (all pages visible)
- ✅ WhatsApp button
- ✅ Existing registrations/receipts
- ✅ Payment callbacks (in progress payments complete normally)

---

## 📋 ENVIRONMENT VARIABLES REFERENCE

### Required:
```bash
MAINTENANCE_MODE=true     # true = paused, false = active
```

### Optional (customize messages):
```bash
MAINTENANCE_MESSAGE="Your custom message here"
MAINTENANCE_RESUME="Your expected resume time"
```

### Default Messages (if not set):
- Message: "Registrations temporarily paused due to payment gateway maintenance. We will resume shortly!"
- Resume: "17th January 2026, 10:00 AM"

---

## 🔧 TECHNICAL DETAILS

### Files Created/Modified:

1. **`api/maintenance-status.js`** (NEW)
   - API endpoint that returns maintenance status
   - Reads from environment variables
   - CORS-enabled for frontend access

2. **`scripts/app.js`** (MODIFIED)
   - Added `checkMaintenanceMode()` function
   - Checks status on page load
   - Shows/hides banner dynamically
   - Blocks registration flow when active

3. **`styles/main.css`** (MODIFIED)
   - Added `.maintenance-banner` styles
   - Orange gradient background
   - Responsive design (mobile + desktop)
   - Slide-down animation

### API Endpoint:
```
GET /api/maintenance-status
```

**Response:**
```json
{
  "success": true,
  "maintenanceMode": true,
  "message": "Your message",
  "expectedResume": "Your time",
  "registrationAllowed": false,
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

---

## 📱 TESTING

### Test Maintenance Mode:
1. Set `MAINTENANCE_MODE=true` in Vercel
2. Redeploy
3. Visit website
4. Should see:
   - ✅ Orange banner at top
   - ✅ Disabled Register button
   - ✅ Alert on button click

### Test Resume:
1. Change to `MAINTENANCE_MODE=false`
2. Redeploy
3. Visit website
4. Should see:
   - ✅ No banner
   - ✅ Active Register button
   - ✅ Normal registration flow

---

## 🆘 TROUBLESHOOTING

### Banner Not Showing?
- Clear browser cache: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Check environment variable spelling: `MAINTENANCE_MODE` (exact case)
- Verify value is string `"true"` not boolean

### Can't Redeploy?
- Alternative: Go to **Deployments** → Click latest
- Or: Push any change to GitHub (auto-deploys)

### Banner Shows But Registration Works?
- Check if `MAINTENANCE_MODE=false` (string "false", not empty)
- Clear cache and hard reload

### Want to Test Locally?
```bash
# In your terminal
export MAINTENANCE_MODE=true
npm run dev
```

---

## 💡 QUICK TIPS

### Bank Issue Example:
```
MAINTENANCE_MODE=true
MAINTENANCE_MESSAGE="Payment gateway temporarily unavailable due to bank maintenance. We apologize for the inconvenience."
MAINTENANCE_RESUME="17th January 2026, 2:00 PM"
```

### Weekend Pause Example:
```
MAINTENANCE_MODE=true
MAINTENANCE_MESSAGE="Registrations closed for the weekend. We'll resume on Monday!"
MAINTENANCE_RESUME="Monday, 20th January 2026, 9:00 AM"
```

### Emergency Stop:
```
MAINTENANCE_MODE=true
MAINTENANCE_MESSAGE="Technical maintenance in progress. Please check back in 30 minutes."
MAINTENANCE_RESUME="In 30 minutes"
```

---

## 🎓 FOR YOUR TEAM

### To Give Access:
1. Go to Vercel Dashboard → **Settings** → **Members**
2. Invite team members with **Viewer** or **Admin** role
3. They can toggle maintenance mode without code access

### Quick Reference Card (Share with team):
```
🔴 TO PAUSE:
1. Vercel → Settings → Environment Variables
2. MAINTENANCE_MODE = true
3. Redeploy

🟢 TO RESUME:
1. Vercel → Settings → Environment Variables  
2. MAINTENANCE_MODE = false
3. Redeploy

Contact: +91 99805 57785
```

---

## 🚨 IMPORTANT NOTES

1. **Always Redeploy** after changing environment variables
2. **Wait 30-60 seconds** for deployment to complete
3. **Clear Browser Cache** when testing (Cmd+Shift+R)
4. **In-Progress Payments** will still complete normally
5. **Admin Dashboard** remains accessible always
6. **Fail-Safe**: If API fails, registrations stay OPEN (safe default)

---

## 📞 SUPPORT

For any issues with maintenance mode:
- Check this guide first
- Test in incognito/private window
- Contact: +91 99805 57785

---

**Status**: ✅ Ready to Deploy
**Next Step**: Push to GitHub → Auto-deploys to Vercel
**Test Time**: ~2 minutes after deployment

---

**Created**: 16 January 2026
**Your Baby is Safe**: No destructive changes, fully reversible! 👶💙
