const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateSingleRegistration() {
  try {
    console.log('🔄 Updating zone for registration RWS54V0693...');
    
    const result = await pool.query(
      `UPDATE registrations 
       SET zone = 'Zone 5' 
       WHERE registration_id = 'RWS54V0693'
       RETURNING registration_id, name, club, zone`,
      []
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Successfully updated:');
      console.log(result.rows[0]);
    } else {
      console.log('❌ Registration not found');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateSingleRegistration();
