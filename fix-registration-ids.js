const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateRegistrationIds() {
  try {
    console.log('🔧 Updating registration IDs...\n');
    
    // Update RAC54N1532 → RAC54V0690 (first registration)
    const result1 = await pool.query(`
      UPDATE registrations 
      SET registration_id = 'RAC54V0690'
      WHERE registration_id = 'RAC54N1532'
      RETURNING *
    `);
    
    if (result1.rows.length > 0) {
      console.log('✅ Updated:', result1.rows[0].name);
      console.log('   RAC54N1532 → RAC54V0690');
      console.log('   Mobile:', result1.rows[0].mobile);
      console.log('   Email:', result1.rows[0].email);
    }
    
    console.log('');
    
    // Update RAC54V6407 → RAC54V0691 (second registration)
    const result2 = await pool.query(`
      UPDATE registrations 
      SET registration_id = 'RAC54V0691'
      WHERE registration_id = 'RAC54V6407'
      RETURNING *
    `);
    
    if (result2.rows.length > 0) {
      console.log('✅ Updated:', result2.rows[0].name);
      console.log('   RAC54V6407 → RAC54V0691');
      console.log('   Mobile:', result2.rows[0].mobile);
      console.log('   Email:', result2.rows[0].email);
    }
    
    console.log('\n✅ Both registration IDs updated successfully!');
    console.log('📋 Next registration will be: RAC54V0692\n');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

updateRegistrationIds();
