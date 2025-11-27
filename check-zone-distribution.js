const { query } = require('./lib/db-neon');
const { getZoneForClub } = require('./lib/zone-mapping');

require('dotenv').config({ path: '.env.local' });

async function checkDistribution() {
  try {
    // Get all zones and their club counts
    const result = await query(`
      SELECT zone, club, COUNT(*) as count 
      FROM registrations 
      GROUP BY zone, club
      ORDER BY zone, club
    `);
    
    console.log('\n📊 CURRENT ZONE DISTRIBUTION:\n');
    
    let currentZone = '';
    let zoneTotal = 0;
    let clubsInZone = [];
    
    result.rows.forEach(row => {
      if (row.zone !== currentZone) {
        if (currentZone) {
          console.log(`   📍 ${currentZone}: ${zoneTotal} registrations, ${clubsInZone.length} clubs`);
          console.log('');
        }
        currentZone = row.zone;
        zoneTotal = 0;
        clubsInZone = [];
      }
      
      const expectedZone = getZoneForClub(row.club);
      const status = row.zone === expectedZone ? '✅' : '❌';
      
      console.log(`${status} ${row.club.padEnd(35)} → ${row.zone.padEnd(10)} (${row.count} regs) ${row.zone !== expectedZone ? `[Should be: ${expectedZone}]` : ''}`);
      
      zoneTotal += parseInt(row.count);
      clubsInZone.push(row.club);
    });
    
    // Print last zone
    if (currentZone) {
      console.log(`   📍 ${currentZone}: ${zoneTotal} registrations, ${clubsInZone.length} clubs`);
    }
    
    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDistribution();
