# 🤖 AI BROWSER AGENT PROMPT - Vercel Deployment

**Copy and paste this entire prompt to your AI browser agent (like Claude, GPT, or browser automation tool)**

---

## 📋 YOUR MISSION

Deploy the SNEHA-SAURABHA conference registration website to Vercel with Postgres database integration. Follow these steps EXACTLY in order.

---

## 🎯 STEP-BY-STEP INSTRUCTIONS

### **STEP 1: VERIFY GITHUB REPOSITORY**

Navigate to: `https://github.com/studevkiran/SNEHA-SAURABHA-2025-26`

**Verify these files exist:**
- ✅ `index.html` (homepage)
- ✅ `vercel.json` (Vercel configuration)
- ✅ `package.json` (dependencies)
- ✅ `/api` folder with subdirectories
- ✅ `/lib` folder with `db.js`, `phonepe.js`, `auth.js`

**If files are missing**: STOP and inform user "GitHub repository incomplete"

---

### **STEP 2: DEPLOY TO VERCEL**

1. **Navigate to**: `https://vercel.com/new`

2. **Import Repository**:
   - Click "Import Git Repository"
   - Select GitHub provider
   - Search for `SNEHA-SAURABHA-2025-26`
   - Click **Import**

3. **Configure Project**:
   - **Project Name**: `sneha-saurabha-2025-26` (or auto-generated)
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: Leave empty
   - **Install Command**: `npm install`
   - **Output Directory**: Leave empty

4. **Click "Deploy"**

5. **WAIT** for deployment to complete (status becomes "Ready")

6. **Copy the deployment URL** (format: `https://sneha-saurabha-2025-26-xxx.vercel.app`)

7. **Store URL** in a note/variable for later use

**Success criteria**: Deployment status shows green checkmark ✅

---

### **STEP 3: CREATE POSTGRES DATABASE**

1. **In Vercel Dashboard**, click on the project name

2. **Click "Storage" tab** at the top navigation

3. **Click "Create Database"**

4. **Select "Postgres"** (Powered by Neon)

5. **Click "Continue"**

6. **Database Configuration**:
   - **Database Name**: `sneha_saurabha_db` (or accept auto-generated)
   - **Region**: Select **Washington, D.C., USA (iad1)**
   - Click **"Create"**

7. **WAIT** for database creation (1-2 minutes)

8. **Confirm**: You see "Database created successfully" message

9. **Verify Auto-Connection**: Database should auto-connect to project

**Success criteria**: Database appears in Storage tab with "Connected" status

---

### **STEP 4: INITIALIZE DATABASE SCHEMA**

1. **In Storage tab**, click on the Postgres database name

2. **Click "Query" tab** or "Data" tab

3. **Click "Query" button** to open SQL console

4. **Copy and paste this EXACT SQL**:

```sql
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

CREATE INDEX IF NOT EXISTS idx_confirmation_id ON registrations(confirmation_id);
CREATE INDEX IF NOT EXISTS idx_mobile ON registrations(mobile);
CREATE INDEX IF NOT EXISTS idx_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registration_type ON registrations(registration_type);
CREATE INDEX IF NOT EXISTS idx_registration_date ON registrations(registration_date DESC);
```

5. **Click "Run Query" or "Execute"**

6. **Verify Success**: Should see "CREATE TABLE" or "Query executed successfully"

7. **Verify Table Created**: Run this query:
```sql
SELECT COUNT(*) FROM registrations;
```
   Should return: `0`

**Success criteria**: Query returns 0 (empty table exists)

---

### **STEP 5: ADD ENVIRONMENT VARIABLES**

1. **Navigate to**: Project → Settings → Environment Variables

2. **Add these variables ONE BY ONE** (click "Add" between each):

#### **Variable 1: PHONEPE_MERCHANT_ID**
- **Name**: `PHONEPE_MERCHANT_ID`
- **Value**: `PGTESTPAYUAT` (PhonePe UAT test value)
- **Environment**: Select ALL (Production, Preview, Development)
- Click **Save**

#### **Variable 2: PHONEPE_SALT_KEY**
- **Name**: `PHONEPE_SALT_KEY`
- **Value**: `099eb0cd-02cf-4e2a-8aca-3e6c6aff0399` (PhonePe UAT test value)
- **Environment**: Select ALL
- Click **Save**

#### **Variable 3: PHONEPE_SALT_INDEX**
- **Name**: `PHONEPE_SALT_INDEX`
- **Value**: `1`
- **Environment**: Select ALL
- Click **Save**

#### **Variable 4: PHONEPE_API_URL**
- **Name**: `PHONEPE_API_URL`
- **Value**: `https://api-preprod.phonepe.com/apis/pg-sandbox`
- **Environment**: Select ALL
- Click **Save**

#### **Variable 5: PHONEPE_REDIRECT_URL**
- **Name**: `PHONEPE_REDIRECT_URL`
- **Value**: `https://YOUR_VERCEL_URL/payment-callback.html`
- ⚠️ **REPLACE** `YOUR_VERCEL_URL` with actual deployment URL from Step 2
- **Environment**: Production only
- Click **Save**

#### **Variable 6: PHONEPE_CALLBACK_URL**
- **Name**: `PHONEPE_CALLBACK_URL`
- **Value**: `https://YOUR_VERCEL_URL/api/phonepe/webhook`
- ⚠️ **REPLACE** `YOUR_VERCEL_URL` with actual deployment URL from Step 2
- **Environment**: Production only
- Click **Save**

#### **Variable 7: ADMIN_USERNAME**
- **Name**: `ADMIN_USERNAME`
- **Value**: `admin`
- **Environment**: Select ALL
- Click **Save**

#### **Variable 8: ADMIN_PASSWORD**
- **Name**: `ADMIN_PASSWORD`
- **Value**: `SecurePassword2025!`
- ⚠️ **IMPORTANT**: User should change this later
- **Environment**: Select ALL
- Click **Save**

3. **After adding all variables**, click **"Redeploy"** button

4. **WAIT** for redeployment to complete (2-3 minutes)

**Success criteria**: All 8 environment variables visible in list + Postgres variables (should be ~15 total)

---

### **STEP 6: VERIFY DEPLOYMENT**

1. **Navigate to deployment URL**: `https://your-vercel-url.vercel.app`

2. **Homepage Check**:
   - ✅ Page loads without errors
   - ✅ See "SNEHA-SAURABHA" title
   - ✅ Registration form visible
   - ✅ 11 registration types displayed

3. **API Test** (open browser console F12):

**Test 1 - Registration Stats API**:
```javascript
fetch('https://YOUR_VERCEL_URL/api/registrations/stats')
  .then(r => r.json())
  .then(d => console.log('Stats API Result:', d));
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

**If you see this** → ✅ API working correctly

**If you see error** → ❌ Report exact error message to user

4. **Database Connection Test**:
   - Go back to Vercel → Storage → Postgres → Query tab
   - Run: `SELECT * FROM registrations;`
   - Should return 0 rows
   - ✅ Database connected

**Success criteria**: Homepage loads + API returns valid JSON + Database query works

---

### **STEP 7: GENERATE DEPLOYMENT REPORT**

**Create this summary for the user**:

```
🎉 DEPLOYMENT COMPLETE - SNEHA-SAURABHA 2025-26

✅ DEPLOYMENT STATUS: Success

📊 DEPLOYMENT DETAILS:
- Production URL: https://[your-actual-url].vercel.app
- Project Name: sneha-saurabha-2025-26
- Deployment Date: [current date/time]
- Region: Washington, D.C., USA (iad1)

✅ DATABASE STATUS: Connected
- Type: Vercel Postgres (Neon)
- Name: sneha_saurabha_db
- Tables: 1 (registrations)
- Indexes: 6
- Current Rows: 0

✅ API ENDPOINTS DEPLOYED (9 total):
1. POST /api/registrations/create - Registration form submission
2. GET  /api/registrations/list - Admin dashboard list
3. GET  /api/registrations/stats - Dashboard statistics
4. POST /api/phonepe/initiate - Start payment
5. GET  /api/phonepe/verify - Verify payment status
6. POST /api/phonepe/webhook - PhonePe callbacks
7. POST /api/attendance/checkin - QR code check-in
8. GET  /api/attendance/stats - Attendance statistics
9. GET  /api/export/excel - Export to Excel

✅ ENVIRONMENT VARIABLES: 15 configured
- PhonePe integration: UAT test mode (sandbox)
- Admin credentials: Set (change password immediately)
- Database: Auto-configured

⚠️ PENDING ACTIONS:
1. Change admin password in Vercel settings
2. Test complete registration flow
3. Submit website URL to PhonePe for approval
4. Get PhonePe production credentials after approval
5. Update PHONEPE_MERCHANT_ID and SALT_KEY with production values

🔗 IMPORTANT LINKS:
- Website: https://[your-url].vercel.app
- Admin Panel: https://[your-url].vercel.app/admin/
- Vercel Dashboard: https://vercel.com/[your-project]
- GitHub Repo: https://github.com/studevkiran/SNEHA-SAURABHA-2025-26

📧 PHONEPE SUBMISSION INFO:
When submitting to PhonePe for approval, provide:
- Website URL: https://[your-url].vercel.app
- Callback URL: https://[your-url].vercel.app/api/phonepe/webhook
- Redirect URL: https://[your-url].vercel.app/payment-callback.html

✅ NEXT STEPS:
1. Test registration form on live site
2. Change admin password (Settings → Environment Variables → ADMIN_PASSWORD)
3. Add custom domain (optional but recommended)
4. Submit to PhonePe merchant portal for approval
5. Monitor registrations in admin dashboard
```

---

## 🚨 ERROR HANDLING

**If deployment fails at any step**:
1. Take screenshot of error message
2. Copy exact error text
3. Report to user: "Deployment failed at [STEP NAME]: [ERROR MESSAGE]"
4. DO NOT proceed to next step

**Common issues**:
- GitHub repo not found → User needs to push code first
- Database creation fails → Try different region
- Environment variable errors → Check for typos in names
- API 500 errors → Check Vercel function logs

---

## ✅ SUCCESS CONFIRMATION

**At the end, confirm ALL these items**:
- [ ] Vercel deployment shows green "Ready" status
- [ ] Database created and connected
- [ ] 'registrations' table exists with 6 indexes
- [ ] All 15+ environment variables set
- [ ] Homepage loads at deployment URL
- [ ] API endpoint test returns valid JSON
- [ ] Database query returns 0 rows

**If ALL checked** → Report "✅ DEPLOYMENT 100% COMPLETE - READY FOR PRODUCTION"

**If ANY unchecked** → Report specific failures and STOP

---

## 📝 NOTES FOR AI AGENT

- Follow steps SEQUENTIALLY - don't skip ahead
- Wait for confirmations before proceeding
- Copy/paste SQL and environment values EXACTLY
- Replace placeholder URLs with actual deployment URL
- If any step fails, STOP and report error
- Take screenshots of success messages for verification
- Final report should include actual URLs (not placeholders)

---

**END OF PROMPT - Begin execution now**
