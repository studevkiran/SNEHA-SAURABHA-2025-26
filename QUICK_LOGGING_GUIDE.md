# 📝 Quick Logging Guide

## ✅ System is Ready!

Your logging system is now live and capturing:
- ✅ All API requests
- ✅ All API responses  
- ✅ All errors
- ✅ Database queries
- ✅ WhatsApp messages
- ✅ Payment transactions

## 📁 Where Are Logs Stored?

**Local Development:**
```
/Users/kiran/projects/SNEHA-SAURABHA-2025-26/logs/
```

**Production (Vercel):**
Logs are in memory (serverless) - use APIs to view:
- View logs: `https://sneha2026.vercel.app/api/admin/view-logs`
- List logs: `https://sneha2026.vercel.app/api/admin/list-logs`

## 🚀 Quick Commands

### View Today's Request Logs
```bash
curl "https://sneha2026.vercel.app/api/admin/view-logs?type=requests"
```

### View Today's Error Logs
```bash
curl "https://sneha2026.vercel.app/api/admin/view-logs?type=errors"
```

### View Payment Logs
```bash
curl "https://sneha2026.vercel.app/api/admin/view-logs?type=payments"
```

### List All Available Logs
```bash
curl "https://sneha2026.vercel.app/api/admin/list-logs"
```

### View Specific Date
```bash
curl "https://sneha2026.vercel.app/api/admin/view-logs?type=requests&date=2025-12-10"
```

### View Last 50 Lines Only
```bash
curl "https://sneha2026.vercel.app/api/admin/view-logs?type=errors&lines=50"
```

## 🔧 How to Add Logging to API

### Option 1: Automatic (Recommended)
Wrap your handler with the middleware:

```javascript
const apiLogger = require('../../lib/api-logger-middleware');

const handler = async (req, res) => {
  // Your code here
  res.json({ success: true });
};

module.exports = apiLogger(handler); // Auto-logs everything!
```

### Option 2: Manual
Import specific functions:

```javascript
const { logRequest, logResponse, logError } = require('../../lib/logger');

module.exports = async (req, res) => {
  logRequest(req, '/api/your-endpoint');
  
  try {
    // Your code
    const result = { success: true };
    logResponse(req, res, result, 200);
    res.json(result);
  } catch (error) {
    logError(req, error, 'Context info');
    res.status(500).json({ error: error.message });
  }
};
```

## 📊 Log Files by Type

| Log Type | Filename | Contains |
|----------|----------|----------|
| Requests | `requests-YYYY-MM-DD.log` | All incoming API calls |
| Responses | `responses-YYYY-MM-DD.log` | All API responses |
| Errors | `errors-YYYY-MM-DD.log` | Errors with stack traces |
| Database | `database-YYYY-MM-DD.log` | SQL queries & results |
| WhatsApp | `whatsapp-YYYY-MM-DD.log` | WhatsApp sends |
| Payments | `payments-YYYY-MM-DD.log` | Payment transactions |
| System | `system-YYYY-MM-DD.log` | System events |

## 🎯 Next Steps

1. **Deploy to Production** ✅ (Already done!)
2. **Add to More APIs**: Wrap remaining endpoints with `apiLogger()`
3. **Test Live**: Make a registration and check logs
4. **Monitor**: Check logs daily for errors

## 📖 Full Documentation

Read `LOGGING_SYSTEM.md` for complete details.

## 🧪 Test Locally

```bash
cd /Users/kiran/projects/SNEHA-SAURABHA-2025-26
node test-logging.js
ls -lh logs/
```

---

**Status**: ✅ ACTIVE & DEPLOYED  
**Created**: 12 Dec 2025  
**Version**: 1.0
