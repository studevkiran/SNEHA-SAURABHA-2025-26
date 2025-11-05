# 🚀 VERCEL DEPLOYMENT GUIDE - Browser Instructions

**Complete step-by-step guide to deploy SNEHA-SAURABHA 2025-26 to Vercel with Postgres database**

---

## 📋 **PREREQUISITES CHECKLIST**

Before starting, ensure you have:
- ✅ GitHub repository with all code pushed
- ✅ Vercel account (free tier is enough) - https://vercel.com
- ✅ PhonePe Merchant account credentials (or test credentials for UAT)
- ✅ Admin username and password decided

---

## 🎯 **PART 1: PUSH TO GITHUB** (5 minutes)

### Step 1: Commit and Push
Open your terminal and run:

```bash
cd /Users/kiran/Desktop/SNEHA-SAURABHA-2025-26

# Add all files
git add .

# Commit with message
git commit -m "Production ready: Vercel serverless API + PhonePe + Postgres"

# Push to GitHub
git push origin main
```

✅ **Verify**: Go to https://github.com/studevkiran/SNEHA-SAURABHA-2025-26 and confirm all files are uploaded

---

## 🌐 **PART 2: DEPLOY TO VERCEL** (10 minutes)

### Step 1: Import GitHub Repository

1. **Go to Vercel Dashboard**: https://vercel.com/new
2. **Click "Add New..." → Project**
3. **Import Git Repository**:
   - Select GitHub
   - Search for `SNEHA-SAURABHA-2025-26`
   - Click **Import**

### Step 2: Configure Project

4. **Project Settings**:
   - **Framework Preset**: Other (leave as is)
   - **Root Directory**: `./` (default)
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

5. **Click "Deploy"**

⏱️ Wait 2-3 minutes for deployment to complete

✅ **You'll get a URL like**: `https://sneha-saurabha-2025-26.vercel.app`

---

## 🗄️ **PART 3: CREATE POSTGRES DATABASE** (5 minutes)

### Step 1: Add Database to Project

1. In Vercel Dashboard, **click on your project** name
2. Click **"Storage"** tab at the top
3. Click **"Create Database"**
4. Select **"Postgres"** (Powered by Neon)
5. Click **"Continue"**
6. **Database Name**: `sneha_saurabha_db` (or auto-generated)
7. **Region**: Choose **Washington, D.C., USA (iad1)** (closest to India with good performance)
8. Click **"Create"**

⏱️ Wait 1-2 minutes for database creation

### Step 2: Connect Database

9. Database will **auto-connect** to your project
10. You'll see a success message
11. **Environment variables** are automatically added:
    - `POSTGRES_URL`
    - `POSTGRES_PRISMA_URL`
    - `POSTGRES_URL_NON_POOLING`
    - `POSTGRES_USER`
    - `POSTGRES_HOST`
    - `POSTGRES_PASSWORD`
    - `POSTGRES_DATABASE`

✅ **Verification**: Go to **Settings → Environment Variables** and confirm these variables exist

---

## 📊 **PART 4: INITIALIZE DATABASE SCHEMA** (5 minutes)

### Step 1: Access SQL Query Console

1. In **Storage** tab, click on your Postgres database
2. Click **"Query"** or **"Data"** tab
3. Click **"Query"** button to open SQL console

### Step 2: Run Table Creation Script

Copy and paste this entire SQL script:

```sql
-- Create registrations table with all columns
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  confirmation_id VARCHAR(50) UNIQUE NOT NULL,
  registration_type VARCHAR(50) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  email VARCHAR(200),
  club_name VARCHAR(200),
  meal_preference VARCHAR(20) DEFAULT 'Veg',
  amount DECIMAL(10, 2) NOT NULL,
  transaction_id VARCHAR(100),
  upi_id VARCHAR(100),
  payment_status VARCHAR(20) DEFAULT 'pending',
  gateway_response TEXT,
  attended BOOLEAN DEFAULT false,
  check_in_time TIMESTAMP,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  manually_added BOOLEAN DEFAULT false,
  qr_data TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_confirmation_id ON registrations(confirmation_id);
CREATE INDEX IF NOT EXISTS idx_mobile ON registrations(mobile);
CREATE INDEX IF NOT EXISTS idx_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registration_type ON registrations(registration_type);
CREATE INDEX IF NOT EXISTS idx_registration_date ON registrations(registration_date DESC);

-- Verify table created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'registrations';
```

4. Click **"Run Query"** or **"Execute"**
5. You should see: **"Table created successfully"** or similar message

✅ **Verification**: Run this query to confirm:
```sql
SELECT COUNT(*) FROM registrations;
```
Should return `0` (empty table)

---

## 🔐 **PART 5: ADD ENVIRONMENT VARIABLES** (10 minutes)

### Step 1: Go to Environment Variables

1. In your Vercel project, click **"Settings"**
2. Click **"Environment Variables"** in left sidebar

### Step 2: Add PhonePe Variables

Add these **one by one** (click "Add" for each):

#### **PhonePe Configuration**:

| Name | Value | Environment |
|------|-------|-------------|
| `PHONEPE_MERCHANT_ID` | `your_merchant_id` | Production, Preview, Development |
| `PHONEPE_SALT_KEY` | `your_salt_key` | Production, Preview, Development |
| `PHONEPE_SALT_INDEX` | `1` | Production, Preview, Development |
| `PHONEPE_API_URL` | `https://api-preprod.phonepe.com/apis/pg-sandbox` | Production, Preview, Development |

**For Testing**: Use PhonePe UAT credentials
**For Production**: Replace with live credentials after approval

#### **PhonePe Callback URLs**:

| Name | Value | Environment |
|------|-------|-------------|
| `PHONEPE_REDIRECT_URL` | `https://your-project.vercel.app/payment-callback.html` | Production |
| `PHONEPE_CALLBACK_URL` | `https://your-project.vercel.app/api/phonepe/webhook` | Production |

⚠️ **Replace `your-project.vercel.app`** with your actual Vercel URL!

#### **Admin Credentials**:

| Name | Value | Environment |
|------|-------|-------------|
| `ADMIN_USERNAME` | `admin` | Production, Preview, Development |
| `ADMIN_PASSWORD` | `YourSecurePassword123!` | Production, Preview, Development |

⚠️ **Use a strong password!** Don't use "admin123"

### Step 3: Save and Redeploy

3. After adding all variables, Vercel will ask to **"Redeploy"**
4. Click **"Redeploy"** to apply environment variables

⏱️ Wait 2-3 minutes for redeployment

---

## ✅ **PART 6: VERIFY DEPLOYMENT** (5 minutes)

### Step 1: Test Homepage

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. **Should see**: SNEHA-SAURABHA homepage with registration form
3. **Check**: Event details, registration types, forms load correctly

### Step 2: Test API Endpoints

Open browser console (F12) and run these tests:

#### Test 1: Registration Stats API
```javascript
fetch('https://your-project.vercel.app/api/registrations/stats')
  .then(r => r.json())
  .then(data => console.log('✅ Stats API:', data))
  .catch(e => console.error('❌ Error:', e));
```

**Expected Result**: 
```json
{
  "success": true,
  "total": 0,
  "paid": 0,
  "pending": 0,
  "revenue": 0,
  "byType": [],
  "byMeal": []
}
```

#### Test 2: Admin Login
```javascript
fetch('https://your-project.vercel.app/api/admin/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'admin', password: 'YourSecurePassword123!'})
})
  .then(r => r.json())
  .then(data => console.log('✅ Login API:', data))
  .catch(e => console.error('❌ Error:', e));
```

**Note**: This endpoint needs to be created (see next section)

### Step 3: Test Database Connection

1. Go to Vercel project → **Storage** → Your Postgres database
2. Click **"Query"** tab
3. Run: `SELECT * FROM registrations;`
4. Should return empty result (0 rows)

✅ **All tests pass?** → Your backend is ready!

---

## 🎨 **PART 7: CUSTOM DOMAIN (OPTIONAL)** (10 minutes)

### Add Your Own Domain

1. In Vercel project, click **"Settings"**
2. Click **"Domains"**
3. Click **"Add"**
4. Enter your domain: `snehasaurabha.com` (example)
5. Follow DNS configuration instructions
6. Wait for DNS propagation (5-30 minutes)

✅ **Benefits**: Professional URL, better for PhonePe approval

---

## 📱 **PART 8: PHONEPE APPROVAL** (After deployment)

### Submit to PhonePe for Approval

1. **Login to PhonePe Merchant Dashboard**
2. **Navigate to**: Settings → Website Details
3. **Add Your URLs**:
   - Website URL: `https://your-project.vercel.app`
   - Callback URL: `https://your-project.vercel.app/api/phonepe/webhook`
   - Redirect URL: `https://your-project.vercel.app/payment-callback.html`
4. **Submit for Approval**
5. **Wait for PhonePe team** to verify (1-3 business days)

### What PhonePe Will Check:
- ✅ Website is live and accessible
- ✅ Registration form works
- ✅ Payment flow is integrated
- ✅ SSL certificate (automatic with Vercel)
- ✅ Business details match merchant account

---

## 🔧 **TROUBLESHOOTING**

### Issue 1: API Returns 500 Error
- **Check**: Environment variables are set correctly
- **Check**: Database connection in Storage tab
- **Check**: Function logs in Vercel → Functions tab

### Issue 2: Database Connection Failed
- **Solution**: Redeploy project (Settings → Deployments → ... → Redeploy)
- **Check**: POSTGRES_URL variable exists

### Issue 3: Payment Initiation Fails
- **Check**: PhonePe credentials are correct (MERCHANT_ID, SALT_KEY)
- **Check**: API_URL is correct (UAT vs Production)
- **Check**: Callback URLs match your domain

### Issue 4: CORS Errors
- **Already fixed**: All API endpoints have CORS headers
- **If persists**: Check browser console for actual error

---

## 📞 **SUPPORT & MONITORING**

### View Logs
1. Vercel Dashboard → Your Project
2. Click **"Functions"** tab
3. Click on any function to see logs
4. Use filters to find errors

### Monitor Database
1. Vercel Dashboard → Storage → Postgres
2. Click **"Insights"** for query performance
3. Click **"Usage"** for storage limits (256MB free)

### Real-time Errors
- Enable **Vercel Speed Insights** (free)
- Enable **Vercel Analytics** (free)
- Add error tracking: Sentry integration (optional)

---

## 🎉 **SUCCESS CHECKLIST**

Before going live, verify:

- [ ] ✅ GitHub repository updated with all code
- [ ] ✅ Vercel deployment successful (green status)
- [ ] ✅ Postgres database created and connected
- [ ] ✅ Database schema initialized (registrations table exists)
- [ ] ✅ All environment variables added (PhonePe, Admin, Postgres)
- [ ] ✅ API endpoints responding (test with browser console)
- [ ] ✅ Homepage loads correctly
- [ ] ✅ Registration form works
- [ ] ✅ Admin dashboard accessible
- [ ] ✅ Custom domain configured (optional but recommended)
- [ ] ✅ PhonePe approval submitted
- [ ] ✅ Test payment flow with PhonePe UAT

---

## 🚀 **NEXT STEPS AFTER DEPLOYMENT**

1. **Test complete registration flow** (create test registration)
2. **Test payment with PhonePe UAT** credentials
3. **Share live URL** with PhonePe for approval
4. **Train admin users** on dashboard
5. **Prepare for launch** (social media, announcements)
6. **Monitor registrations** in real-time
7. **Switch to PhonePe production** after approval

---

## 📧 **NEED HELP?**

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
- **PhonePe Integration**: https://developer.phonepe.com/docs
- **Support**: Email Vercel support or check their Discord

---

**🎊 Congratulations! Your conference registration system is LIVE! 🎊**

Generated: November 5, 2025
