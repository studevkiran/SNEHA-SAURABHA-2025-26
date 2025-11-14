# 📱 SEND WHATSAPP TO MANUAL REGISTRATIONS - COMPLETE GUIDE

**Created**: November 14, 2025  
**Purpose**: Send WhatsApp confirmations to 680 manually imported registrations  
**Status**: ✅ Ready to use after template v4 approval

---

## 🎯 OVERVIEW

You can now send WhatsApp confirmations to manually imported registrations or resend to any existing registration. This is completely separate from the automatic payment confirmation flow.

### Two Methods Available

1. **Admin Web Interface** (Recommended) - Visual, easy to use
2. **API Calls** (Advanced) - For scripts and automation

---

## 🖥️ METHOD 1: ADMIN WEB INTERFACE

### Access the Interface

**URL**: `https://sneha2026.in/admin/send-whatsapp.html`

### 4 Sending Modes

#### 🏆 Mode 1: VIP Sponsors
**Use Case**: Send to all Patron, Platinum, Gold, and Silver sponsors

**Steps**:
1. Click "VIP Sponsors" card
2. Click "Preview Recipients"
3. Review the list (should show 47 sponsors if all are imported)
4. Click "Send WhatsApp Confirmations"
5. Wait for completion

**Who gets messages**: All registrations where `registration_type LIKE '%Sponsor%'`

---

#### ✅ Mode 2: Selected IDs
**Use Case**: Send to specific registration IDs (cherry-pick)

**Steps**:
1. Click "Selected IDs" card
2. Paste registration IDs in text area (one per line or comma-separated):
   ```
   ANT05V6006
   2026RTY0001
   2026RTY0002
   ```
3. Click "Preview Recipients"
4. Review the list
5. Click "Send WhatsApp Confirmations"

**Who gets messages**: Only the registration IDs you listed

---

#### 📋 Mode 3: All with Filters
**Use Case**: Send to bulk registrations with optional filters

**Steps**:
1. Click "All with Filters" card
2. Optionally set filters:
   - **Registration Type**: Select specific type (e.g., "Rotarian")
   - **Minimum Amount**: Set amount threshold (e.g., 25000 for sponsors only)
3. Click "Preview Recipients"
4. Review the list (max 100 shown in preview, all will be sent)
5. Click "Send WhatsApp Confirmations"

**Examples**:
- No filters = Send to ALL registrations with mobile numbers
- Type = "Rotarian" = Send to all Rotarians only
- Min Amount = 25000 = Send to Silver Sponsor and above

---

#### 👤 Mode 4: Single User
**Use Case**: Send or resend to one specific person

**Steps**:
1. Click "Single User" card
2. Enter registration ID (e.g., `ANT05V6006`)
3. Click "Preview Recipients"
4. Review the details
5. Click "Send WhatsApp Confirmations"

**Who gets messages**: Only that one registration

---

### ⚠️ Important Notes

- **Mobile Required**: Only registrations with mobile numbers will be sent
- **Rate Limiting**: Automatic 100ms delay between messages
- **Preview First**: Always preview before sending
- **No Duplicates**: Each registration sent only once per batch
- **Success Rate**: Shows statistics after completion

---

## 🔧 METHOD 2: API CALLS

### Endpoint

```
POST /api/send-manual-confirmations
Content-Type: application/json
```

### Request Format

```javascript
{
  "mode": "sponsors",              // Required: 'single', 'selected', 'all', 'sponsors'
  "registrationIds": ["ANT05V6006"], // Required for 'single' and 'selected' modes
  "filters": {                      // Optional for 'all' mode
    "type": "Rotarian",
    "club": "Mysore Midtown",
    "minAmount": 25000
  }
}
```

### Example 1: Send to All Sponsors

```bash
curl -X POST https://sneha2026.in/api/send-manual-confirmations \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "sponsors"
  }'
```

### Example 2: Send to Selected IDs

```bash
curl -X POST https://sneha2026.in/api/send-manual-confirmations \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "selected",
    "registrationIds": ["ANT05V6006", "2026RTY0001", "2026RTY0002"]
  }'
```

### Example 3: Send to All Rotarians

```bash
curl -X POST https://sneha2026.in/api/send-manual-confirmations \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "all",
    "filters": {
      "type": "Rotarian"
    }
  }'
```

### Example 4: Send to One Person

```bash
curl -X POST https://sneha2026.in/api/send-manual-confirmations \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "single",
    "registrationIds": ["ANT05V6006"]
  }'
```

### Response Format

```json
{
  "success": true,
  "message": "WhatsApp confirmations sent: 45/47",
  "results": {
    "total": 47,
    "sent": 45,
    "failed": 2,
    "errors": [
      {
        "registrationId": "2026RTY0010",
        "name": "John Doe",
        "mobile": "919900000000",
        "error": "Invalid mobile number"
      }
    ]
  }
}
```

---

## 📊 TRACKING & LOGS

### Database Logging

All bulk sends are logged in `whatsapp_send_log` table:

```sql
-- View recent sends
SELECT * FROM whatsapp_send_log 
ORDER BY sent_at DESC 
LIMIT 10;

-- View send statistics
SELECT * FROM whatsapp_send_stats;

-- View specific send details
SELECT * FROM whatsapp_send_log 
WHERE mode = 'sponsors' 
ORDER BY sent_at DESC 
LIMIT 1;
```

### Log Structure

| Column | Description |
|--------|-------------|
| `mode` | Send mode used (sponsors, selected, all, single) |
| `total_count` | Total registrations attempted |
| `sent_count` | Successfully sent |
| `failed_count` | Failed sends |
| `filters` | Filter criteria used (JSON) |
| `errors` | Array of error details (JSON) |
| `sent_at` | Timestamp of send |

---

## 🚀 WORKFLOW FOR 680 MANUAL REGISTRATIONS

### Step 1: Import 680 Records (if not done)
```bash
# Import to staging table
node database/import-to-manual-table.js

# Verify import
psql $POSTGRES_URL -c "SELECT * FROM manual_regs_summary;"
```

### Step 2: Update VIP Contact Info (47 sponsors)
```sql
-- Find sponsors needing contact info
SELECT * FROM manual_regs_need_update 
WHERE registration_type LIKE '%Sponsor%';

-- Update contact info one by one
SELECT update_manual_contact(
  'REG_ID', 
  '919900000000',  -- mobile
  'email@example.com',
  'Veg',
  'XL'
);
```

### Step 3: Merge VIP Sponsors to Production
```sql
-- Mark sponsors as verified
UPDATE manual_registrations 
SET is_verified = TRUE 
WHERE registration_type LIKE '%Sponsor%';

-- Merge to production table
SELECT * FROM merge_manual_to_main();
```

### Step 4: Send WhatsApp to VIP Sponsors

**Option A: Via Admin Interface**
1. Go to `https://sneha2026.in/admin/send-whatsapp.html`
2. Click "VIP Sponsors"
3. Preview and send

**Option B: Via API**
```bash
curl -X POST https://sneha2026.in/api/send-manual-confirmations \
  -H "Content-Type: application/json" \
  -d '{"mode": "sponsors"}'
```

### Step 5: Gradually Update & Send Rotarians (633 records)

**Update in batches**:
```sql
-- Update a club at a time
SELECT * FROM manual_registrations 
WHERE club = 'Mysore Midtown' 
AND needs_contact_update = TRUE;

-- Update contacts
SELECT update_manual_contact('REG_ID', 'mobile', 'email', 'meal', 'tshirt');
```

**Send after updating each batch**:
1. Mark batch as verified
2. Merge to production
3. Send WhatsApp via admin interface (filter by club or registration type)

---

## ⚡ QUICK SCENARIOS

### Scenario 1: "I just imported 680 records and want to send to sponsors now"

```bash
# 1. Update sponsor contact info (if needed)
psql $POSTGRES_URL

# SQL: Update contacts for each sponsor
SELECT update_manual_contact('2026RTY0001', '919900000000', 'email@example.com', 'Veg', 'XL');

# 2. Verify and merge sponsors
UPDATE manual_registrations SET is_verified = TRUE WHERE registration_type LIKE '%Sponsor%';
SELECT * FROM merge_manual_to_main();

# 3. Send WhatsApp
# Go to: https://sneha2026.in/admin/send-whatsapp.html
# Click: VIP Sponsors → Preview → Send
```

---

### Scenario 2: "I want to resend confirmation to one person"

```bash
# Via Admin Interface:
# 1. Go to https://sneha2026.in/admin/send-whatsapp.html
# 2. Click "Single User"
# 3. Enter registration ID
# 4. Preview and send
```

---

### Scenario 3: "I want to send to all Rotarians from Mysore Midtown club"

**Not directly supported by filters yet**, but you can:

**Option 1: Get IDs first**
```sql
SELECT registration_id FROM registrations 
WHERE club = 'Mysore Midtown' 
AND registration_type = 'Rotarian';
```
Copy the IDs, paste in "Selected IDs" mode

**Option 2: Add club filter support** (quick code change)
```javascript
// In api/send-manual-confirmations.js, add:
if (filters?.club) {
  whereConditions.push(`club = $${paramIndex}`);
  params.push(filters.club);
  paramIndex++;
}
```

---

### Scenario 4: "I want to send to 10 specific people"

```
# Via Admin Interface:
# 1. Go to https://sneha2026.in/admin/send-whatsapp.html
# 2. Click "Selected IDs"
# 3. Paste registration IDs:
ANT05V6006
2026RTY0001
2026RTY0002
...
# 4. Preview and send
```

---

## 🛡️ SAFETY FEATURES

### Automatic Protections

✅ **No Duplicates**: Each registration sent only once per batch  
✅ **Mobile Validation**: Only sends if mobile number exists  
✅ **Rate Limiting**: 100ms delay between messages (prevents API overload)  
✅ **Error Logging**: All failures tracked with details  
✅ **Preview First**: Always preview before sending  
✅ **Success Stats**: Shows sent/failed counts after completion

### Manual Safety Checks

1. **Preview First**: Always click "Preview Recipients" before sending
2. **Check Count**: Verify recipient count matches expectation
3. **Start Small**: Test with 1-2 registrations first
4. **Monitor Logs**: Check `whatsapp_send_log` table after sends
5. **Check WhatsApp**: Verify messages are delivered properly

---

## 🔍 TROUBLESHOOTING

### Issue: "No registrations found"

**Causes**:
- Mobile numbers missing/empty in database
- Wrong registration IDs
- Filters too restrictive

**Solution**:
```sql
-- Check if mobile exists
SELECT registration_id, name, mobile 
FROM registrations 
WHERE registration_id = 'ANT05V6006';

-- Check how many have mobile
SELECT COUNT(*) FROM registrations 
WHERE mobile IS NOT NULL AND mobile != '';
```

---

### Issue: "Failed to send to some registrations"

**Causes**:
- Invalid mobile numbers
- WhatsApp API errors
- Rate limiting

**Solution**:
1. Check `results.errors` array in response
2. View `whatsapp_send_log` table for error details
3. Fix mobile numbers in database
4. Retry failed registrations using "Selected IDs" mode

---

### Issue: "WhatsApp not using latest template"

**Causes**:
- Template v4 not approved yet
- Code not updated after approval

**Solution**:
```javascript
// Check current template in api/send-whatsapp-confirmation.js
const templateName = 'registration_confirmation_v2'; // Change to v4 after approval
```

---

## 📋 CHECKLIST

### Before First Send

- [ ] 680 records imported to staging table
- [ ] VIP sponsor contact info updated (47 records)
- [ ] Sponsors verified and merged to production
- [ ] WhatsApp template v4 approved (or using v2 for now)
- [ ] Test send to 1 registration successful
- [ ] Admin interface accessible at `/admin/send-whatsapp.html`

### For Each Bulk Send

- [ ] Preview recipients first
- [ ] Verify recipient count
- [ ] Check mobile numbers present
- [ ] Confirm send mode is correct
- [ ] Monitor success rate after send
- [ ] Check error logs if failures occur
- [ ] Verify WhatsApp messages delivered

---

## 📞 SUPPORT

**For Issues**:
- Check `whatsapp_send_log` table for logs
- View error details in admin interface
- Test with single registration first
- Verify mobile numbers in database

**Contact**: +91 78920 45223 (as per template v4 footer)

---

## 🎉 SUMMARY

**What You Can Do Now**:
1. ✅ Send to all VIP sponsors (47 records)
2. ✅ Send to specific registration IDs
3. ✅ Send to all registrations with filters
4. ✅ Resend to any individual registration
5. ✅ Track all sends in database logs
6. ✅ View success/failure statistics

**Two Ways to Send**:
1. Admin web interface: `https://sneha2026.in/admin/send-whatsapp.html`
2. API endpoint: `POST /api/send-manual-confirmations`

**Completely Separate From**:
- Automatic payment confirmation (that still works as before)
- No changes needed to payment flow

---

**Status**: ✅ Ready to use  
**Created**: November 14, 2025  
**Files Added**:
- `api/send-manual-confirmations.js` - Bulk send API
- `api/preview-recipients.js` - Preview API
- `admin/send-whatsapp.html` - Admin interface
- `database/whatsapp-send-log-table.sql` - Logging table
- `SEND_MANUAL_WHATSAPP_GUIDE.md` - This documentation
