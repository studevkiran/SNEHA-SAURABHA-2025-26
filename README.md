# SNEHA-SAURABHA 2025-26 - Conference Registration System# Sneha Sourabha 2025-26 - Conference Registration Website



[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)A complete mobile-first conference registration website for the Rotary District Conference with Kalparuksha amber-gold theme, payment integration, WhatsApp confirmation, and admin dashboard.

[![Database](https://img.shields.io/badge/Database-Postgres-blue)](https://vercel.com/storage/postgres)

[![Payment Gateway](https://img.shields.io/badge/Payment-PhonePe-purple)](https://www.phonepe.com)## Event Details



> **Complete serverless conference registration platform with real-time database, payment gateway integration, and admin dashboard**- **Event**: Sneha Sourabha - Rotary District Conference 2025-26

- **Dates**: 30-31 January & 1 February 2026

---- **Venue**: Silent Shores, Mysore

- **Tagline**: "Join the district's grand celebration — be part of the legacy."

## 🎯 **PROJECT OVERVIEW**

## Features

**Event**: SNEHA-SAURABHA - Rotary District Conference 2025-26  

**Dates**: January 30-31 & February 1, 2026  ### Public Registration Flow

**Venue**: Silent Shores Resort, Mysore  - **Mobile-First Design**: Optimized for mobile devices with no-scroll single-screen experience

**District**: Rotary 3181  - **Bright Amber-Gold Theme**: Beautiful Kalparuksha theme with amber and gold color scheme

**Expected Attendees**: 2000+- **Smooth Flow**: Seamless transition between registration steps without page flicker

- **Multi-Step Registration**:

---  1. Home Page with Event Banner and Details

  2. Registration Type Selection (11 types with expandable details)

## ✨ **KEY FEATURES**  3. Personal Details Form with Club Selection

  4. Review Page with Full Details

### 🎨 **User Registration Flow**  5. Payment Integration (Ready for Gateway)

- ✅ Mobile-first responsive design with Kalparuksha amber-gold theme  6. Acknowledgment with PDF/Image Download

- ✅ 11 registration types (₹3,000 - ₹5,00,000)

- ✅ 91 Rotary clubs dropdown selection### Registration Types

- ✅ Meal preference selection (Veg/Non-Veg/Jain)1. **Rotarian** - ₹4,500 (Admission, Food & 1 Memento)

- ✅ PhonePe payment gateway integration2. **Rotarian with Spouse** - ₹7,500 (Admission with spouse + 2 children below 12 years, Food & 1 Memento)

- ✅ Real-time payment verification3. **Ann** - ₹3,500 (Admission & Food)

- ✅ Beautiful A4 registration ticket with QR code4. **Annet** - ₹2,000 (Admission & Food)

- ✅ PDF & Image download of tickets5. **Guest** - ₹4,500 (Admission, Food & 1 Memento)

- ✅ WhatsApp confirmation (ready for integration)6. **Silver Donor** - ₹20,000 (Admission with spouse + 2 children below 12 years, Food & 2 Mementos)

7. **Silver Sponsor** - ₹25,000 (Admission with spouse + 2 children below 12 years, Food, 1 Memento & Double Room)

### 📊 **Admin Dashboard**8. **Gold Sponsor** - ₹50,000 (Admission with spouse + 2 children below 12 years, Food, Special Memento & Double Room)

- ✅ Real-time statistics (total, paid, pending, revenue)9. **Platinum Sponsor** - ₹75,000 (Admission with spouse + 2 children below 12 years, Food, Special Memento & Premium Room)

- ✅ Paginated registration list (50 per page)10. **Patron Sponsor** - ₹1,00,000 (Admission with spouse + 2 children below 12 years, Food, Special Memento & Suite Room)

- ✅ Advanced search & filters (type, payment status, meal preference)

- ✅ Manual registration entry for walk-ins### Advanced Features

- ✅ QR code scanner for attendance tracking- **91 Rotary Clubs** loaded from JSON

- ✅ Excel export functionality- **Meal Preferences**: Veg, Non-Veg, Jain with color-coded toggles

- ✅ Edit registration details- **WhatsApp Confirmation**: Ready for API integration

- ✅ Authentication system- **Email Notifications**: Structure in place

- **PDF/Image Download**: Acknowledgment can be downloaded

### ⚡ **Technical Highlights**- **Admin Dashboard**: Full management interface

- ✅ **Serverless Architecture**: Vercel Functions (auto-scaling)

- ✅ **Database**: Vercel Postgres (real-time sync)### Admin Dashboard

- ✅ **Payment**: PhonePe Payment Gateway with webhook support- Login-protected admin panel

- ✅ **Security**: Token-based admin authentication, SQL injection protection- Overview with statistics (total registrations, revenue, payment status)

- ✅ **Performance**: Database indexes for fast queries, pagination for large datasets- Meal preference summary

- ✅ **Zero Downtime**: Global CDN, automatic HTTPS- Complete registrations table with filters

- Search functionality

---- Manual registration entry

- Edit/Update capabilities

## 🚀 **QUICK START - DEPLOYMENT**- Export as CSV/Excel/PDF

- Resend confirmations

### 📖 **Complete Deployment Guides Available**- Payment verification controls



We have **TWO comprehensive guides** for deployment:## Technology Stack



1. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Step-by-step manual instructions- Pure HTML5

2. **[AI_AGENT_PROMPT.md](./AI_AGENT_PROMPT.md)** - Copy-paste prompt for AI browser agents- CSS3 with modern features (CSS Grid, Flexbox, CSS Variables)

- Vanilla JavaScript (ES6+)

### 🤖 **Option 1: AI Browser Agent Deployment (Recommended)**- No external dependencies for core functionality

- Ready for backend API integration

**Perfect for automated deployment with AI assistants!**

## Project Structure

1. **Push code to GitHub** (see commands below)

2. **Copy the entire content** from [`AI_AGENT_PROMPT.md`](./AI_AGENT_PROMPT.md)```

3. **Paste into your AI browser agent** (Claude, GPT, or browser automation tool)├── index.html                  # Main registration page

4. **Let AI handle**: Vercel deployment, database setup, environment variables├── admin/

5. **Get deployment report** with all URLs and credentials│   └── index.html             # Admin dashboard

├── data/

### 👤 **Option 2: Manual Deployment**│   └── clubs.json             # 91 Rotary clubs data

├── docs/

Follow the detailed instructions in [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) for:│   └── API_STRUCTURE.md       # Complete API documentation

- GitHub repository setup├── images/

- Vercel project configuration│   ├── header-left.jpg        # Left header image (upload required)

- Postgres database creation│   └── header-right.jpg       # Right header image (upload required)

- Environment variables setup├── scripts/

- Testing and verification│   ├── app.js                 # Main application logic

│   └── admin.js               # Admin dashboard logic

---├── styles/

│   ├── main.css               # Main styles with Kalparuksha theme

## 📋 **PUSH TO GITHUB** (Do this first!)│   └── admin.css              # Admin dashboard styles

└── README.md                  # This file

Run these commands in your terminal:```



```bash## Getting Started

cd /Users/kiran/Desktop/SNEHA-SAURABHA-2025-26

### 1. Open the Website

# Add all files

git add .**Option A: Direct File**

- Open `index.html` in a web browser

# Commit with message- For best experience, use browser DevTools mobile view

git commit -m "Production ready: Vercel serverless API + PhonePe + Postgres integration"

**Option B: Live Server (Recommended)**

# Push to GitHub1. Install Live Server extension in VS Code

git push origin main2. Right-click on `index.html`

```3. Select "Open with Live Server"



✅ **Verify**: Visit https://github.com/studevkiran/SNEHA-SAURABHA-2025-26 and confirm all files uploaded**Option C: Python HTTP Server**

```bash

---python3 -m http.server 8000

```

## 🗄️ **DATABASE SCHEMA**Then open `http://localhost:8000`



### Registrations Table (18 columns)### 2. Upload Event Images

```sql

- id (Primary Key)Place your event banner images in the `images/` folder:

- confirmation_id (Unique)- `images/header-left.jpg` - Left header image (Rotary logo recommended)

- registration_type- `images/header-right.jpg` - Right header image (Event branding)

- full_name, mobile, email

- club_name### 3. Access Admin Dashboard

- meal_preference

- amount- URL: `admin/index.html` or `http://localhost:8000/admin`

- transaction_id, upi_id- **Default Credentials** (change in production):

- payment_status (pending/completed/failed)  - Username: `admin`

- gateway_response (JSON)  - Password: `admin123`

- attended (boolean)

- check_in_time (timestamp)## Configuration

- registration_date, updated_at (auto)

- manually_added (boolean)### Updating Registration Prices

- qr_data (text)

```Edit `scripts/app.js` and modify the `registrationTypes` object:



**Indexes**: 6 optimized indexes for fast queries  ```javascript

**Capacity**: Supports 2000+ records efficientlyconst registrationTypes = {

    'rotarian': {

---        name: 'Rotarian',

        price: 7500,

## 🔌 **API ENDPOINTS (9 Total)**        description: 'Full conference access for Rotarian members',

        inclusions: ['...']

### Public Endpoints    },

| Method | Endpoint | Purpose |    // ... other types

|--------|----------|---------|};

| POST | `/api/registrations/create` | Create new registration |```

| POST | `/api/phonepe/initiate` | Start payment transaction |

| GET | `/api/phonepe/verify` | Verify payment status |### Adding/Removing Clubs

| POST | `/api/phonepe/webhook` | PhonePe callback handler |

Edit `data/clubs.json`:

### Admin Endpoints (Authentication Required)

| Method | Endpoint | Purpose |```json

|--------|----------|---------|[

| GET | `/api/registrations/list` | Paginated list with filters |  "Club Name 1",

| GET | `/api/registrations/stats` | Dashboard statistics |  "Club Name 2",

| POST | `/api/attendance/checkin` | QR code check-in |  ...

| GET | `/api/attendance/stats` | Attendance analytics |]

| GET | `/api/export/excel` | Export to Excel |```



---### Theme Colors



## 💳 **REGISTRATION TYPES & PRICING**Modify CSS variables in `styles/main.css`:



| Type | Price (₹) | Inclusions |```css

|------|-----------|------------|:root {

| Rotarian | 7,500 | Admission, Food, 1 Memento |    --primary-gold: #D4AF37;

| Rotarian with Spouse | 14,000 | Admission (spouse + 2 kids), Food, 1 Memento |    --dark-gold: #B8960C;

| Ann | 7,500 | Admission, Food |    --light-gold: #F4E4C1;

| Annet | 7,500 | Admission, Food |    --amber: #FFBF00;

| Guest | 5,000 | Admission, Food, 1 Memento |    --cream: #FFF8DC;

| Rotaractor | 3,000 | Admission, Food |    /* ... */

| Silver Donor | 25,000 | Admission (family), Food, 2 Mementos |}

| Silver Sponsor | 50,000 | All above + Double Room |```

| Gold Sponsor | 1,00,000 | All above + Special Memento |

| Platinum Sponsor | 2,00,000 | All above + Premium Room |## Backend Integration

| Patron Sponsor | 5,00,000 | All above + Suite Room |

This project is **frontend-ready** and designed for easy backend integration.

---

### API Structure

## 📁 **PROJECT STRUCTURE**

See detailed API documentation in `docs/API_STRUCTURE.md` including:

```- Registration endpoints

📦 SNEHA-SAURABHA-2025-26/- Payment gateway integration

├── 📄 index.html                     # Main registration page- WhatsApp API integration

├── 📄 payment-callback.html          # Payment success page- Email service integration

├── 📄 vercel.json                    # Vercel config- Admin authentication

├── 📄 package.json                   # Dependencies- Database schema

│- Security considerations

├── 📁 api/                           # Serverless functions (9 endpoints)

│   ├── registrations/ (create, list, stats)### Environment Variables Required

│   ├── phonepe/ (initiate, verify, webhook)

│   ├── attendance/ (checkin, stats)For production deployment (Vercel, AWS, etc.):

│   └── export/ (excel)

│```env

├── 📁 lib/                           # UtilitiesDATABASE_URL=your_database_connection

│   ├── db.js                         # Database operationsPAYMENT_API_KEY=your_payment_gateway_key

│   ├── phonepe.js                    # Payment serviceWHATSAPP_API_KEY=your_whatsapp_api_key

│   └── auth.js                       # AuthenticationEMAIL_API_KEY=your_email_service_key

│ADMIN_SECRET_KEY=your_admin_secret

├── 📁 scripts/```

│   ├── app.js                        # Frontend logic

│   └── admin.js                      # Admin dashboard### Payment Gateway Integration

│

├── 📁 styles/Supports:

│   ├── main.css                      # Main theme- Razorpay (recommended for India)

│   └── admin.css                     # Admin styles- Stripe

│- PayU

├── 📁 data/- Instamojo

│   └── clubs.json                    # 91 Rotary clubs

│Add API keys via environment variables - no hardcoded secrets in code.

└── 📁 docs/

    ├── DEPLOYMENT_GUIDE.md           # Manual deployment### WhatsApp Confirmation

    ├── AI_AGENT_PROMPT.md            # AI deployment

    ├── API_STRUCTURE.md              # API docsReady for integration with:

    └── PHONEPE_INTEGRATION.md        # Payment guide- Twilio

```- MessageBird

- Official WhatsApp Business API

---

Template message structure provided in API documentation.

## 🛠️ **TECHNOLOGY STACK**

## Features in Detail

### Frontend

- HTML5, CSS3 (Grid, Flexbox, Variables)### Mobile Optimization

- JavaScript (ES6+) - Vanilla JS- Fixed viewport to prevent scrolling and flickering

- Mobile-First Responsive Design- Dynamic viewport height (dvh) support

- Touch-optimized interactions

### Backend (Serverless)- Prevents pull-to-refresh and double-tap zoom

- Vercel Functions (Node.js 18+)- Landscape mode support

- @vercel/postgres - Database client- Responsive design for all screen sizes

- crypto-js - SHA256 hashing

- axios - HTTP requests### Registration Type Selection

- exceljs - Excel generation- Click to expand card with full details

- qrcode - QR code generation- Shows price and complete inclusions

- Real-time selection updates

### Infrastructure- Smooth expand/collapse animation

- **Hosting**: Vercel (Serverless, CDN, HTTPS)

- **Database**: Vercel Postgres (Neon)### Form Validation

- **Payment**: PhonePe Payment Gateway- Real-time validation

- 10-digit mobile number validation

---- Email format validation

- Required field checking

## 🔐 **ENVIRONMENT VARIABLES**- Visual feedback (green/red borders)



After deployment, add these in Vercel Dashboard:### Meal Preference

- Color-coded toggle buttons:

```env  - 🌱 Veg (Green)

# PhonePe (UAT for testing)  - 🍗 Non-Veg (Red)

PHONEPE_MERCHANT_ID=PGTESTPAYUAT  - 🍃 Jain (Orange)

PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399- Single selection only

PHONEPE_SALT_INDEX=1- Visual selection feedback

PHONEPE_API_URL=https://api-preprod.phonepe.com/apis/pg-sandbox

PHONEPE_REDIRECT_URL=https://your-url.vercel.app/payment-callback.html### Review Screen

PHONEPE_CALLBACK_URL=https://your-url.vercel.app/api/phonepe/webhook- Complete registration summary

- Editable (back navigation)

# Admin Credentials- Shows all selected options

ADMIN_USERNAME=admin- Price breakdown

ADMIN_PASSWORD=YourSecurePassword123!

```### Acknowledgment

- Confirmation ID generation

⚠️ **Database variables** are auto-configured by Vercel- Transaction details display

- Download as PDF (ready for jsPDF)

---- Download as Image (ready for html2canvas)

- WhatsApp confirmation note

## 👨‍💻 **ADMIN ACCESS**

### Admin Dashboard

**URL**: `https://your-domain.vercel.app/admin/`  - Secure login system

**Credentials**: Set in environment variables- Real-time statistics

- Filterable data table

⚠️ **Change default password immediately after deployment!**- Search across all fields

- Export functionality

---- Manual entry for walk-ins

- Edit existing registrations

## 📊 **CAPACITY (Vercel Free Tier)**- Resend confirmations

- Payment verification

### Limits

- **Bandwidth**: 100GB/month## Production Deployment

- **Functions**: 100GB-Hrs compute time

- **Database**: 256MB storage (~10,000+ records)### Vercel Deployment



### Expected Usage (2000 attendees)1. Install Vercel CLI:

- **Storage**: ~50MB ✅```bash

- **Bandwidth**: ~10GB ✅npm install -g vercel

- **Functions**: ~5GB-Hrs ✅```



**✅ Free tier is more than sufficient!**2. Link project:

```bash

---vercel link

```

## 📞 **SUPPORT**

3. Add environment variables:

**WhatsApp**: 9980557785  ```bash

**GitHub**: https://github.com/studevkiran/SNEHA-SAURABHA-2025-26  vercel env add DATABASE_URL

**Issues**: https://github.com/studevkiran/SNEHA-SAURABHA-2025-26/issuesvercel env add PAYMENT_API_KEY

# ... add all required env variables

---```



## 🎉 **DEPLOYMENT CHECKLIST**4. Deploy:

```bash

Before deploying:vercel --prod

- [ ] Review registration types and pricing```

- [ ] Add event header images (optional)

- [ ] Update WhatsApp contact number### Alternative Platforms

- [ ] Push code to GitHub- **Netlify**: Drag and drop deployment

- **AWS S3 + CloudFront**: Static hosting

After deploying:- **Firebase Hosting**: Free tier available

- [ ] Test registration flow- **GitHub Pages**: For static frontend only

- [ ] Test payment with PhonePe UAT

- [ ] Change admin password## Security Considerations

- [ ] Submit to PhonePe for approval

- [ ] Train admin users1. **Never commit secrets** - Use environment variables

2. **Input validation** - All user inputs validated

---3. **SQL injection prevention** - Use prepared statements in backend

4. **XSS protection** - Sanitize all outputs

**🔥 Ready for Production - Deploy in 15 Minutes! 🔥**5. **HTTPS only** - Force secure connections

6. **Payment security** - Verify all webhooks

**📖 Full Guides**:7. **Admin authentication** - Strong passwords, JWT tokens

- Manual: [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)8. **Rate limiting** - Prevent abuse

- AI Agent: [`AI_AGENT_PROMPT.md`](./AI_AGENT_PROMPT.md)9. **Audit logs** - Track all admin actions

10. **Data backup** - Regular automated backups

---

## Libraries for Production

Last Updated: November 5, 2025  

Rotary District 3181 - SNEHA-SAURABHA 2025-26### PDF Generation

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

### Image Export
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

### Excel Export (Admin)
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
```

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Safari (iOS 12+)
- ✅ Firefox (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile, Samsung Internet)

## Future Enhancements

- [ ] Real-time seat availability
- [ ] Group registration management
- [ ] QR code generation for entry
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Offline mode with service workers
- [ ] Progressive Web App (PWA)
- [ ] Payment installments
- [ ] Referral tracking
- [ ] Analytics dashboard

## Support

For technical support or questions:
- Check `docs/API_STRUCTURE.md` for backend implementation
- Review code comments for detailed explanations
- Test all features in mobile view for best experience

## License

MIT License - Free to use for your events!

## Credits

**Event**: Sneha Sourabha 2025-26 - Rotary District Conference  
**Theme**: Kalparuksha Amber-Gold Theme  
**Built**: October 28, 2025  
**Repository**: https://github.com/studevkiran/SNEHA-SAURABHA-2025-26.git

---

**Ready to deploy!** Add your images, configure environment variables, and push to production.
# Zone integration deployed Fri Dec  5 23:38:56 IST 2025
