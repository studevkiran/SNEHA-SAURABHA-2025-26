// Update zone mappings for all 92 clubs with correct zone IDs
// Usage: node database/update-complete-zone-mapping.js

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Complete zone mapping with correct zone IDs
const zoneMapping = {
  // ZONE 1
  'Mulky': 1,
  'Bajpe': 1,
  'Kinnigoli': 1,
  'Moodbidri Midtown': 1,
  
  // ZONE 2
  'Surathkal': 2,
  'Mangalore East': 2,
  'Mangalore Coastal': 2,
  'Mangalore North': 2,
  'Mangalore Hillside': 2,
  'Baikampady': 2,
  'Mangalore Sunrise': 2,
  'Mangalore Central': 2,
  'Mangalore Port Town': 2,
  
  // ZONE 3
  'Mangalore Downtown': 3,
  'Mangalore South': 3,
  'Mangalore City': 3,
  'Deralakatte': 3,
  'Mangalore Sea Side': 3,
  'Mangalore Metro': 3,
  'Mangalore Midtown': 3,
  'Mangalore': 3,
  
  // ZONE 4
  'Modankap': 4,
  'Farangipete': 4,
  'BC Road City': 4,
  'Bantwal Town': 4,
  'Belthangady': 4,
  'Bantwal': 4,
  'Madanthyar': 4,
  'Moodabidri': 4,
  'Moodbidri Temple Town': 4,
  'Siddakatte Phalguni': 4,
  'Bantwal Loretto Hills': 4,
  'Puttur City': 4,
  'Vittal': 4,
  'Uppinangadi': 4,
  
  // ZONE 5
  'Puttur Yuva': 5,
  'Puttur East': 5,
  'Puttur Swarna': 5,
  'Puttur Elite': 5,
  'Puttur': 5,
  'Puttur Central': 5,
  'Subramanya': 5,
  'Kadaba Town': 5,
  'Sullia City': 5,
  'Sullia': 5,
  'Bellare Town': 5,
  'Birumale Hills Puttur': 5,
  
  // ZONE 6
  'Virajpete': 6,
  'Gonikoppal': 6,
  'Madikeri': 6,
  'Misty Hills Madikeri': 6,
  'Madikeri Woods': 6,
  'Malleshwara Alur Siddapura': 6,
  'Shanivarsanthe': 6,
  'Hemavathi Kodlipet': 6,
  'Somwarpet Hills': 6,
  'Kushalnagar': 6,
  'Krishnarajanagar': 6,
  'Periyapatna Midtown': 6,
  'Periyapatna Icon': 6,
  'Hunsur': 6,
  
  // ZONE 7
  'Panchsheel': 7,
  'Ivory City Mysuru': 7,
  'Krishnaraja': 7,
  'Mysore': 7,
  'Mysore Shreegandha': 7,
  'Mysore Metro': 7,
  'E Club Mysure Center': 7,
  'Mysore Midtown': 7,
  'Central Mysore': 7,
  'Mysore Jayaprakash Nagar': 7,
  'Mysore East': 7,
  'Seva Mysore': 7,
  
  // ZONE 8
  'Mysore South East': 8,
  'Mysore Brindavan': 8,
  'Vijaynagar Mysore': 8,
  'Mysore Diamonds': 8,
  'Mysore North': 8,
  'Mysore Ambari': 8,
  'Mysore Elite': 8,
  'Mysore West': 8,
  'Mysore Royal': 8,
  'Mysore Stars': 8,
  'HD Kote': 8,
  'Heritage Mysore': 8,
  
  // ZONE 9
  'Chamarajanagar': 9,
  'Chamarajanagar Silk City': 9,
  'Nanjangud': 9,
  'Bannur': 9,
  'Yelanduru Greenway': 9,
  'Kollegal': 9,
  'Kollegal Midtown': 9
};

// Zone AG details from ZONE WISE.xlsx
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

async function updateCompleteZoneMapping() {
  console.log('🔧 Updating complete zone mapping for all 92 clubs...\n');

  try {
    let updated = 0;
    let notFound = 0;
    let errors = 0;
    const clubsNotFound = [];

    // Process each club in the mapping
    for (const [clubName, zoneId] of Object.entries(zoneMapping)) {
      try {
        const agInfo = zoneAGs[zoneId];
        
        // Update registrations with this club name
        const result = await pool.query(`
          UPDATE registrations
          SET zone_id = $1,
              zone_ag_name = $2,
              zone_ag_mobile = $3
          WHERE club = $4
          RETURNING registration_id, name, club
        `, [zoneId, agInfo.name, agInfo.mobile, clubName]);

        if (result.rowCount > 0) {
          console.log(`✅ Zone ${zoneId}: ${clubName} (${result.rowCount} registrations)`);
          updated += result.rowCount;
        } else {
          console.log(`⚠️  Zone ${zoneId}: ${clubName} (0 registrations - no data)`);
          notFound++;
          clubsNotFound.push(clubName);
        }

      } catch (err) {
        console.error(`❌ Error updating ${clubName}:`, err.message);
        errors++;
      }
    }

    // Check for unmapped clubs
    console.log('\n' + '='.repeat(80));
    console.log('🔍 Checking for unmapped clubs in database...\n');
    
    const unmappedResult = await pool.query(`
      SELECT DISTINCT club, COUNT(*) as count
      FROM registrations
      WHERE payment_status != 'test'
        AND (zone_id IS NULL OR zone_id = 0)
      GROUP BY club
      ORDER BY count DESC
    `);

    if (unmappedResult.rows.length > 0) {
      console.log(`⚠️  Found ${unmappedResult.rows.length} unmapped clubs:\n`);
      unmappedResult.rows.forEach(row => {
        console.log(`   - ${row.club}: ${row.count} registrations`);
      });
    } else {
      console.log('✅ All clubs are now mapped to zones!');
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 UPDATE SUMMARY:');
    console.log('='.repeat(80));
    console.log(`✅ Registrations updated: ${updated}`);
    console.log(`⚠️  Clubs with no registrations: ${notFound}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📋 Total clubs in mapping: ${Object.keys(zoneMapping).length}`);
    
    if (clubsNotFound.length > 0 && clubsNotFound.length <= 10) {
      console.log(`\n📝 Clubs with no registrations (${clubsNotFound.length}):`);
      clubsNotFound.forEach(club => console.log(`   - ${club}`));
    }
    
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await pool.end();
  }
}

updateCompleteZoneMapping();
