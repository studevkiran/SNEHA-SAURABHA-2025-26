// Fix wrong zones in database - Update ALL registrations to correct zones
const { getZoneForClub } = require('./lib/zone-mapping');
const { Pool } = require('pg');

require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixAllZones() {
  try {
    console.log('🔧 Fixing ALL zone mappings in database...\n');
    
    // Get all registrations
    const result = await pool.query('SELECT registration_id, club, zone FROM registrations ORDER BY registration_id');
    
    let fixed = 0;
    let correct = 0;
    let errors = 0;
    
    for (const row of result.rows) {
      const correctZone = getZoneForClub(row.club);
      
      if (row.zone !== correctZone) {
        console.log(`❌ ${row.registration_id}: ${row.club} → ${row.zone} (should be ${correctZone})`);
        
        // Update the zone
        await pool.query(
          'UPDATE registrations SET zone = $1 WHERE registration_id = $2',
          [correctZone, row.registration_id]
        );
        
        console.log(`   ✅ Fixed to ${correctZone}`);
        fixed++;
      } else {
        correct++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Already correct: ${correct}`);
    console.log(`   🔧 Fixed: ${fixed}`);
    console.log(`   ❌ Errors: ${errors}`);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

fixAllZones();
