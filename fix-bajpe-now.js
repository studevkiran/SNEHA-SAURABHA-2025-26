/**
 * Direct fix for Bajpe registration club_id
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixBajpeRegistration() {
  try {
    console.log('🔧 Fixing Bajpe registration 2026RTY0794...');
    console.log('Updating club_id from 2 (Baikampady) to 3 (Bajpe)...\n');
    
    // Update club_id
    const result = await pool.query(
      `UPDATE registrations 
       SET club_id = 3 
       WHERE registration_id = '2026RTY0794' 
       RETURNING registration_id, name, club, club_id`
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Registration not found');
      process.exit(1);
    }
    
    console.log('✅ Updated:', result.rows[0]);
    
    // Verify with zone info
    const verifyResult = await pool.query(
      `SELECT r.registration_id, r.name, r.club, r.club_id, c.zone
       FROM registrations r
       LEFT JOIN clubs c ON r.club_id = c.id
       WHERE r.registration_id = '2026RTY0794'`
    );
    
    console.log('\n✅ Verification:');
    console.log(verifyResult.rows[0]);
    console.log('\n✅ Zone should now be Zone 1');
    console.log('✅ Bajpe registration will now show in Zone 1 breakdown');
    
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

fixBajpeRegistration();
