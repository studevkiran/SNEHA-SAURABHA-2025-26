// Quick script to check payment status
const https = require('https');

const orderId = 'ORDER_1763458065882_121';

// Check payment attempt
https.get(`https://sneha2026.in/api/cashfree/check-payment?order_id=${orderId}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Payment Check Result:');
    console.log(JSON.parse(data));
  });
}).on('error', err => console.error('Error:', err));

// Check registrations
setTimeout(() => {
  https.get('https://sneha2026.in/api/registrations/list', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const result = JSON.parse(data);
      if (result.success && result.data) {
        const found = result.data.registrations.find(r => 
          r.mobile === '9845253293' || 
          r.email === 'eula.dsouza@liatravels.com' ||
          r.order_id === orderId
        );
        console.log('\nRegistration Found:', found || 'NOT FOUND');
      }
    });
  }).on('error', err => console.error('Error:', err));
}, 1000);
