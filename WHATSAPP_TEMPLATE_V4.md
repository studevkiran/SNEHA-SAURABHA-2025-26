# WhatsApp Template v4 - Infobip Registration

## Template Details
- **Template Name**: `registration_confirmation_v4`
- **Category**: UTILITY
- **Language**: English

---

## HEADER (IMAGE)
**Type**: IMAGE  
**Image URL**: 
```
https://res.cloudinary.com/dnai1dz03/image/upload/v1763028752/WhatsApp_Image_2025-11-13_at_09.00.02_ny0cn9.jpg
```

---

## BODY TEXT

```
Dear {{1}},

Thank you for registering for SNEHA SAURABHA 2025-26!

📋 Registration Details:
Amount Paid: ₹{{2}}

📅 Event Dates:
30th & 31st January, 1st February 2026

📍 Venue:
Silent Shores Resort & Spa, Mysore

We look forward to welcoming you!

Best regards,
District Conference Committee
```

---

## FOOTER TEXT

```
For queries: +91 78920 45223
```

---

## BUTTONS
**No buttons** - Plain template

---

## Variables Used
1. `{{1}}` - Full Name
2. `{{2}}` - Amount Paid

---

## How to Register in Infobip

1. Go to: https://portal.infobip.com/
2. Navigate to: **Channels & Numbers** → **WhatsApp**
3. Click: **Message Templates**
4. Click: **Create Template**
5. Fill in:
   - **Template Name**: `registration_confirmation_v4`
   - **Category**: UTILITY
   - **Language**: English
6. Add **HEADER**:
   - Type: IMAGE
   - Upload or paste URL: `https://res.cloudinary.com/dnai1dz03/image/upload/v1763028752/WhatsApp_Image_2025-11-13_at_09.00.02_ny0cn9.jpg`
7. Add **BODY**:
   - Paste the body text above
   - Mark `{{1}}` and `{{2}}` as variables
8. Add **FOOTER**:
   - Type: TEXT
   - Content: `For queries: +91 78920 45223`
9. Click: **Submit for Approval**

---

## After Approval

Once approved by WhatsApp/Meta, update the code:
- File: `api/send-whatsapp-confirmation.js`
- File: `api/cashfree/verify.js`
- Change templateName to: `registration_confirmation_v4`

---

## Sample Message Preview

```
[Image: Rotary Conference Banner]

Dear John Doe,

Thank you for registering for SNEHA SAURABHA 2025-26!

📋 Registration Details:
Amount Paid: ₹7,500

📅 Event Dates:
30th & 31st January, 1st February 2026

📍 Venue:
Silent Shores Resort & Spa, Mysore

We look forward to welcoming you!

Best regards,
District Conference Committee

For queries: +91 78920 45223
```

---

## Comparison with v3

**Removed:**
- ❌ Registration No: SS2026-XXXXX
- ❌ Receipt No: RCP-XXXXX

**Changed:**
- ✅ Mobile: +91 9845912101 → +91 78920 45223

**Kept:**
- ✅ Header image (same Cloudinary URL)
- ✅ Name, Amount
- ✅ Event dates
- ✅ Venue

---

## Code Ready to Deploy

After v4 is approved, I'll update:
1. `api/send-whatsapp-confirmation.js`
2. `api/cashfree/verify.js`

Both will use `registration_confirmation_v4` with 2 variables instead of 4.
