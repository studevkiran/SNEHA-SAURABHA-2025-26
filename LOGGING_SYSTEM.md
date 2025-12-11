# 📝 Logging System Documentation

## Overview
Comprehensive logging system that captures all API requests, responses, errors, database queries, WhatsApp messages, and payment transactions.

## Log Files Location
All logs are stored in the `/logs` directory with daily rotation:

```
logs/
├── requests-2025-12-12.log      # All incoming API requests
├── responses-2025-12-12.log     # All API responses
├── errors-2025-12-12.log        # All errors and exceptions
├── database-2025-12-12.log      # All database queries
├── whatsapp-2025-12-12.log      # WhatsApp message logs
├── payments-2025-12-12.log      # Payment transaction logs
└── system-2025-12-12.log        # System events and startups
```

## Log Types

### 1. **Request Logs** (`requests-YYYY-MM-DD.log`)
Captures every incoming API request with:
- Timestamp
- HTTP method (GET, POST, PUT, DELETE)
- Endpoint URL
- Request headers
- Request body/payload
- Query parameters
- Client IP address

### 2. **Response Logs** (`responses-YYYY-MM-DD.log`)
Captures every API response with:
- Timestamp
- HTTP status code (200, 400, 500, etc.)
- Response data
- Response time (milliseconds)
- Success/failure indicator

### 3. **Error Logs** (`errors-YYYY-MM-DD.log`)
Captures all errors with:
- Timestamp
- Error message
- Stack trace
- Error context
- Request details that caused the error

### 4. **Database Logs** (`database-YYYY-MM-DD.log`)
Captures all database operations:
- SQL queries
- Query parameters
- Row count affected
- Success/failure status
- Error details if failed

### 5. **WhatsApp Logs** (`whatsapp-YYYY-MM-DD.log`)
Captures WhatsApp message sending:
- Mobile number
- Registration ID
- Success/failure status
- API response
- Timestamp

### 6. **Payment Logs** (`payments-YYYY-MM-DD.log`)
Captures payment transactions:
- Order ID
- Amount
- Payment status
- Transaction data
- Timestamp

### 7. **System Logs** (`system-YYYY-MM-DD.log`)
Captures system events:
- Server startup
- Configuration changes
- Scheduled tasks
- System maintenance

## Usage

### Automatic Logging (Middleware)

Wrap any API endpoint with the logger middleware:

```javascript
const apiLogger = require('../../lib/api-logger-middleware');

const handler = async (req, res) => {
  // Your API logic here
  res.json({ success: true });
};

module.exports = apiLogger(handler);
```

### Manual Logging

Use specific logging functions:

```javascript
const { logRequest, logResponse, logError, logDatabase, logWhatsApp, logPayment } = require('../lib/logger');

// Log a request
logRequest(req, '/api/registrations/create');

// Log a response
logResponse(req, res, { success: true, data: result }, 200);

// Log an error
logError(req, error, 'Registration Creation Failed');

// Log a database query
logDatabase('SELECT * FROM registrations WHERE id = $1', [123], result);

// Log WhatsApp message
logWhatsApp('919876543210', '2026RTY0123', true, response);

// Log payment
logPayment('ORDER123', 7500, 'SUCCESS', transactionData);
```

## Viewing Logs

### Option 1: Direct File Access
SSH into server and view logs:
```bash
cd /path/to/project/logs
tail -f requests-2025-12-12.log
```

### Option 2: API Endpoints

**List all available logs:**
```
GET /api/admin/list-logs
```

Response:
```json
{
  "success": true,
  "totalFiles": 7,
  "totalSizeKB": "1234.56",
  "files": [...],
  "byType": { "requests": [...], "errors": [...] },
  "types": ["requests", "responses", "errors", "database", "whatsapp", "payments", "system"]
}
```

**View specific log:**
```
GET /api/admin/view-logs?type=requests&date=2025-12-12&lines=100
```

Parameters:
- `type`: Log type (requests, responses, errors, database, whatsapp, payments, system)
- `date`: Date in YYYY-MM-DD format (defaults to today)
- `lines`: Number of recent lines to return (defaults to 100)

Response:
```json
{
  "success": true,
  "logType": "requests",
  "date": "2025-12-12",
  "totalLines": 500,
  "returnedLines": 100,
  "logs": "..."
}
```

### Option 3: Vercel Dashboard
For production on Vercel:
1. Go to https://vercel.com/your-project
2. Navigate to: Deployments → [Select deployment] → Function Logs
3. Filter by function name or search for specific text

## Log Rotation & Cleanup

Logs are automatically:
- **Rotated daily** - New file created each day
- **Cleaned after 30 days** - Old logs are automatically deleted
- **Organized by type** - Easy to find specific log types

To manually clean old logs:
```javascript
const { cleanOldLogs } = require('./lib/logger');
cleanOldLogs(); // Deletes logs older than 30 days
```

## Security Considerations

⚠️ **Important:**
1. **Never commit log files** - Logs are in `.gitignore`
2. **Protect log viewer endpoints** - Add authentication
3. **Sanitize sensitive data** - Don't log passwords, API keys
4. **Limit log retention** - Auto-delete after 30 days
5. **Monitor log size** - Large logs can fill disk space

## Production Deployment

### Vercel Deployment
Logs work automatically on Vercel serverless functions. However, for persistent logs:

1. Use external logging service (e.g., LogDNA, Papertrail, Logtail)
2. Or use Vercel's built-in logging (Deployments → Logs)

### Traditional Server (AWS, Railway, etc.)
Logs are stored in the `/logs` directory. Ensure:
- Write permissions for the app
- Sufficient disk space
- Regular cleanup of old logs
- Backup important logs

## Troubleshooting

**Logs not created?**
- Check write permissions on `/logs` directory
- Verify `lib/logger.js` is imported correctly
- Check console for "Failed to write log" errors

**Logs too large?**
- Reduce retention period (default: 30 days)
- Exclude verbose endpoints from logging
- Use log rotation more frequently

**Can't view logs via API?**
- Verify log file exists
- Check file path in error message
- Ensure correct date format (YYYY-MM-DD)

## Examples

### View Today's Errors
```bash
curl https://sneha2026.vercel.app/api/admin/view-logs?type=errors
```

### View Last 50 Requests
```bash
curl https://sneha2026.vercel.app/api/admin/view-logs?type=requests&lines=50
```

### List All Logs
```bash
curl https://sneha2026.vercel.app/api/admin/list-logs
```

### View Payment Logs from Specific Date
```bash
curl https://sneha2026.vercel.app/api/admin/view-logs?type=payments&date=2025-12-10
```

## Integration Status

✅ **Implemented:**
- Core logging library (`lib/logger.js`)
- API middleware (`lib/api-logger-middleware.js`)
- Log viewer API (`api/admin/view-logs.js`)
- Log listing API (`api/admin/list-logs.js`)
- Sample integration in `api/registrations/create.js`

🔄 **To Do:**
- Add middleware to all remaining API endpoints
- Add authentication to log viewer endpoints
- Integrate with external logging service (optional)
- Create admin dashboard UI for log viewing

## Support

For issues or questions:
- Check console logs for "Failed to write log" messages
- Verify `/logs` directory exists and is writable
- Contact: admin@sneha2026.in
