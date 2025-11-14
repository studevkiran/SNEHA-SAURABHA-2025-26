# WhatsApp Template v4 - FINAL APPROVED FORMAT

**Template Name**: `registration_confirmation_v4_final`  
**Category**: UTILITY  
**Language**: English  
**Status**: Ready for Infobip submission  
**Footer**: +91 9845912101 (CORRECTED)

---

## 💡 FORMATTING NOTES

**WhatsApp Bold Text**: Use `*text*` for bold formatting
- `*SNEHA SAURABHA 2025-26*` → **SNEHA SAURABHA 2025-26**
- `*Silent Shores, Mysore*` → **Silent Shores, Mysore**
- `*Registration Details:*` → **Registration Details:**
- `*Name:*` → **Name:**
- And so on...

---

## 📱 TEMPLATE PREVIEW

```
Hi {{1}},

🎯 Thank you for registering to *SNEHA SAURABHA 2025-26*, District Conference happening at *Silent Shores, Mysore* on *30th, 31st Jan & 01st Feb 2026*

📋 *Registration Details:*

👤 *Name:* {{2}}
📞 *Mobile:* {{3}}
📧 *Email:* {{4}}
🗂️ *Registration Category:* {{5}}
🍽️ *Food Preference:* {{6}}
👕 *T-Shirt Size:* {{7}}

✅ *Amount Paid:* ₹ {{8}}

🔗 View complete details:
{{9}}

Looking forward to an inspiring experience together!

Warm regards,
Team Sneha Saurabha 2025-26
Rotary District Conference 3181
```

**Footer**: For queries: +91 9845912101

---

## 🔢 VARIABLES (9 Total - Following v2 Pattern)

| Variable | Type | Example | Required | Note |
|----------|------|---------|----------|------|
| {{1}} | Name (greeting) | vidyadhar v | Yes | Used in "Hi {{1}}," |
| {{2}} | Name (details) | vidyadhar v | Yes | Shown in details section |
| {{3}} | Mobile | 919902772262 | Yes | With country code |
| {{4}} | Email | new@reform.hange | Yes | Email address |
| {{5}} | Registration Type | Gold Sponsor | Yes | Category |
| {{6}} | Meal Preference | Veg | Yes | Veg/Non-Veg/Jain |
| {{7}} | T-shirt Size | XXL | Yes | XS/S/M/L/XL/XXL/XXXL |
| {{8}} | Amount | 1,00,000 | Yes | Formatted with commas |
| {{9}} | Details URL | https://sneha2026.in/r.html?id=ANT05V6006 | Yes | Clickable link |

**Note**: Name appears **twice** ({{1}} for greeting, {{2}} in details) - same as v2 template pattern

---

## 🎨 INFOBIP TEMPLATE STRUCTURE

### Header (Optional - Add logo if needed)
- Type: IMAGE
- URL: https://res.cloudinary.com/dzu1nqlpf/image/upload/v1730647456/sneha-saurabha-header.jpg

### Body
```
Hi {{1}},

🎯 Thank you for registering to *SNEHA SAURABHA 2025-26*, District Conference happening at *Silent Shores, Mysore* on *30th, 31st Jan & 01st Feb 2026*

📋 *Registration Details:*

👤 *Name:* {{2}}
📞 *Mobile:* {{3}}
📧 *Email:* {{4}}
🗂️ *Registration Category:* {{5}}
🍽️ *Food Preference:* {{6}}
👕 *T-Shirt Size:* {{7}}

✅ *Amount Paid:* ₹ {{8}}

🔗 View complete details:
{{9}}

Looking forward to an inspiring experience together!

Warm regards,
Team Sneha Saurabha 2025-26
Rotary District Conference 3181
```

### Footer
```
For queries: +91 9845912101
```

### Buttons (Optional)
- Type: URL
- Text: View Details
- URL: {{8}}

---

## 📝 INFOBIP SUBMISSION STEPS

### Step 1: Login to Infobip
https://portal.infobip.com/

### Step 2: Navigate to Templates
Channels & Numbers → WhatsApp → Message Templates → Create Template

### Step 3: Fill Template Details

**Basic Information:**
- Template Name: `registration_confirmation_v4_final`
- Category: UTILITY
- Language: English

**Header (Optional):**
- Type: IMAGE
- Upload or provide Cloudinary URL

**Body:**
```
Hi {{1}},

🎯 Thank you for registering to *SNEHA SAURABHA 2025-26*, District Conference happening at *Silent Shores, Mysore* on *30th, 31st Jan & 01st Feb 2026*

📋 *Registration Details:*

👤 *Name:* {{1}}
📞 *Mobile:* {{2}}
📧 *Email:* {{3}}
🗂️ *Registration Category:* {{4}}
🍽️ *Food Preference:* {{5}}
👕 *T-Shirt Size:* {{6}}

✅ *Amount Paid:* ₹ {{7}}

🔗 View complete details:
{{8}}

Looking forward to an inspiring experience together!

Warm regards,
Team Sneha Saurabha 2025-26
Rotary District Conference 3181
```

**Footer:**
```
For queries: +91 9845912101
```

**Sample Values for Testing:**
1. vidyadhar v (greeting)
2. vidyadhar v (name in details)
3. 919902772262
4. new@reform.hange
5. Gold Sponsor
6. Veg
7. XXL
8. 1,00,000
9. https://sneha2026.in/r.html?id=ANT05V6006

### Step 4: Submit for Approval
- Review all details
- Click "Submit for Approval"
- Wait 24-48 hours for WhatsApp/Meta approval

---

## 💻 CODE IMPLEMENTATION

### Update `api/send-whatsapp-confirmation.js`

```javascript
// After template approval, update the code:

const templateName = 'registration_confirmation_v4_final'; // Updated

const placeholders = [
  fullName,                        // {{1}} Name (greeting)
  fullName,                        // {{2}} Name (in details - same value)
  mobile,                          // {{3}} Mobile
  email || 'Not Provided',         // {{4}} Email
  registrationType,                // {{5}} Registration Category
  mealPreference || 'Veg',         // {{6}} Food Preference
  tshirtSize || 'M',               // {{7}} T-shirt Size
  amount.toLocaleString('en-IN'),  // {{8}} Amount (formatted)
  detailsUrl                       // {{9}} Confirmation URL
];
```

### Full API Call Example

```javascript
const response = await fetch(infobipWhatsAppUrl, {
  method: 'POST',
  headers: {
    'Authorization': `App ${INFOBIP_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messages: [{
      from: INFOBIP_SENDER_NUMBER,
      to: recipientNumber,
      messageId: generateMessageId(),
      content: {
        templateName: 'registration_confirmation_v4_final',
        templateData: {
          body: {
            placeholders: [
              'vidyadhar v',           // {{1}} Name
              '919902772262',          // {{2}} Mobile
              'new@reform.hange',      // {{3}} Email
              'Gold Sponsor',          // {{4}} Registration Type
              'Veg',                   // {{5}} Meal Preference
              'XXL',                   // {{6}} T-shirt Size
              '1.00',                  // {{7}} Amount
              'https://sneha2026.in/r.html?id=ANT05V6006' // {{8}} URL
            ]
          },
          header: {
            type: 'IMAGE',
            mediaUrl: 'https://res.cloudinary.com/dzu1nqlpf/image/upload/v1730647456/sneha-saurabha-header.jpg'
          }
        },
        language: 'en'
      }
    }]
  })
});
```

---

## 🔄 CHANGES FROM v3

| Aspect | v3 | v4 |
|--------|----|----|
| **Footer Number** | +91 9845912101 | +91 9845912101 ✅ (SAME) |
| **Variables** | 4 (name, amount, reg_id, receipt) | 8 (name, mobile, email, type, meal, tshirt, amount, url) ✅ |
| **Registration ID** | Shown | Removed (in URL only) ✅ |
| **Receipt Number** | Shown | Removed ✅ |
| **Mobile** | Not shown | Added ✅ |
| **Email** | Not shown | Added ✅ |
| **Meal Preference** | Not shown | Added ✅ |
| **T-shirt Size** | Not shown | Added ✅ |
| **Details URL** | Not included | Added as clickable link ✅ |
| **Bold Formatting** | No | Yes (key words bold) ✅ |

---

## ✅ ADVANTAGES OF v4

1. ✅ **More Complete** - Shows all registration details
2. ✅ **Better Formatting** - Bold text for key information
3. ✅ **Same Support Number** - +91 9845912101 (consistent)
4. ✅ **Cleaner** - No redundant reg/receipt numbers in body
5. ✅ **More Useful** - Includes meal preference and t-shirt size
6. ✅ **Interactive** - Clickable URL for complete details
7. ✅ **Professional** - Comprehensive confirmation message

---

## 🎯 WHEN TO USE

- ✅ New registrations after v4 approval
- ✅ Manual confirmations for 680 imported records
- ✅ Resend confirmations if requested
- ✅ All future communications

---

## 📊 TESTING CHECKLIST

After approval:

```bash
# Test with real data
curl -X POST https://your-domain.com/api/send-whatsapp-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "name": "vidyadhar v",
    "mobile": "919902772262",
    "email": "new@reform.hange",
    "registrationType": "Gold Sponsor",
    "mealPreference": "Veg",
    "tshirtSize": "XXL",
    "amount": 1.00,
    "registrationId": "ANT05V6006"
  }'
```

**Verify**:
- ✅ All 8 placeholders filled correctly
- ✅ Footer shows +91 78920 45223
- ✅ URL is clickable
- ✅ Emojis display properly
- ✅ Formatting is clean

---

## 📞 FOOTER CONTACT NUMBERS

| Template | Footer Number | Status |
|----------|---------------|--------|
| v2 | +91 9845912101 | ✅ Approved, Currently Active |
| v3 | +91 9845912101 | ⏳ Pending Approval |
| **v4** | **+91 9845912101** | 📝 **Ready for Submission (SAME NUMBER)** |

**Note**: All templates use the same footer number: +91 9845912101

---

## 🚀 NEXT STEPS

1. **Submit Template** to Infobip (use steps above)
2. **Wait for Approval** (24-48 hours)
3. **Update Code** in `api/send-whatsapp-confirmation.js`
4. **Test with Test Registration** (₹1 with TEST1 coupon)
5. **Deploy to Production**
6. **Use for All New Registrations**

---

## 💡 RECOMMENDATION

**For 680 Manual Registrations:**

Once v4 is approved, you can send confirmations to VIP sponsors:

```javascript
// Send to all Gold/Platinum/Patron sponsors
SELECT * FROM manual_registrations 
WHERE registration_type LIKE '%Sponsor%' 
  AND registration_amount >= 100000;

// Send confirmation WhatsApp to each
```

---

**Status**: ✅ Template v4 specification complete  
**Footer**: +91 78920 45223 ✅  
**Variables**: 8 (comprehensive) ✅  
**Ready for**: Infobip submission
