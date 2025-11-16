const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.POSTGRES_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function checkRotEntry() {
  try {
    const result = await pool.query(`
      SELECT registration_id, name, mobile, club, zone, registration_type, payment_status, order_id
      FROM registrations 
      WHERE registration_id = 'ROT54V0694'
    `);
    
    console.log('\n🔍 ROT54V0694 Registration Details:');
    if (result.rows.length > 0) {
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('❌ Not found');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkRotEntry();
