# 🚨 DATABASE CREDENTIAL ROTATION REQUIRED

## Issue
GitGuardian detected exposed PostgreSQL URI in GitHub repository:
- **Date**: November 16, 2025
- **Repository**: studevkiran/SNEHA-SAURABHA-2025-26
- **Risk**: Database password was exposed in git history

## Immediate Action Required

### Step 1: Reset Neon Database Password

1. **Go to Neon Console**: https://console.neon.tech/
2. **Select your project**: `neondb`
3. **Go to Settings** → **Reset Password**
4. **Generate new password** (Neon will provide a new connection string)

### Step 2: Update Environment Variables in Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select project**: SNEHA-SAURABHA-2025-26
3. **Settings** → **Environment Variables**
4. **Update `DATABASE_URL`** with new connection string from Step 1
5. **Select all environments**: Production, Preview, Development
6. **Save**
7. **Redeploy**: Deployments → Click latest → Redeploy

### Step 3: Update Local .env File

**Do NOT commit this file to git!**

Create/update `.env` in project root:
```bash
DATABASE_URL=postgresql://neondb_owner:NEW_PASSWORD@ep-polished-cloud-a1ohtpqm-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### Step 4: Clean Git History (Advanced)

The old password is still in git history. To completely remove it:

```bash
# Install BFG Repo Cleaner
brew install bfg

# Create a backup first!
cd /Users/kiran/Desktop
cp -r SNEHA-SAURABHA-2025-26 SNEHA-SAURABHA-BACKUP

# Remove sensitive data from history
cd SNEHA-SAURABHA-2025-26
git filter-repo --invert-paths --path database/check-mysore-metro.js

# Force push (WARNING: This rewrites history)
git push origin --force --all
```

**OR** Simpler approach: Delete and recreate repository (if team is small)

### Step 5: Verify Everything Works

1. Visit: https://sneha2026.in/admin/tally.html
2. Click "🔄 Refresh Full Data"
3. Verify data loads (should show 688 registrations)
4. Test a registration to ensure database writes work

## Prevention for Future

### Add .gitignore entries (already done):
```
.env
.env.local
.env.production
*.backup
```

### Use environment variables ONLY:
```javascript
// ✅ CORRECT
const connectionString = process.env.DATABASE_URL;

// ❌ WRONG - Never hardcode
const connectionString = 'postgresql://user:pass@host/db';
```

### Security Checklist:
- [x] New database password set
- [x] Vercel environment variables updated (all 8 variables)
- [x] Local .env file created (not committed)
- [x] Site tested and working (688 registrations loading)
- [x] Old password invalidated
- [ ] Git history cleaned (optional but recommended)
- [ ] GitGuardian alert resolved (mark as resolved manually)

## Current Status

**Old exposed password**: `npg_ia0btBznoh7s`  
**Status**: ✅ ROTATED & INVALIDATED - No longer valid  

**New password**: `npg_NuxOHm60aXTi`  
**Status**: ✅ DEPLOYED - Active in production  
**Vercel**: ✅ All 8 environment variables updated  
**Site**: ✅ WORKING - 688 registrations loading successfully  
**API**: ✅ Verified - Returns data correctly  

**Action Completed**: November 17, 2025 ✅

## Timeline

1. **Rotate NOW** (5 minutes)
2. **Update Vercel** (2 minutes)  
3. **Redeploy** (auto, 2 minutes)
4. **Verify** (1 minute)

**Total time**: ~10 minutes to secure database

## Support

If you need help:
1. Neon support: https://neon.tech/docs/introduction
2. Vercel support: https://vercel.com/docs
3. GitHub secret scanning: https://docs.github.com/en/code-security/secret-scanning

---

**✅ COMPLETED**: All actions completed on November 17, 2025. Your database is secured and site is fully functional with 688 registrations! 🎉
