// Fix spelling variations and map remaining 28 unmapped clubs
// Usage: node database/fix-unmapped-clubs.js

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Zone AG details
const zoneAGs = {
  1: { name: 'Robert Rego', mobile: '6364171019' },
  2: { name: 'Shantharam Shetty', mobile: '9880088111' },
  3: { name: 'Ravishanakar Rao', mobile: '9591156894' },
  4: { name: 'Padmanabha Rai', mobile: '9449639719' },
  5: { name: 'Pramila Rao', mobile: '7259946339' },
  6: { name: 'Dhillon Chengappa', mobile: '9611640552' },
  7: { name: 'Harish B', mobile: '9845561999' },
  8: { name: 'Jagadish H S', mobile: '9900050006' },
  9: { name: 'Girisha D S', mobile: '9538533818' }
};

// Mapping for unmapped clubs (database spelling → zone)
const unmappedClubsMapping = {
  // Zone 1
  'Mulki': 1,  // 4 registrations (spelling: Mulky → Mulki)
  
  // Zone 3
  'Mangalore Down Town': 3,  // 2 registrations
  'Mangalore Seaside': 3,  // 2 registrations (Sea Side → Seaside)
  
  // Zone 4
  'B C Road City': 4,  // 2 registrations
  'Moodabidri Temple Town': 4,  // 5 registrations
  'Siddakatte': 4,  // 5 registrations (Siddakatte Phalguni → Siddakatte)
  'Uppinangdi': 4,  // 4 registrations (Uppinangadi → Uppinangdi)
  'Madhyanthar': 4,  // 3 registrations (not in official list, but similar to Madanthyar)
  
  // Zone 6
  'Krishnarajanagara': 6,  // 8 registrations (Krishnarajanagar → Krishnarajanagara)
  'Kushalnagara': 6,  // 7 registrations (Kushalnagar → Kushalnagara)
  'Hemavathi Kodlipete': 6,  // 2 registrations (Hemavathi Kodlipet → Hemavathi Kodlipete)
  'Somarpete Hills': 6,  // 5 registrations (Somwarpet Hills → Somarpete Hills)
  'Periyapatna Icons': 6,  // 2 registrations (Periyapatna Icon → Periyapatna Icons)
  'Shanivarashanthe': 6,  // 1 registrations (Shanivarsanthe → Shanivarashanthe)
  
  // Zone 7
  'Panchasheel': 7,  // 7 registrations (Panchsheel → Panchasheel)
  'Ivory City': 7,  // 15 registrations (Ivory City Mysuru → Ivory City)
  'E Club of Mysore Center': 7,  // 3 registrations (E Club Mysure Center → E Club of Mysore Center)
  'Mysore Sreegandha': 7,  // 2 registrations (Mysore Shreegandha → Mysore Sreegandha)
  
  // Zone 8
  'Mysore SouthEast': 8,  // 22 registrations (Mysore South East → Mysore SouthEast)
  'Vijayanagara Mysore': 8,  // 3 registrations (Vijaynagar Mysore → Vijayanagara Mysore)
  'Mysuru Diamond': 8,  // 5 registrations (Mysore Diamonds → Mysuru Diamond)
  'Heritage Mysuru': 8,  // 6 registrations (Heritage Mysore → Heritage Mysuru)
  'H D Kote': 8,  // 9 registrations (HD Kote → H D Kote)
  
  // Zone 9
  'Chamarajanagara': 9,  // 17 registrations (Chamarajanagar → Chamarajanagara)
  'Chamarajanagara Silk City': 9,  // 5 registrations
  'Yelandur Greenway': 9,  // 17 registrations (Yelanduru Greenway → Yelandur Greenway)
  'Kollegala': 9,  // 16 registrations (Kollegal → Kollegala)
  'Kollegala Midtown': 9  // 14 registrations (Kollegal Midtown → Kollegala Midtown)
};

async function fixUnmappedClubs() {
  console.log('🔧 Mapping remaining 28 unmapped clubs to zones...\n');

  try {
    let updated = 0;
    let notFound = 0;
    let errors = 0;

    for (const [clubName, zoneId] of Object.entries(unmappedClubsMapping)) {
      try {
        const agInfo = zoneAGs[zoneId];
        
        const result = await pool.query(`
          UPDATE registrations
          SET zone_id = $1,
              zone_ag_name = $2,
              zone_ag_mobile = $3
          WHERE club = $4 AND payment_status != 'test'
          RETURNING registration_id
        `, [zoneId, agInfo.name, agInfo.mobile, clubName]);

        if (result.rowCount > 0) {
          console.log(`✅ Zone ${zoneId}: ${clubName} (${result.rowCount} registrations updated)`);
          updated += result.rowCount;
        } else {
          console.log(`⚠️  Zone ${zoneId}: ${clubName} (0 registrations found)`);
          notFound++;
        }

      } catch (err) {
        console.error(`❌ Error updating ${clubName}:`, err.message);
        errors++;
      }
    }

    // Final check for unmapped clubs
    console.log('\n' + '='.repeat(80));
    console.log('🔍 Final check for unmapped clubs...\n');
    
    const unmappedResult = await pool.query(`
      SELECT club, COUNT(*) as count
      FROM registrations
      WHERE payment_status != 'test' AND zone_id IS NULL
      GROUP BY club
      ORDER BY count DESC, club
    `);

    if (unmappedResult.rows.length > 0) {
      console.log(`⚠️  Still ${unmappedResult.rows.length} unmapped clubs:\n`);
      unmappedResult.rows.forEach(row => {
        console.log(`   - ${row.club}: ${row.count} registrations`);
      });
    } else {
      console.log('✅ SUCCESS! All clubs are now mapped to zones!');
    }

    // Get final zone statistics
    console.log('\n' + '='.repeat(80));
    const statsResult = await pool.query(`
      SELECT 
        CASE WHEN zone_id IS NULL THEN 0 ELSE zone_id END as zone,
        COUNT(*) as registrations
      FROM registrations
      WHERE payment_status != 'test'
      GROUP BY zone_id
      ORDER BY zone
    `);

    console.log('📊 FINAL ZONE STATISTICS:\n');
    let totalMapped = 0;
    let totalUnmapped = 0;
    
    statsResult.rows.forEach(row => {
      if (row.zone === 0) {
        console.log(`   Unmapped: ${row.registrations} registrations`);
        totalUnmapped = parseInt(row.registrations);
      } else {
        console.log(`   Zone ${row.zone}: ${row.registrations} registrations`);
        totalMapped += parseInt(row.registrations);
      }
    });
    
    const total = totalMapped + totalUnmapped;
    const mappedPercent = ((totalMapped / total) * 100).toFixed(1);
    
    console.log('   ' + '-'.repeat(40));
    console.log(`   Total Mapped: ${totalMapped} (${mappedPercent}%)`);
    console.log(`   Total Unmapped: ${totalUnmapped} (${(100 - mappedPercent).toFixed(1)}%)`);
    console.log(`   Total Registrations: ${total}`);

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 UPDATE SUMMARY:');
    console.log('='.repeat(80));
    console.log(`✅ Registrations updated: ${updated}`);
    console.log(`⚠️  Clubs not found: ${notFound}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📋 Total clubs processed: ${Object.keys(unmappedClubsMapping).length}`);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await pool.end();
  }
}

fixUnmappedClubs();
