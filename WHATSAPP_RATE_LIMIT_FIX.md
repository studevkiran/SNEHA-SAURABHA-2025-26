# WhatsApp Frequency Capping Fix - Nov 25, 2025

## Problem
- WhatsApp messages not being sent
- Infobip error: **Frequency capping limit reached (code 7032)**
- Status: **UNDELIVERABLE_NOT_DELIVERED**
- No logs appearing in Infobip dashboard

## Root Cause
Infobip trial accounts have **rate limits** to prevent spam:
- **Maximum: ~30-60 messages per minute**
- **Daily limit: varies by trial account**
- When exceeded, returns error 7032

## Solution Implemented

### 1. **Rate Limiting Added** ✅
- Automatic 2-second delay between each message
- Prevents sending too fast
- Built into `api/send-whatsapp-confirmation.js`

### 2. **Retry Logic with Exponential Backoff** ✅
- Automatically retries failed messages (up to 3 attempts)
- Waits progressively longer: 3s → 6s → 9s
- Handles temporary rate limit errors

### 3. **Batch Sending Tool** ✅
- Admin page: `/admin/batch-whatsapp.html`
- Sends in controlled batches (10 messages)
- 30-second pause between batches
- Prevents overwhelming Infobip

## How to Use

### For Today's Registrations (Nov 25, 2025)

1. **Open Batch Sender**:
   ```
   https://sneha2026.in/admin/batch-whatsapp.html
   ```

2. **Configure Settings**:
   - Date: `2025-11-25` (pre-filled)
   - Batch Size: `10` (recommended)
   - Delay: `30` seconds (recommended)

3. **Click "Start Sending"**:
   - Wait for completion (may take 15-20 minutes for ~30 registrations)
   - Monitor progress bar
   - Check results summary

### For Individual Resend

Use existing resend button in admin dashboard:
- It now includes rate limiting automatically
- Will retry up to 3 times if rate limited

## Updated Files

1. **`api/send-whatsapp-confirmation.js`**
   - Added rate limiter (2s between messages)
   - Added retry logic with exponential backoff
   - Handles error code 7032 gracefully

2. **`api/admin/send-batch-whatsapp.js`** (NEW)
   - Batch processing API endpoint
   - Sends in controlled waves
   - Detailed error reporting

3. **`admin/batch-whatsapp.html`** (NEW)
   - User-friendly batch sender interface
   - Progress tracking
   - Error display

## Recommended Settings

### For Production Use:
```javascript
Rate Limiter:
- Min delay: 2000ms (2 seconds)
- Max rate: 30 messages/minute

Batch Settings:
- Batch size: 10 messages
- Delay between batches: 30 seconds
- This = 20 messages/minute (safe rate)
```

### For Trial Account:
```javascript
Conservative Settings:
- Batch size: 5 messages
- Delay: 60 seconds between batches
- This = 5 messages/minute (very safe)
```

## Testing

1. **Test Single Message**:
   ```bash
   curl -X POST https://sneha2026.in/api/send-whatsapp-confirmation \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "mobile": "917892045223",
       "registrationId": "TEST001",
       "registrationType": "Rotarian",
       "amount": 5000,
       "mealPreference": "Veg",
       "tshirtSize": "L",
       "clubName": "Test Club",
       "orderId": "TEST001"
     }'
   ```

2. **Check Logs**:
   ```bash
   vercel logs --follow
   ```

## Important Notes

⚠️ **Trial Account Limitations**:
- Infobip trial has daily sending limits
- If still hitting 7032, contact Infobip to increase limits
- Consider upgrading to paid plan for production

⚠️ **Don't Send Too Fast**:
- Even with rate limiting, don't manually trigger multiple sends
- Use the batch tool for bulk operations
- Space out manual resends by at least 2 seconds

⚠️ **Monitor Infobip Dashboard**:
- Check if template is still approved
- Verify account status
- Check remaining trial credits

## Upgrade Path

If rate limits continue to be an issue:

1. **Contact Infobip Support**:
   - Request higher rate limits for trial
   - Or upgrade to paid account

2. **Alternative: Switch to Gupshup**:
   - Set `WHATSAPP_PROVIDER=gupshup` in environment
   - Gupshup has higher limits for India
   - Better pricing: ₹0.25-0.35/message

## Support

If issues persist:
1. Check Infobip dashboard for account status
2. Verify template approval status
3. Check environment variables are set correctly
4. Contact Infobip support with error logs

---

**Status**: ✅ Fixed and deployed
**Date**: November 25, 2025
**Next Steps**: Use batch sender for today's registrations
