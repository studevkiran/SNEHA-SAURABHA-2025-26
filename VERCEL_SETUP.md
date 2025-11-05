# 🚀 Vercel Deployment & Database Setup Guide

## 📋 What We're Setting Up

1. **Vercel Postgres Database** - Free tier (256MB storage)
2. **PhonePe Payment Gateway** - Production ready
3. **Real-time Admin Dashboard** - Live updates for 2000+ attendees
4. **Excel Export** - Download all registrations
5. **Backend API on Vercel Serverless Functions**

---

## 🗄️ STEP 1: Create Vercel Postgres Database

### **1.1 Create Vercel Account & Project**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy project (first time)
cd /Users/kiran/Desktop/SNEHA-SAURABHA-2025-26
vercel
```

### **1.2 Add Postgres Database**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: `SNEHA-SAURABHA-2025-26`
3. Click **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose **Free Plan** (256MB)
7. Name: `sneha-saurabha-db`
8. Region: Choose closest to India (Singapore/Mumbai)
9. Click **Create**

### **1.3 Database Schema**

The database will have these tables:

```sql
-- Registrations Table
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    confirmation_id VARCHAR(20) UNIQUE NOT NULL,
    registration_type VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    club_name VARCHAR(100) NOT NULL,
    meal_preference VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_date TIMESTAMP,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attended BOOLEAN DEFAULT FALSE,
    check_in_time TIMESTAMP,
    manually_added BOOLEAN DEFAULT FALSE,
    qr_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_confirmation_id ON registrations(confirmation_id);
CREATE INDEX idx_mobile ON registrations(mobile);
CREATE INDEX idx_email ON registrations(email);
CREATE INDEX idx_payment_status ON registrations(payment_status);
CREATE INDEX idx_registration_type ON registrations(registration_type);
CREATE INDEX idx_registration_date ON registrations(registration_date DESC);
```

---

## 💳 STEP 2: PhonePe Payment Gateway Setup

### **2.1 Get PhonePe Credentials**
1. Visit [PhonePe Business](https://business.phonepe.com/)
2. Sign up for merchant account
3. Get credentials:
   - **Merchant ID**
   - **Salt Key**
   - **Salt Index**
   - **API Endpoint** (UAT for testing, Production for live)

### **2.2 PhonePe Test Credentials** (for development)
```
UAT URL: https://api-preprod.phonepe.com/apis/pg-sandbox
Merchant ID: (will be provided by PhonePe)
Salt Key: (will be provided by PhonePe)
Salt Index: 1
```

### **2.3 Environment Variables**

Add these to Vercel:
1. Go to Project → Settings → Environment Variables
2. Add:

```env
# Database (auto-added by Vercel when you create Postgres)
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
POSTGRES_USER="default"
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="verceldb"

# PhonePe Payment Gateway
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_SALT_KEY=your_salt_key
PHONEPE_SALT_INDEX=1
PHONEPE_API_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
PHONEPE_REDIRECT_URL=https://your-domain.vercel.app/payment-callback.html
PHONEPE_CALLBACK_URL=https://your-domain.vercel.app/api/phonepe/webhook

# Application
NODE_ENV=production
FRONTEND_URL=https://your-domain.vercel.app
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_this_password_123
```

---

## 📁 STEP 3: Project Structure for Vercel

```
SNEHA-SAURABHA-2025-26/
├── api/                          # Vercel Serverless Functions
│   ├── registrations/
│   │   ├── create.js            # Create new registration
│   │   ├── list.js              # Get all registrations
│   │   ├── [id].js              # Get/Update/Delete registration
│   │   └── stats.js             # Dashboard statistics
│   ├── phonepe/
│   │   ├── initiate.js          # Start payment
│   │   ├── verify.js            # Verify payment status
│   │   └── webhook.js           # PhonePe callback
│   ├── attendance/
│   │   ├── checkin.js           # Mark attendance
│   │   └── stats.js             # Attendance statistics
│   └── export/
│       └── excel.js             # Export to Excel
├── public/                       # Static files
│   ├── index.html
│   ├── admin/
│   │   └── index.html
│   ├── styles/
│   ├── scripts/
│   └── ...
├── lib/                          # Utility functions
│   ├── db.js                    # Database connection
│   ├── phonepe.js               # PhonePe utilities
│   └── auth.js                  # Admin authentication
├── vercel.json                   # Vercel configuration
├── package.json
└── README.md
```

---

## 🔧 STEP 4: Quick Setup Commands

```bash
# 1. Install dependencies
npm install @vercel/postgres
npm install crypto-js
npm install axios
npm install exceljs

# 2. Initialize Vercel project
vercel

# 3. Link to Vercel project
vercel link

# 4. Pull environment variables (after setting up in dashboard)
vercel env pull

# 5. Deploy to production
vercel --prod
```

---

## 📊 STEP 5: Admin Dashboard Features

### **Real-time Features:**
- ✅ Live registration count
- ✅ Real-time revenue tracking
- ✅ Payment status updates
- ✅ Meal preference breakdown
- ✅ Club-wise statistics
- ✅ Search & Filter (by name, mobile, email, type)
- ✅ Manual registration entry
- ✅ Edit registration details
- ✅ QR code check-in scanner
- ✅ Attendance tracking
- ✅ Excel export (all data)

### **Performance for 2000+ Attendees:**
- Database indexes for fast queries
- Pagination (50 records per page)
- Real-time updates using polling (every 5 seconds)
- Optimized SQL queries
- Caching for statistics

---

## 🚀 STEP 6: Deployment Checklist

### **Before Going Live:**
- [ ] Vercel Postgres database created
- [ ] Database schema executed
- [ ] PhonePe merchant account approved
- [ ] Environment variables configured
- [ ] Custom domain connected (optional)
- [ ] SSL certificate enabled (automatic on Vercel)
- [ ] Test registration with PhonePe
- [ ] Admin dashboard tested
- [ ] Excel export tested
- [ ] QR code scanner tested
- [ ] Test with 100+ sample records

### **Go Live:**
```bash
# Deploy to production
vercel --prod

# Your site will be live at:
# https://sneha-saurabha-2025-26.vercel.app
```

---

## 🎯 Why Vercel + Postgres?

### **Advantages:**
✅ **Free Tier**: 256MB database, 100GB bandwidth
✅ **Serverless**: Auto-scaling for high traffic
✅ **Global CDN**: Fast loading worldwide
✅ **Zero Config**: Deploy in seconds
✅ **Real-time**: Sub-second database queries
✅ **Automatic HTTPS**: Secure by default
✅ **Easy Backups**: One-click database snapshots
✅ **Developer Friendly**: Hot reload, logs, analytics

### **Perfect for Your Event:**
- Handles 2000+ attendees easily
- Real-time dashboard updates
- Fast payment processing
- Reliable uptime (99.99%)
- No server management needed

---

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
- **PhonePe API**: https://developer.phonepe.com/
- **This Project**: https://github.com/studevkiran/SNEHA-SAURABHA-2025-26

---

## 🔄 Next Steps

1. I'll create the Vercel configuration files
2. Set up database connection
3. Create PhonePe payment integration
4. Build real-time admin dashboard
5. Add Excel export functionality
6. Test everything locally
7. Deploy to Vercel

**Ready to proceed? Let me know and I'll start creating all the files!** 🚀
