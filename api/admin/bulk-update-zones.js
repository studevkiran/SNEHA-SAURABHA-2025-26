const { Pool } = require('pg');
const { getZoneForClub } = require('../../lib/zone-mapping');

const pool = new Pool({
  connectionString: process.argv[2],
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    console.log('🔄 Bulk updating all unmapped zones...\n');
    
    // Get all unmapped registrations
    const result = await pool.query(`
      SELECT registration_id, club
      FROM registrations
      WHERE (zone IS NULL OR zone = 'Unmapped') AND club != 'TEST'
      ORDER BY club
    `);
    
    console.log(`Found ${result.rows.length} unmapped registrations\n`);
    
    let updated = 0;
    let stillUnmapped = 0;
    const unmappedClubs = new Set();
    
    for (const row of result.rows) {
      const zone = getZoneForClub(row.club);
      
      if (zone && zone !== 'Unmapped') {
        await pool.query(
          'UPDATE registrations SET zone = $1 WHERE registration_id = $2',
          [zone, row.registration_id]
        );
        updated++;
        if (updated % 50 === 0) {
          console.log(`   Updated ${updated}...`);
        }
      } else {
        stillUnmapped++;
        unmappedClubs.add(row.club);
      }
    }
    
    console.log(`\n✅ Successfully updated ${updated} registrations`);
    console.log(`⚠️  Still unmapped: ${stillUnmapped} registrations from ${unmappedClubs.size} clubs\n`);
    
    if (unmappedClubs.size > 0) {
      console.log('📋 Clubs that need to be added to zone mapping:');
      Array.from(unmappedClubs).sort().forEach(club => {
        console.log(`   - "${club}"`);
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
})();
