# SNEHA-SAURABHA 2025-26 Conference Registration Website

## Project Overview
Complete mobile-first conference registration website for Rotary District Conference with Kalparuksha amber-gold theme, payment integration, WhatsApp confirmation, and admin dashboard.

## Project Setup Completed (2025-10-28)

### ✅ Core Features Implemented
- [x] Mobile-first HTML/CSS/JS project structure
- [x] Kalparuksha amber-gold theme throughout
- [x] Single-screen no-scroll flow for optimal mobile UX
- [x] Git repository initialized and committed

### ✅ Registration Flow
- [x] Home page with event branding (two header images, title, slogan, event card)
- [x] 11 registration types with expandable details:
  - Rotarian (₹7,500)
  - Rotarian with Spouse (₹14,000)
  - Ann (₹7,500)
  - Annet (₹7,500)
  - Guest (₹5,000)
  - Rotaractor (₹3,000)
  - Silver Donor (₹25,000)
  - Silver Sponsor (₹50,000)
  - Gold Sponsor (₹1,00,000)
  - Platinum Sponsor (₹2,00,000)
  - Patron Sponsor (₹5,00,000)
- [x] Personal details form with validation
- [x] 91 Rotary clubs loaded from JSON
- [x] Meal preference toggle (Veg/Non-Veg/Jain) with color coding
- [x] Review page with complete details
- [x] Payment screen (ready for gateway integration)
- [x] Success acknowledgment with download options (PDF/Image)

### ✅ Admin Dashboard
- [x] Login-protected admin panel
- [x] Dashboard with statistics (registrations, revenue, status)
- [x] Meal preference summary
- [x] Complete registrations table
- [x] Filters by type, payment status, meal preference
- [x] Search functionality
- [x] Manual registration entry placeholder
- [x] Export functionality (CSV/Excel/PDF) ready
- [x] Edit/resend capabilities structure

### ✅ Backend Integration Ready
- [x] Complete API documentation (`docs/API_STRUCTURE.md`)
- [x] Database schema defined
- [x] Environment variable structure
- [x] Payment gateway integration guide
- [x] WhatsApp API integration guide
- [x] Email service integration guide
- [x] Security best practices documented
- [x] Deployment guide (Vercel/AWS/Firebase)

## Tech Stack
- Pure HTML5
- CSS3 (Grid, Flexbox, CSS Variables, mobile-optimized)
- Vanilla JavaScript (ES6+)
- No dependencies for core functionality
- Ready for jsPDF (PDF download)
- Ready for html2canvas (Image download)

## Key Features
- Fixed viewport (no scrolling, no flicker)
- Bright amber-gold Kalparuksha color scheme
- Touch-optimized interactions
- Real-time form validation
- Expandable registration type cards
- Color-coded meal preference toggles
- Smooth screen transitions
- Landscape mode support
- Club dropdown with 91 clubs
- Transaction ID and UPI ID capture
- WhatsApp confirmation ready
- Admin dashboard with full CRUD

## Data Structure
- Registration types with pricing and inclusions
- 91 Rotary clubs in JSON format
- Complete registration data model
- Payment transaction tracking
- Verification status tracking

## Next Steps

### Immediate Actions Required
1. **Upload Event Images**:
   - Add `images/header-left.jpg` (Rotary logo or left branding)
   - Add `images/header-right.jpg` (Event branding or right image)

2. **Push to GitHub**:
   ```bash
   git push -u origin main
   ```

3. **Test on Mobile Devices**:
   - iOS Safari
   - Chrome Mobile
   - Various screen sizes

### For Production Deployment

4. **Backend Setup**:
   - Choose database (MongoDB/PostgreSQL/MySQL)
   - Set up API endpoints (see `docs/API_STRUCTURE.md`)
   - Configure environment variables

5. **Payment Integration**:
   - Choose gateway (Razorpay recommended)
   - Add API keys to environment
   - Test payment flow

6. **WhatsApp Integration**:
   - Set up WhatsApp Business API account
   - Get template approved
   - Add API credentials

7. **Email Service**:
   - Configure SMTP or email service
   - Set up confirmation templates
   - Test email delivery

8. **Admin Security**:
   - Change default admin credentials
   - Implement JWT authentication
   - Set up proper password hashing

9. **Testing**:
   - Test all registration types
   - Test payment success/failure flows
   - Test admin operations
   - Load testing for expected volume

10. **Deploy**:
    - Deploy to Vercel/Netlify/AWS
    - Configure custom domain
    - Set up SSL certificate
    - Monitor performance

## Files Structure
```
├── index.html              # Main registration page
├── admin/
│   └── index.html         # Admin dashboard
├── data/
│   └── clubs.json         # 91 Rotary clubs
├── docs/
│   └── API_STRUCTURE.md   # Complete API docs
├── images/                # Event images folder
├── scripts/
│   ├── app.js            # Main logic
│   └── admin.js          # Admin logic
├── styles/
│   ├── main.css          # Main theme
│   └── admin.css         # Admin styles
└── README.md             # Documentation
```

## Running the Project
- Open `index.html` in browser, or
- Use Live Server in VS Code, or
- Run `python3 -m http.server 8000`

## Admin Access
- URL: `admin/index.html`
- Default: admin / admin123 (CHANGE IN PRODUCTION!)

## API Documentation
See `docs/API_STRUCTURE.md` for:
- Complete endpoint list
- Request/response formats
- Database schemas
- Security guidelines
- Deployment instructions
- Environment variables

## Important Notes
- All prices in INR (Indian Rupees)
- Event: 30-31 Jan & 1 Feb 2026
- Venue: Silent Shores, Mysore
- District: Rotary 3181
- All API keys must be in environment variables
- Never commit secrets to repository
- Test thoroughly before production

---

## CRITICAL INCIDENT - Zone Unmapped Issue (Dec 23, 2025)

### INCIDENT SUMMARY
**Problem**: Dashboard showing 9 unmapped registrations  
**Root Causes**: THREE separate issues found and fixed  
**Status**: ✅ RESOLVED - 8 fixed, 1 guest correctly left unmapped

---

### ROOT CAUSE ANALYSIS

#### Issue 1: Regex Pattern Bug (Frontend Display Issue)
**Problem**: Regex `/Zone\s+(\d+)/i` only matches "Zone 1" format, NOT "Zone 7A" (sub-zones)  
**Impact**: All sub-zones counted as "Unmapped" in stats despite having valid zones  
**Fix**: Changed to `/Zone\s+(\d+)[A-Z]?/i` in all files

**Files Fixed:**
- `api/stats/zones.js` (line 59)
- `public/admin/tally.html` (lines 1192, 1242)
- `public/admin/index.html` (lines 1116, 1124, 1195, 1304)
- `admin/tally.html` (lines 1191, 1242)
- `check-unmapped-now.js` (line 30)

#### Issue 2: Database NULL Zones (Data Issue)
**Problem**: 9 registrations (IDs 3139-3169) had `zone = NULL` in database  
**Root Cause**: Registration creation NOT auto-assigning zones (trigger/function broken)  
**Impact**: New registrations saved without zones

**Affected Registrations:**
- ID 3169, 3166, 3165, 3159: Chamarajanagar → Zone 9A
- ID 3163, 3161: Somwarpet Hills → Zone 6B
- ID 3149: Mulky → Zone 1
- ID 3139: Ivory City Mysuru → Zone 7A
- ID 3067: Guest/No Club → NULL (correctly left unmapped)

**Fix**: Created `api/admin/force-fix-zones.js` to directly update zones

#### Issue 3: List API Reading Wrong Table (Critical Bug)
**Problem**: List API doing `LEFT JOIN clubs` and reading `c.zone` instead of `r.zone`  
**Impact**: Zone updates to registrations table were invisible to frontend  
**Fix**: Changed query from:
```javascript
// ❌ WRONG - reads from clubs table
SELECT r.*, c.zone FROM registrations r LEFT JOIN clubs c ON r.club_id = c.id

// ✅ CORRECT - reads from registrations table
SELECT r.* FROM registrations r
```
**File Fixed**: `api/registrations/list.js` (line 46)

---

### WHAT WENT WRONG DURING THE FIX

#### Trial-and-Error Mistakes Made:
1. **api/admin/fix-9-unmapped.js** - Used wrong SQL (`WHERE zone = 'None'` instead of `IS NULL`) ❌
2. **api/admin/fix-none-zones.js** - Same mistake, looking for string 'None' ❌
3. **api/admin/fix-9-ids.js** - Updates worked but invisible due to Issue 3 ❌
4. **api/admin/force-fix-zones.js** - Worked BUT incorrectly assigned zone to guest ❌
5. **api/admin/revert-guest-3067.js** - Fixed the guest mistake ✅

#### Key Learning:
- NULL in database appears as `None` (Python) or `null` (JSON), NOT the string `'None'`
- SQL: Use `WHERE zone IS NULL`, NOT `WHERE zone = 'None'`
- Check which table the API is reading from (registrations vs clubs JOIN issue)

---

### PERMANENT FIX NEEDED - PREVENT FUTURE OCCURRENCES

**⚠️ CRITICAL**: New registrations still getting NULL zones!

#### Root Cause:
Registration creation logic does NOT auto-assign zones. Need to add zone assignment in:

**Option 1: Database Trigger (Recommended)**
```sql
CREATE OR REPLACE FUNCTION auto_assign_zone()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.zone IS NULL AND NEW.club_id IS NOT NULL THEN
    NEW.zone := (SELECT zone FROM clubs WHERE id = NEW.club_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_zone_on_insert
BEFORE INSERT ON registrations
FOR EACH ROW
EXECUTE FUNCTION auto_assign_zone();
```

**Option 2: Application-Level Fix**
In registration creation API (likely `api/register.js` or similar):
```javascript
const { getZoneForClub } = require('../lib/zone-mapping.js');

// Before INSERT:
const zone = club_id && club_id !== 'guest' ? getZoneForClub(clubName) : null;

// Then include zone in INSERT:
await pool.query(
  'INSERT INTO registrations (..., zone) VALUES (..., $X)',
  [..., zone]
);
```

#### Files to Check:
- [ ] `api/register.js` or payment callback handler
- [ ] `api/payment/callback.js` or wherever registrations are created
- [ ] Check if zone is included in INSERT statement
- [ ] Add `getZoneForClub()` call before INSERT

---

### HOW TO FIX WHEN THIS HAPPENS AGAIN

1. **Identify unmapped registrations:**
```bash
curl -s "https://www.sneha2026.in/api/registrations/list" | python3 -c "
import json, sys, re
data = json.load(sys.stdin)
regs = [r for r in data['data']['registrations'] if r.get('payment_status') not in ['test', 'manual-B']]
bad = [r for r in regs if not r.get('zone') or not re.match(r'^Zone\s+\d+[A-Z]?$', str(r.get('zone')), re.I)]
print(f'Found {len(bad)} unmapped:')
for r in bad:
    print(f\"  ID: {r['id']}, Name: {r['name']}, Club: {r['club']}, Zone: {r.get('zone')}\")
"
```

2. **Edit fix API with new IDs:**
   - Copy `api/admin/force-fix-zones.js` or edit the `updates` array
   - Map each ID to correct zone (check club in zone-mapping.js)
   - **IMPORTANT**: Exclude guests - they should remain NULL

3. **Deploy and run:**
```bash
git add api/admin/force-fix-zones.js
git commit -m "Fix new unmapped zones"
git push
sleep 40
curl -X POST https://www.sneha2026.in/api/admin/force-fix-zones
```

4. **Verify fix:**
```bash
curl -s "https://www.sneha2026.in/api/registrations/list" | python3 -c "
import json, sys, re
data = json.load(sys.stdin)
regs = [r for r in data['data']['registrations'] if r.get('payment_status') not in ['test', 'manual-B']]
bad = [r for r in regs if not r.get('zone') or not re.match(r'^Zone\s+\d+[A-Z]?$', str(r.get('zone')), re.I)]
print(f'Unmapped count: {len(bad)}')
"
```

5. **Clear browser cache** on dashboard: `Cmd+Shift+R` or `Ctrl+Shift+R`

---

### SQL PATTERNS (for future fix APIs)

**Check for unmapped:**
```sql
WHERE zone IS NULL 
   OR zone = '' 
   OR zone = 'Unmapped'
   OR zone NOT SIMILAR TO 'Zone [0-9]+[A-Z]?'
```

**Update with correct zone:**
```sql
UPDATE registrations 
SET zone = $1 
WHERE id = $2 
  AND (club IS NOT NULL AND club != 'Guest/No Club')
RETURNING id, zone
```

---

### PREVENTION CHECKLIST

#### Code Standards:
- [ ] All zone regex patterns use: `/Zone\s+(\d+)[A-Z]?/i`
- [ ] SQL patterns use: `SIMILAR TO 'Zone [0-9]+[A-Z]?'` or proper `IS NULL` checks
- [ ] APIs read from `registrations.zone` NOT `clubs.zone` via JOIN
- [ ] Always test with sub-zones (Zone 7A) not just simple zones (Zone 1)

#### Registration Flow:
- [ ] Zone auto-assigned on registration creation (database trigger OR application logic)
- [ ] Payment callback includes zone assignment
- [ ] Manual registration form includes zone field
- [ ] Guest registrations correctly left with `zone = NULL`

#### Monitoring:
- [ ] Check new registrations (last 24 hours) for NULL zones daily
- [ ] Alert if unmapped count > expected (guests only)
- [ ] Verify zone distribution stays consistent

---

### FILES CREATED DURING INCIDENT

**Working Fixes:**
- `api/admin/force-fix-zones.js` - Direct SQL update with verification ✅
- `api/admin/revert-guest-3067.js` - Revert guest to NULL zone ✅

**Failed Attempts (kept for reference):**
- `api/admin/fix-9-unmapped.js` - Wrong SQL (looked for 'None' string)
- `api/admin/fix-none-zones.js` - Same issue
- `api/admin/fix-9-ids.js` - Updates worked but invisible (Issue 3)
- `api/admin/fix-guest-3067.js` - Tried to set club_id NULL (constraint error)

**Diagnostic Scripts:**
- `check-zone-patterns.js` - Check zone format validity
- `fix-unmapped-direct.js` - API caller script

---

**Status**: Core development complete ✅  
**Ready for**: Image upload, GitHub push, backend integration, deployment  
**Repository**: https://github.com/studevkiran/SNEHA-SAURABHA-2025-26.git
