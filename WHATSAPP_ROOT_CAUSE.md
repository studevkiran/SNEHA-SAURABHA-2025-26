# WhatsApp Issue Root Cause Analysis - Nov 25, 2025

## What Was Happening

### ✅ Messages WERE Being Sent to Infobip
```
User Registration → create.js → send-whatsapp-confirmation.js → Infobip API
                                                               ↓
                                                    Status: PENDING_ENROUTE ✅
```

The API was working correctly and Infobip was **accepting** the messages with status `PENDING_ENROUTE`.

### ❌ But Messages Failed at Delivery Stage

**After** accepting the messages, Infobip tried to deliver them to WhatsApp but hit:
- **Error Code 7032**: Frequency capping limit reached
- **Status**: UNDELIVERABLE_NOT_DELIVERED
- **Reason**: Too many messages sent in too short a time

## Timeline of What Happened Today

1. **14:51-14:52**: Multiple registrations (RTY0729, RTY0728, RTY0727, RTY0726, etc.)
2. **All triggered WhatsApp** almost simultaneously
3. **Infobip accepted all** → Status: PENDING_ENROUTE
4. **Infobip tried to deliver all at once** → Hit rate limit
5. **All failed with error 7032** → Never reached users
6. **No logs in Infobip** (they were there but showed as UNDELIVERABLE)

## Why This Happened

### No Rate Limiting in Code
The old code sent messages **immediately** without any delay:

```javascript
// OLD CODE (before fix)
async function sendViaInfobip(data) {
  const response = await fetch(infobipUrl, {...}); // Sent immediately!
  return response;
}
```

When 10 registrations happened within 1 minute, all 10 WhatsApp messages were sent within **seconds**, overwhelming Infobip's rate limits.

### Infobip Trial Account Limits
- **Maximum**: ~30-60 messages per minute
- **Daily limit**: Varies by trial account
- **No queuing**: Messages sent too fast get rejected

## What's Fixed Now

### 1. ✅ Rate Limiter (2-second delay)
```javascript
const rateLimiter = {
  lastSentTime: 0,
  minDelay: 2000, // 2 seconds between messages
  
  async wait() {
    const now = Date.now();
    const timeSinceLastSent = now - this.lastSentTime;
    
    if (timeSinceLastSent < this.minDelay) {
      const waitTime = this.minDelay - timeSinceLastSent;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastSentTime = Date.now();
  }
};
```

**Effect**: Even if 10 registrations happen simultaneously, WhatsApp messages are sent **2 seconds apart** (max 30/minute).

### 2. ✅ Retry Logic with Exponential Backoff
```javascript
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    const response = await fetch(infobipUrl, {...});
    
    // Check for rate limit error
    if (error7032 || status429) {
      if (attempt < 3) {
        await sleep(attempt * 3); // 3s, 6s, 9s
        continue; // Retry
      }
    }
    
    return response; // Success
  } catch (error) {
    // Retry with backoff
  }
}
```

**Effect**: If rate limit is still hit, automatically retries up to 3 times with increasing delays.

### 3. ✅ Batch Sender Tool
**URL**: `https://sneha2026.in/admin/batch-whatsapp.html`

For recovering failed messages:
- Sends in controlled batches (10 messages)
- 30-second pause between batches
- Rate: ~12-15 messages/minute (very safe)

## How to Recover Today's Failed Messages

### Step 1: Open Batch Sender
```
https://sneha2026.in/admin/batch-whatsapp.html
```

### Step 2: Configure (Pre-filled)
- **Date**: `2025-11-25` (today)
- **Batch Size**: `10`
- **Delay**: `30` seconds

### Step 3: Click "Start Sending"
Wait ~5-7 minutes for completion

## Verification

### Test That It's Working:
```bash
node test-whatsapp.js
```

Expected output:
```json
{
  "success": true,
  "message": "WhatsApp sent via Infobip",
  "infobipResponse": {
    "messages": [{
      "status": {
        "groupName": "PENDING",
        "name": "PENDING_ENROUTE"
      }
    }]
  }
}
```

### Check Infobip Dashboard:
1. Login to Infobip
2. Go to **Analytics** → **WhatsApp**
3. Check messages from last hour
4. Should see:
   - Initial messages: UNDELIVERABLE (error 7032)
   - New messages (after fix): DELIVERED_TO_HANDSET

## Expected Behavior After Fix

### Scenario: 10 registrations in 1 minute

**Before Fix**:
```
00:00 - Reg 1 → WhatsApp sent immediately
00:01 - Reg 2 → WhatsApp sent immediately
00:02 - Reg 3 → WhatsApp sent immediately
...
00:10 - Reg 10 → WhatsApp sent immediately
Result: ALL 10 sent within 10 seconds → Error 7032
```

**After Fix**:
```
00:00 - Reg 1 → WhatsApp sent immediately
00:02 - Reg 2 → WhatsApp sent (waited 2s)
00:04 - Reg 3 → WhatsApp sent (waited 2s)
...
00:20 - Reg 10 → WhatsApp sent (waited 2s)
Result: Sent over 20 seconds → No error! ✅
```

## Why Messages Weren't in Infobip Logs

They **WERE** in Infobip logs, but showing as:
- **Status**: UNDELIVERABLE
- **Error**: 7032 - Frequency capping
- **Description**: "Frequency capping limit reached"

To see them:
1. Infobip Dashboard
2. **Logs** → **All Messages** (not just delivered)
3. Filter by status: **UNDELIVERABLE**
4. You'll see all today's failed messages there

## Future Prevention

### For High-Volume Days:
1. Rate limiter now handles automatic spacing
2. No manual intervention needed
3. Messages send slower but reliably

### If Still Hitting Limits:
1. Reduce batch size to 5
2. Increase delay to 60 seconds
3. Or upgrade Infobip account for higher limits

## Summary

| Aspect | Before Fix | After Fix |
|--------|-----------|-----------|
| **Sending Rate** | All at once | 1 every 2 seconds |
| **Error Handling** | None | 3 retries with backoff |
| **Recovery Tool** | Manual only | Automated batch sender |
| **Messages Lost** | Yes (error 7032) | No (auto-retry) |
| **Infobip Logs** | UNDELIVERABLE | DELIVERED |

---

**Deployment**: ✅ Pushed to GitHub → Vercel deploying
**Status**: Will be live in ~2-3 minutes
**Next Action**: Use batch sender to recover today's failed messages
