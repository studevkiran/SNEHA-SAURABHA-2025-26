/**
 * Centralized Logging System
 * Logs all API requests, responses, and errors
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('📁 Created logs directory:', logsDir);
}

// Log file paths
const getLogFilePath = (type) => {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(logsDir, `${type}-${date}.log`);
};

// Format timestamp
const timestamp = () => new Date().toISOString();

// Write to log file
const writeLog = (filePath, message) => {
  try {
    fs.appendFileSync(filePath, message + '\n', 'utf8');
  } catch (error) {
    console.error('❌ Failed to write log:', error.message);
  }
};

// Log API request
const logRequest = (req, endpoint) => {
  const logData = {
    timestamp: timestamp(),
    type: 'REQUEST',
    method: req.method,
    endpoint: endpoint || req.url,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      origin: req.headers['origin'],
      referer: req.headers['referer']
    },
    body: req.method === 'POST' || req.method === 'PUT' ? req.body : null,
    query: req.query || null,
    ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown'
  };

  const logMessage = `
${'='.repeat(80)}
🔵 ${logData.type} | ${logData.timestamp}
${'='.repeat(80)}
Method: ${logData.method}
Endpoint: ${logData.endpoint}
IP: ${logData.ip}
Headers: ${JSON.stringify(logData.headers, null, 2)}
${logData.body ? `Body: ${JSON.stringify(logData.body, null, 2)}` : ''}
${logData.query ? `Query: ${JSON.stringify(logData.query, null, 2)}` : ''}
`;

  writeLog(getLogFilePath('requests'), logMessage);
  console.log(`📝 Logged request: ${logData.method} ${logData.endpoint}`);
  
  return logData;
};

// Log API response
const logResponse = (req, res, data, statusCode) => {
  const logData = {
    timestamp: timestamp(),
    type: 'RESPONSE',
    method: req.method,
    endpoint: req.url,
    statusCode: statusCode || res.statusCode,
    success: statusCode ? (statusCode >= 200 && statusCode < 300) : (res.statusCode >= 200 && res.statusCode < 300),
    data: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
    responseTime: Date.now() - (req.startTime || Date.now())
  };

  const logMessage = `
${'='.repeat(80)}
🟢 ${logData.type} | ${logData.timestamp}
${'='.repeat(80)}
Method: ${logData.method}
Endpoint: ${logData.endpoint}
Status: ${logData.statusCode} ${logData.success ? '✅' : '❌'}
Response Time: ${logData.responseTime}ms
Data: ${logData.data}
`;

  writeLog(getLogFilePath('responses'), logMessage);
  console.log(`📝 Logged response: ${logData.statusCode} ${logData.endpoint} (${logData.responseTime}ms)`);
  
  return logData;
};

// Log error
const logError = (req, error, context = '') => {
  const logData = {
    timestamp: timestamp(),
    type: 'ERROR',
    method: req?.method || 'UNKNOWN',
    endpoint: req?.url || 'UNKNOWN',
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    },
    context: context,
    ip: req?.headers?.['x-forwarded-for'] || req?.connection?.remoteAddress || 'unknown'
  };

  const logMessage = `
${'='.repeat(80)}
🔴 ${logData.type} | ${logData.timestamp}
${'='.repeat(80)}
Method: ${logData.method}
Endpoint: ${logData.endpoint}
IP: ${logData.ip}
Context: ${logData.context}
Error: ${logData.error.message}
Stack: ${logData.error.stack}
`;

  writeLog(getLogFilePath('errors'), logMessage);
  console.error(`📝 Logged error: ${logData.error.message}`);
  
  return logData;
};

// Log database query
const logDatabase = (query, params, result, error = null) => {
  const logData = {
    timestamp: timestamp(),
    type: 'DATABASE',
    query: query,
    params: params,
    success: !error,
    rowCount: result?.rowCount || result?.rows?.length || 0,
    error: error ? { message: error.message, code: error.code } : null
  };

  const logMessage = `
${'='.repeat(80)}
💾 ${logData.type} | ${logData.timestamp}
${'='.repeat(80)}
Query: ${logData.query}
Params: ${JSON.stringify(logData.params, null, 2)}
Success: ${logData.success ? '✅' : '❌'}
Row Count: ${logData.rowCount}
${logData.error ? `Error: ${logData.error.message}` : ''}
`;

  writeLog(getLogFilePath('database'), logMessage);
  
  return logData;
};

// Log WhatsApp message
const logWhatsApp = (mobile, registrationId, success, response) => {
  const logData = {
    timestamp: timestamp(),
    type: 'WHATSAPP',
    mobile: mobile,
    registrationId: registrationId,
    success: success,
    response: response
  };

  const logMessage = `
${'='.repeat(80)}
📱 ${logData.type} | ${logData.timestamp}
${'='.repeat(80)}
Mobile: ${logData.mobile}
Registration ID: ${logData.registrationId}
Success: ${logData.success ? '✅' : '❌'}
Response: ${JSON.stringify(logData.response, null, 2)}
`;

  writeLog(getLogFilePath('whatsapp'), logMessage);
  console.log(`📝 Logged WhatsApp: ${logData.mobile} - ${logData.success ? 'Success' : 'Failed'}`);
  
  return logData;
};

// Log payment transaction
const logPayment = (orderId, amount, status, transactionData) => {
  const logData = {
    timestamp: timestamp(),
    type: 'PAYMENT',
    orderId: orderId,
    amount: amount,
    status: status,
    transactionData: transactionData
  };

  const logMessage = `
${'='.repeat(80)}
💳 ${logData.type} | ${logData.timestamp}
${'='.repeat(80)}
Order ID: ${logData.orderId}
Amount: ₹${logData.amount}
Status: ${logData.status}
Transaction Data: ${JSON.stringify(logData.transactionData, null, 2)}
`;

  writeLog(getLogFilePath('payments'), logMessage);
  console.log(`📝 Logged payment: ${logData.orderId} - ${logData.status}`);
  
  return logData;
};

// Clean old logs (keep last 30 days)
const cleanOldLogs = () => {
  try {
    const files = fs.readdirSync(logsDir);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted old log: ${file}`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to clean old logs:', error.message);
  }
};

// Log system startup
const logStartup = (message) => {
  const logMessage = `
${'='.repeat(80)}
🚀 SYSTEM STARTUP | ${timestamp()}
${'='.repeat(80)}
${message}
`;
  
  writeLog(getLogFilePath('system'), logMessage);
  console.log('📝 System startup logged');
};

module.exports = {
  logRequest,
  logResponse,
  logError,
  logDatabase,
  logWhatsApp,
  logPayment,
  cleanOldLogs,
  logStartup
};
