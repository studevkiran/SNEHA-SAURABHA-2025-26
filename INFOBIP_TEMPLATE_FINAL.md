# 📱 Updated WhatsApp Template for Infobip

## ✅ Template Type: **Text and rich media**

---

## 🎨 Template Configuration

**Category**: `Utility`  
**Language**: `English`  
**Template Name**: `registration_confirmation`

---

## 📸 HEADER Section

**Type**: `IMAGE`  
**Media URL**: `https://sneha2026.vercel.app/images/event-logo.jpeg`

> ✅ Logo uploaded as `event-logo.jpeg` in the `public/images/` folder

---

## 📝 BODY Section (Copy this exactly)

```
Hi {{1}},

🎯 Thank you for registering to SNEHA SAURABHA 2025-26, District Conference happening at Silent Shores, Mysore on 30th & 31st January & 01st February 2026

We're thrilled to have you on board for this district event that celebrates knowledge, friendship and fellowship.

📋 *Registration Details:*

✒️ Registration No.: {{2}}
📄 Receipt No.: {{3}}
👤 Name: {{4}}
📞 Mobile: {{5}}
📧 Email: {{6}}
🍽️ Food Preference: {{7}}

✅ Amount Paid: ₹ {{8}}

🔗 View your complete registration:
{{9}}

Looking forward to an inspiring experience together!

Warm regards,
Team Sneha Saurabha 2025-26 – Rotary District Conference 3181
```

---

## 📊 Variables (9 total):

| Variable | Description | Sample Value |
|----------|-------------|--------------|
| {{1}} | Name (greeting) | D Srinivasan |
| {{2}} | Registration No. | SS0001 |
| {{3}} | Receipt No. | 0001 |
| {{4}} | Name (full) | D Srinivasan |
| {{5}} | Mobile | 9980557785 |
| {{6}} | Email | mallige@gmail.com |
| {{7}} | Food Preference | Non-veg |
| {{8}} | Amount | 5,000 |
| {{9}} | Confirmation Link | https://sneha2026.vercel.app/confirmation.html?id=SS0001 |

---

## 🎯 Sample Values to Enter in Infobip:

When Infobip asks for examples, enter:

```
{{1}} = D Srinivasan
{{2}} = SS0001
{{3}} = 0001
{{4}} = D Srinivasan
{{5}} = 9980557785
{{6}} = mallige@gmail.com
{{7}} = Non-veg
{{8}} = 5,000
{{9}} = https://sneha2026.vercel.app/confirmation.html?id=SS0001
```

---

## 📋 Footer (Optional):

```
Need help? WhatsApp: +91 99805 57785
```

---

## ✅ Step-by-Step in Infobip:

1. **Select**: "Text and rich media" ✅
2. **Category**: Utility
3. **Name**: registration_confirmation
4. **Header**: 
   - Type: IMAGE
   - URL: https://sneha2026.vercel.app/images/event-logo.jpg
5. **Body**: Copy the text above (with {{1}} to {{9}})
6. **Footer**: Need help? WhatsApp: +91 99805 57785
7. **Buttons**: Skip (not needed)
8. **Sample Values**: Enter the 9 values above
9. **Submit for Approval** ✅

---

## 📸 Verify Photo Upload

Make sure your event logo is here:
```
/Users/kiran/Desktop/SNEHA-SAURABHA-2025-26/public/images/event-logo.jpg
```

Then deploy:
```bash
vercel --prod
```

---

## 🎯 Preview of Final Message:

```
┌─────────────────────────────────────┐
│      [YOUR EVENT LOGO IMAGE]        │
├─────────────────────────────────────┤
│ Hi D Srinivasan,                    │
│                                      │
│ 🎯 Thank you for registering to    │
│ SNEHA SAURABHA 2025-26, District   │
│ Conference happening at Silent      │
│ Shores, Mysore on 30th & 31st      │
│ January & 01st February 2026        │
│                                      │
│ We're thrilled to have you on      │
│ board for this district event that  │
│ celebrates knowledge, friendship    │
│ and fellowship.                     │
│                                      │
│ 📋 *Registration Details:*         │
│                                      │
│ ✒️ Registration No.: SS0001        │
│ 📄 Receipt No.: 0001               │
│ 👤 Name: D Srinivasan              │
│ 📞 Mobile: 9980557785              │
│ 📧 Email: mallige@gmail.com        │
│ 🍽️ Food Preference: Non-veg       │
│                                      │
│ ✅ Amount Paid: ₹ 5,000            │
│                                      │
│ 🔗 View your complete registration:│
│ https://sneha2026.vercel.app/...   │
│                                      │
│ Looking forward to an inspiring     │
│ experience together!                │
│                                      │
│ Warm regards,                       │
│ Team Sneha Saurabha 2025-26 –      │
│ Rotary District Conference 3181     │
├─────────────────────────────────────┤
│ Need help? WhatsApp: +91 99805 57785│
└─────────────────────────────────────┘
```

---

**Template Type**: Text and rich media ✅  
**Variables**: 9 (sequential order)  
**Format**: Matches your example ✅

Submit this template now! 🚀
