# 📱 SEND WHATSAPP - QUICK REFERENCE

## 🎯 ONE-MINUTE GUIDE

### Option 1: Admin Interface (EASIEST) ⭐

**URL**: `https://sneha2026.in/admin/send-whatsapp.html`

**Steps**:
1. Click send mode (Sponsors / Selected IDs / All / Single)
2. Enter details if needed
3. Click "Preview Recipients"
4. Click "Send WhatsApp Confirmations"
5. Done! ✅

---

### Option 2: API Call (ADVANCED)

```bash
# Send to all sponsors
curl -X POST https://sneha2026.in/api/send-manual-confirmations \
  -H "Content-Type: application/json" \
  -d '{"mode": "sponsors"}'

# Send to specific IDs
curl -X POST https://sneha2026.in/api/send-manual-confirmations \
  -H "Content-Type: application/json" \
  -d '{"mode": "selected", "registrationIds": ["ANT05V6006", "2026RTY0001"]}'

# Send to all Rotarians
curl -X POST https://sneha2026.in/api/send-manual-confirmations \
  -H "Content-Type: application/json" \
  -d '{"mode": "all", "filters": {"type": "Rotarian"}}'

# Resend to one person
curl -X POST https://sneha2026.in/api/send-manual-confirmations \
  -H "Content-Type: application/json" \
  -d '{"mode": "single", "registrationIds": ["ANT05V6006"]}'
```

---

## 🏆 4 SEND MODES

| Mode | Use Case | What You Need |
|------|----------|---------------|
| **VIP Sponsors** | Send to all Patron/Platinum/Gold/Silver | Just click! |
| **Selected IDs** | Cherry-pick specific people | List of registration IDs |
| **All with Filters** | Bulk send with type/amount filter | Optional filters |
| **Single User** | Send/resend to one person | One registration ID |

---

## ⚡ COMMON SCENARIOS

### "Send to all 47 sponsors now"
→ Admin Interface → VIP Sponsors → Preview → Send

### "Resend to one person"
→ Admin Interface → Single User → Enter ID → Send

### "Send to 10 specific people"
→ Admin Interface → Selected IDs → Paste IDs → Send

### "Send to all Rotarians"
→ Admin Interface → All with Filters → Type: Rotarian → Send

---

## 🛡️ SAFETY

- ✅ Always previews before sending
- ✅ Only sends if mobile number exists
- ✅ No duplicates in same batch
- ✅ Auto rate limiting (100ms between messages)
- ✅ Shows success/failed counts
- ✅ Logs everything to database

---

## 📊 CHECK LOGS

```sql
-- View recent sends
SELECT * FROM whatsapp_send_log ORDER BY sent_at DESC LIMIT 10;

-- View statistics
SELECT * FROM whatsapp_send_stats;
```

---

## 🔧 SETUP REQUIRED (ONE TIME)

```bash
# 1. Create logging table
psql $POSTGRES_URL -f database/whatsapp-send-log-table.sql

# 2. That's it! Ready to use.
```

---

## 📁 FILES CREATED

- `api/send-manual-confirmations.js` - Bulk send API
- `api/preview-recipients.js` - Preview API  
- `admin/send-whatsapp.html` - Admin interface
- `database/whatsapp-send-log-table.sql` - Logging
- `SEND_MANUAL_WHATSAPP_GUIDE.md` - Full docs

---

## ❓ WHEN TO USE

✅ **Use This For**:
- Manually imported 680 registrations
- Resending confirmations to anyone
- Sending to sponsors after updating their info
- Bulk WhatsApp sends with control

❌ **Don't Use For**:
- Automatic payment confirmations (already works!)
- That's handled by payment-callback flow

---

**Status**: ✅ Ready to use  
**Admin URL**: https://sneha2026.in/admin/send-whatsapp.html  
**Full Docs**: SEND_MANUAL_WHATSAPP_GUIDE.md
