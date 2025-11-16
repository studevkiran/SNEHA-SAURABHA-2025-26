# SHORT WhatsApp Template (No "Read More")

## Problem
Current WhatsApp messages are too long and show "Read more..." button.

## Solution
Create a **shorter template** with only essential info.

---

## New Template: `sneha_confirmation_short`

### Template Name
```
sneha_confirmation_short
```

### Category
**TRANSACTIONAL** (important for approval)

### Language
**English (en)**

### Template Content

#### BODY TEXT:
```
✅ Registration Confirmed!

Hi {{1}},

Your registration is confirmed for SNEHA SAURABHA 2026.

📋 ID: {{2}}
👤 Type: {{3}}
🍽️ Meal: {{4}}

Event: 30-31 Jan & 1 Feb 2026
Venue: Silent Shores Resort, Mysore

See you there! 🎉
```

#### BUTTON (Call-to-Action):
- Button Type: **URL**
- Button Text: `View Details`
- URL: `https://sneha2026.in/index.html?id={{1}}`
  - {{1}} = Dynamic parameter (registration ID)

---

## Variables Mapping

| Variable | Data | Example |
|----------|------|---------|
| {{1}} | Name | Kiran Kumar |
| {{2}} | Registration ID | 2026RTY0001 |
| {{3}} | Registration Type | Rotarian |
| {{4}} | Meal Preference | Veg |

Button URL {{1}} = Registration ID for details page

---

## How to Create in Infobip

1. **Login to Infobip Portal**
   - Go to: https://portal.infobip.com/

2. **Navigate to WhatsApp Templates**
   - Channels → WhatsApp → Message Templates

3. **Click "Create New Template"**

4. **Fill Details:**
   - Template Name: `sneha_confirmation_short`
   - Category: **TRANSACTIONAL**
   - Language: **English (en)**

5. **Add Body:**
   - Paste the body text above
   - Mark variables with {{1}}, {{2}}, {{3}}, {{4}}

6. **Add Button:**
   - Type: URL
   - Text: `View Details`
   - URL: `https://sneha2026.in/index.html?id={{1}}`
   - Mark {{1}} as dynamic variable

7. **Submit for Approval**
   - Click "Submit"
   - Wait 5-10 minutes for WhatsApp/Meta approval

8. **Update Environment Variable**
   ```bash
   # In Vercel or .env.local
   INFOBIP_TEMPLATE_NAME=sneha_confirmation_short
   ```

---

## Benefits

✅ **No "Read more"** - Short enough to display fully  
✅ **Essential info only** - Name, ID, Type, Meal  
✅ **Button for details** - Click to see full registration  
✅ **Faster approval** - Simpler templates approve quicker  
✅ **Better UX** - Recipients see everything immediately  

---

## Testing After Deployment

1. Do a test registration
2. Check WhatsApp message
3. Verify:
   - [ ] Message shows completely (no "Read more")
   - [ ] All 4 variables populated correctly
   - [ ] Button works and opens details page
   - [ ] Page shows registration details

---

## Rollback (if needed)

If you want to use the old template:

```javascript
// In send-whatsapp-confirmation.js
templateName: 'registration_confirmation_v4'  // Old template
```

---

## Current Status

- [x] Code updated to use short template
- [ ] Create template in Infobip portal
- [ ] Wait for Meta approval (5-10 mins)
- [ ] Deploy to Vercel
- [ ] Test with real registration

---

**Next Steps:**
1. Create this template in Infobip
2. Wait for approval
3. Deploy code: `vercel --prod`
4. Test registration
