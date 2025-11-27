#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { getZoneForClub } = require('./lib/zone-mapping');
const { query } = require('./lib/db-neon');

async function updateZonesToSubzones() {
  console.log('🔄 Updating all registrations to use new sub-zone structure...\n');
  
  try {
    // Get all registrations with their clubs
    const result = await query(`
      SELECT registration_id, club, zone 
      FROM registrations 
      WHERE club IS NOT NULL AND club != ''
      ORDER BY registration_id
    `);
    
    console.log(`📊 Found ${result.rows.length} registrations with clubs\n`);
    
    let updated = 0;
    let unchanged = 0;
    let errors = 0;
    
    for (const row of result.rows) {
      const { registration_id, club, zone: oldZone } = row;
      const newZone = getZoneForClub(club);
      
      if (newZone !== oldZone) {
        try {
          await query(
            'UPDATE registrations SET zone = $1 WHERE registration_id = $2',
            [newZone, registration_id]
          );
          console.log(`✅ ${registration_id}: "${club}" | ${oldZone} → ${newZone}`);
          updated++;
        } catch (err) {
          console.error(`❌ ${registration_id}: Error - ${err.message}`);
          errors++;
        }
      } else {
        unchanged++;
      }
    }
    
    console.log(`\n📊 Update Summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Unchanged: ${unchanged}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📈 Total: ${result.rows.length}`);
    
    if (errors === 0) {
      console.log('\n✅ All registrations updated successfully to sub-zones!');
      
      // Show zone distribution
      const zoneStats = await query(`
        SELECT zone, COUNT(*) as count
        FROM registrations
        WHERE zone IS NOT NULL AND zone != 'Unmapped'
        GROUP BY zone
        ORDER BY zone
      `);
      
      console.log('\n📊 Registrations by Sub-Zone:');
      zoneStats.rows.forEach(({ zone, count }) => {
        console.log(`   ${zone}: ${count}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updateZonesToSubzones();
