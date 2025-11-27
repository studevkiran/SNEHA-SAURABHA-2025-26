#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const handler = require('./api/send-whatsapp-confirmation.js');

const testData = {
  name: 'Test User',
  mobile: '9353469919',
  email: 'test@example.com',
  registrationId: 'TEST-' + Date.now(),
  registrationType: 'Rotarian',
  amount: 7500,
  mealPreference: 'Veg',
  tshirtSize: 'L',
  clubName: 'Mysore',
  orderId: 'TEST-ORDER-' + Date.now()
};

console.log('🧪 Testing WhatsApp send to 9353469919...\n');

const mockReq = {
  method: 'POST',
  body: testData
};

const mockRes = {
  status: (code) => ({
    json: (data) => {
      console.log('\n✅ Status:', code);
      console.log('📋 Response:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('\n✅ Message sent successfully!');
        console.log('Check Infobip dashboard to verify from/to fields');
      } else {
        console.log('\n❌ Failed to send message');
      }
      
      process.exit(code === 200 ? 0 : 1);
    }
  })
};

handler(mockReq, mockRes).catch(err => {
  console.error('\n❌ Error:', err.message);
  console.error(err);
  process.exit(1);
});
