const { Pool } = require('pg');

const connectionString = process.argv[2];

if (!connectionString) {
  console.error('❌ Usage: node update-rot-to-2026rty.js <POSTGRES_URL>');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function updateROTFormat() {
  try {
    // First, check what the next available 2026RTY ID should be
    const maxResult = await pool.query(`
      SELECT registration_id,
             CAST(SUBSTRING(registration_id FROM '.{4}$') AS INTEGER) as num_part
      FROM registrations 
      WHERE registration_id LIKE '2026RTY%'
      ORDER BY num_part DESC 
      LIMIT 1
    `);
    
    let nextNumber = 1;
    if (maxResult.rows.length > 0) {
      nextNumber = maxResult.rows[0].num_part + 1;
    }
    
    const newRegistrationId = '2026RTY' + nextNumber.toString().padStart(4, '0');
    
    console.log(`\n🔄 Updating ROT54V0694 to unified format...`);
    console.log(`📊 Current max 2026RTY ID: ${maxResult.rows[0]?.registration_id || 'None'}`);
    console.log(`🆕 New ID will be: ${newRegistrationId}`);
    console.log('');
    
    // Update the registration ID
    const result = await pool.query(
      `UPDATE registrations 
       SET registration_id = $1
       WHERE registration_id = 'ROT54V0694'
       RETURNING registration_id, name, mobile, club, registration_type, registration_amount`,
      [newRegistrationId]
    );
    
    if (result.rowCount > 0) {
      console.log(`✅ Successfully updated ROT54V0694 → ${newRegistrationId}`);
      console.log(`   Name: ${result.rows[0].name}`);
      console.log(`   Mobile: ${result.rows[0].mobile}`);
      console.log(`   Club: ${result.rows[0].club}`);
      console.log(`   Type: ${result.rows[0].registration_type}`);
      console.log(`   Amount: ₹${result.rows[0].registration_amount}`);
    } else {
      console.log(`⚠️  ROT54V0694 not found`);
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

updateROTFormat();
