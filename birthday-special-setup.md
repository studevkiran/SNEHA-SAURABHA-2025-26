# 🎂 District Governor Birthday Special - Implementation Guide

## Special Pricing for Dec 23, 2025

### Promotional Rates:
- **Rotarian**: ₹5,000 → **₹4,500** (Save ₹500)
- **Rotarian with Spouse**: ₹8,000 → **₹7,500** (Save ₹500)

### Implementation Done:
1. ✅ Birthday banner on homepage
2. ✅ Auto-applies discount on Dec 23
3. ✅ Birthday wishes popup
4. ✅ Special badge showing discount
5. ✅ Reverts to normal pricing on Dec 24

### Files Modified:
- `/scripts/app.js` - Added birthday pricing logic
- `/public/scripts/app.js` - Added birthday pricing logic  
- `/index.html` - Added birthday banner
- `/public/index.html` - Added birthday banner
- `/styles/main.css` - Added birthday banner styles

### To Deploy:
```bash
git add .
git commit -m "Add DG Birthday Special: 23 Dec pricing"
git push
```

### Timeline:
- **Dec 23, 2025**: Special pricing active
- **Dec 24, 2025**: Returns to regular pricing automatically

## Birthday Wishes Feature
- Popup appears when clicking the banner
- Shows birthday message for District Governor
- Auto-shows once on homepage load (Dec 23 only)
