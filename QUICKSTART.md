# Quick Start Guide - Sneha Sourabha 2025-26

## ✅ What's Complete

The **complete conference registration website** is ready with:

✓ Mobile-first responsive design  
✓ 11 registration types with detailed pricing  
✓ 91 Rotary clubs in dropdown  
✓ Meal preference selection (Veg/Non-Veg/Jain)  
✓ Payment integration structure  
✓ WhatsApp confirmation ready  
✓ Admin dashboard with full CRUD  
✓ Export functionality ready  
✓ API documentation complete  

## 🚀 Next 3 Steps

### 1. Upload Your Event Images (2 minutes)
```bash
# Add these two images to the images/ folder:
images/header-left.jpg      # Rotary/District logo
images/header-right.jpg     # Event branding
```

### 2. Push to GitHub (1 minute)
```bash
git push -u origin main
```

### 3. Test the Website (5 minutes)
```bash
# Open in browser
open index.html

# Or use Live Server in VS Code
# Or run: python3 -m http.server 8000
```

## 📱 Testing Checklist

- [ ] Open in mobile view (DevTools → Toggle device toolbar)
- [ ] Test registration flow: Home → Type → Details → Review → Payment → Success
- [ ] Try all 11 registration types
- [ ] Test meal preference toggles
- [ ] Check club dropdown loads all 91 clubs
- [ ] Test admin dashboard (`admin/index.html`, login: admin/admin123)

## 🔐 Admin Dashboard

**URL**: `admin/index.html`  
**Login**: username: `admin` / password: `admin123`  

**⚠️ IMPORTANT**: Change these credentials before production!

## 🌐 For Production Deployment

### Option A: Vercel (Recommended)
```bash
npm install -g vercel
vercel
# Follow prompts, add environment variables in Vercel dashboard
```

### Option B: Netlify
1. Drag and drop project folder to Netlify
2. Add environment variables in site settings
3. Done!

### Option C: GitHub Pages (Frontend Only)
1. Push to GitHub
2. Enable GitHub Pages in repository settings
3. Select main branch
4. Done!

## 🔧 Environment Variables Needed (Backend)

When you add backend API:

```env
DATABASE_URL=mongodb://...          # Your database
PAYMENT_API_KEY=rzp_live_...       # Razorpay/payment gateway
WHATSAPP_API_KEY=...               # WhatsApp Business API
EMAIL_API_KEY=...                  # Email service (SendGrid, etc.)
ADMIN_SECRET_KEY=...               # For admin authentication
```

## 📚 Full Documentation

- **README.md** - Complete feature guide
- **docs/API_STRUCTURE.md** - Backend API guide
- **images/README.md** - Image upload instructions
- **.github/copilot-instructions.md** - Project overview

## 💡 Common Tasks

### Change Registration Prices
Edit `scripts/app.js` → `registrationTypes` object

### Add/Remove Clubs
Edit `data/clubs.json`

### Change Theme Colors
Edit `styles/main.css` → `:root` CSS variables

### Update Admin Password
Edit `scripts/admin.js` → `handleLogin()` function  
(In production, use proper backend authentication)

## 📞 Support

All code is documented with comments.  
Check API_STRUCTURE.md for backend integration details.

---

**Ready to go live!** 🎉

Just upload your images and push to GitHub!
