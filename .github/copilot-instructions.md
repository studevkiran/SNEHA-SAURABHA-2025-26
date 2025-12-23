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

## CRITICAL FIX - Zone Unmapped Issue (Dec 23, 2025)

### Problem Discovered
The system uses **sub-zone format** (Zone 7A, Zone 7B, Zone 8A, Zone 8B, etc.) but multiple parts of the codebase were using regex `/Zone\s+(\d+)/i` which ONLY matches simple "Zone X" format. This caused all sub-zones to be counted as "Unmapped".

### Root Cause
- Zones are stored in database as: `Zone 7A`, `Zone 7B`, `Zone 8A`, `Zone 8B` (with letter suffix)
- Old regex pattern: `/Zone\s+(\d+)/i` - only matches "Zone 1", "Zone 2" etc
- This caused 800+ registrations to show as "Unmapped" even though they had valid zones

### Solution Applied
Changed ALL zone regex patterns from:
```javascript
/Zone\s+(\d+)/i  // ❌ WRONG - doesn't match Zone 7A
```
To:
```javascript
/Zone\s+(\d+)[A-Z]?/i  // ✅ CORRECT - matches both Zone 7 AND Zone 7A
```

### Files Fixed (Dec 23, 2025)
1. ✅ `api/stats/zones.js` - Stats API (line 59)
2. ✅ `public/admin/tally.html` - Tally dashboard zone breakdown (line 1192)
3. ✅ `public/admin/index.html` - Admin index (multiple locations)
4. ✅ `admin/tally.html` - Backup tally page (line 1191, 1242)
5. ✅ `check-unmapped-now.js` - Unmapped check script

### SQL Query Pattern (for fix-unmapped APIs)
When checking for unmapped zones in SQL, use:
```sql
WHERE zone NOT SIMILAR TO 'Zone [0-9]+[A-Z]?'
-- NOT: WHERE zone NOT LIKE 'Zone%'
```

### If This Issue Appears Again
1. Search codebase for: `/Zone\s+\(\\d+\)/i` (without `[A-Z]?`)
2. Replace with: `/Zone\s+(\d+)[A-Z]?/i`
3. Check both frontend (HTML files) and backend (API files)
4. Test with `curl "https://www.sneha2026.in/api/stats/zones?fresh=1"`
5. Hard refresh browser (Cmd+Shift+R) to clear cache

### Prevention
- All zone regex patterns MUST use: `/Zone\s+(\d+)[A-Z]?/i`
- SQL queries must use: `SIMILAR TO 'Zone [0-9]+[A-Z]?'`
- Always test with both simple zones (Zone 1) and sub-zones (Zone 7A)

---

**Status**: Core development complete ✅  
**Ready for**: Image upload, GitHub push, backend integration, deployment  
**Repository**: https://github.com/studevkiran/SNEHA-SAURABHA-2025-26.git
