# 📋 QUICK REFERENCE - Copy & Paste for Infobip

---

## 🎯 Template Body (Copy Below)

```
Hi {{1}},

🎯 Thank you for registering to SNEHA SAURABHA 2025-26, District Conference at Silent Shores, Mysore on 30th & 31st January & 01st February 2026.

📋 *Registration Details:*

✒️ Registration No.: {{2}}
📄 Receipt No.: {{3}}
👤 Name: {{4}}
📞 Mobile: {{5}}
📧 Email: {{6}}
🍽️ Food Preference: {{7}}

✅ Amount Paid: ₹ {{8}}

🔗 View registration: {{9}}

Looking forward to an inspiring experience together!

Warm regards,
Team Sneha Saurabha 2025-26
Rotary District 3181
```

---

## 📋 Template Footer (Copy Below)

```
Need help? WhatsApp: +91 99027 72262
```

---

## 🔢 Sample Values (Copy Below)

```
{{1}} = Ntes
{{2}} = ANN04V6567
{{3}} = 2094619245
{{4}} = Ntes
{{5}} = 919902772262
{{6}} = ntes@example.com
{{7}} = Veg
{{8}} = 4,000
{{9}} = https://sneha2026.in/r.html?id=ANN04V6567
```

---

## ✅ Steps

1. Login: https://portal.infobip.com
2. Go to: Channels → WhatsApp → Templates
3. Click: "Create Template" or "New Template"
4. Template Type: "Text and rich media"
5. Name: `registration_confirmation_v3` (NEW template name)
6. Category: Utility
7. Language: English
8. Header: IMAGE (upload your logo OR use Cloudinary URL - uploading is easier!)
   - Upload method: Click "Upload Image" and select logo
   - URL method (if needed): https://res.cloudinary.com/dnai1dz03/image/upload/v1762963571/event-logo_o0nr7s.jpg
9. Body: Paste template body from above
10. Footer: Paste template footer from above
11. Sample Values: Paste sample values from above
12. Submit for approval
13. Wait 5-15 minutes
14. **After approval**: Tell me so I can update the code to use new template name

---

## 🎯 What Changed

| Item | Old | New |
|------|-----|-----|
| Receipt No. | 6567 | 2094619245 (Cashfree ID) |
| URL | Long Vercel link | sneha2026.in/r.html?id=... |
| Footer | +91 99805 57785 | +91 99027 72262 |
| Length | ~320 chars | ~270 chars |

---

## ✅ After Approval

**Tell me when approved** so I can update the code!

Code needs to change from:
```javascript
templateName: 'registration_confirmation'
```

To:
```javascript
templateName: 'registration_confirmation_v3'
```

Then test with: **919902772262** (whitelisted number)

Verify:
- Receipt shows Cashfree transaction ID
- URL is short and branded
- Footer shows correct support number
- Message doesn't collapse

---

**Full Details**: See `INFOBIP_TEMPLATE_V3_FINAL.md`  
**Deployment**: ✅ Already done  
**Status**: Ready for testing after template approval
