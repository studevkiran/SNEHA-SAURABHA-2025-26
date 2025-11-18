// Manual registration recovery for ORDER_1763458065882_121
// Customer: Eulalia D'souza
// Payment: ₹8000 paid successfully on 18 Nov 2025

const { Pool } = require('pg');

async function recoverRegistration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔍 Checking for existing registration...');
    
    // Check if order exists in payment_attempts
    const attemptCheck = await pool.query(
      'SELECT * FROM payment_attempts WHERE order_id = $1',
      ['ORDER_1763458065882_121']
    );
    
    console.log('Payment Attempt:', attemptCheck.rows.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (attemptCheck.rows.length > 0) {
      console.log(JSON.stringify(attemptCheck.rows[0], null, 2));
    }
    
    // Check if registration exists
    const regCheck = await pool.query(
      `SELECT * FROM registrations 
       WHERE mobile = $1 OR email = $2 OR order_id = $3
       ORDER BY created_at DESC LIMIT 1`,
      ['9845253293', 'eula.dsouza@liatravels.com', 'ORDER_1763458065882_121']
    );
    
    console.log('\nRegistration:', regCheck.rows.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (regCheck.rows.length > 0) {
      console.log(JSON.stringify(regCheck.rows[0], null, 2));
    }
    
    if (regCheck.rows.length === 0 && attemptCheck.rows.length > 0) {
      console.log('\n⚠️ ISSUE DETECTED: Payment attempt exists but no registration!');
      console.log('This happens when:');
      console.log('1. Cashfree webhook was not received');
      console.log('2. Webhook processing failed');
      console.log('3. Database transaction failed');
      
      const attempt = attemptCheck.rows[0];
      console.log('\n📋 Payment Attempt Details:');
      console.log('Order ID:', attempt.order_id);
      console.log('Name:', attempt.name);
      console.log('Mobile:', attempt.mobile);
      console.log('Email:', attempt.email);
      console.log('Amount:', attempt.amount);
      console.log('Status:', attempt.payment_status);
      console.log('Created:', attempt.created_at);
      
      // Manual recovery option
      console.log('\n🔧 RECOVERY OPTIONS:');
      console.log('1. Verify payment status with Cashfree API');
      console.log('2. If paid, manually create registration');
      console.log('3. Send WhatsApp confirmation');
      console.log('4. Generate receipt');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

recoverRegistration();
