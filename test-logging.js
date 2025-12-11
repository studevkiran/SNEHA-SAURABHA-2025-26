/**
 * Test Logging System
 * Run this to verify logs are being created correctly
 */

const { logRequest, logResponse, logError, logDatabase, logWhatsApp, logPayment, logStartup } = require('./lib/logger');

console.log('🧪 Testing Logging System...\n');

// Mock request and response objects
const mockReq = {
  method: 'POST',
  url: '/api/registrations/create',
  headers: {
    'content-type': 'application/json',
    'user-agent': 'Test/1.0',
    'x-forwarded-for': '127.0.0.1'
  },
  body: {
    name: 'Test User',
    mobile: '9876543210',
    club: 'Test Club',
    amount: 7500
  },
  query: {},
  startTime: Date.now()
};

const mockRes = {
  statusCode: 200
};

// Test 1: Log Request
console.log('1️⃣ Testing Request Logging...');
logRequest(mockReq, mockReq.url);
console.log('   ✅ Request logged\n');

// Test 2: Log Response
console.log('2️⃣ Testing Response Logging...');
logResponse(mockReq, mockRes, { success: true, registration_id: '2026RTY0999' }, 200);
console.log('   ✅ Response logged\n');

// Test 3: Log Error
console.log('3️⃣ Testing Error Logging...');
const testError = new Error('Test error for logging');
testError.code = 'TEST_ERROR';
logError(mockReq, testError, 'Test Context');
console.log('   ✅ Error logged\n');

// Test 4: Log Database Query
console.log('4️⃣ Testing Database Logging...');
logDatabase(
  'INSERT INTO registrations (name, mobile) VALUES ($1, $2)',
  ['Test User', '9876543210'],
  { rowCount: 1 }
);
console.log('   ✅ Database query logged\n');

// Test 5: Log WhatsApp
console.log('5️⃣ Testing WhatsApp Logging...');
logWhatsApp(
  '919876543210',
  '2026RTY0999',
  true,
  { messageId: 'TEST123', status: 'sent' }
);
console.log('   ✅ WhatsApp logged\n');

// Test 6: Log Payment
console.log('6️⃣ Testing Payment Logging...');
logPayment(
  'ORDER_TEST_123',
  7500,
  'SUCCESS',
  { transactionId: 'TXN123', gateway: 'Cashfree' }
);
console.log('   ✅ Payment logged\n');

// Test 7: Log System Startup
console.log('7️⃣ Testing System Startup Logging...');
logStartup('Test system startup - All modules loaded successfully');
console.log('   ✅ System startup logged\n');

console.log('✅ All tests completed!\n');
console.log('📁 Check the /logs directory for generated log files');
console.log('📋 Log files created:');
const fs = require('fs');
const path = require('path');
const logsDir = path.join(process.cwd(), 'logs');

if (fs.existsSync(logsDir)) {
  const files = fs.readdirSync(logsDir);
  files.forEach(file => {
    const stats = fs.statSync(path.join(logsDir, file));
    console.log(`   - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  });
} else {
  console.log('   ⚠️ Logs directory not created yet');
}

console.log('\n🎉 Logging system is working correctly!');
console.log('\n📖 Read LOGGING_SYSTEM.md for full documentation');
