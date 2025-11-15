const XLSX = require('xlsx');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addZoneColumn() {
  try {
    console.log('\n🗺️  Adding zone information to database...\n');
    
    // 1. Add zone columns if they don't exist
    console.log('Adding zone columns to registrations table...');
    await pool.query(`
      ALTER TABLE registrations 
      ADD COLUMN IF NOT EXISTS zone_id INTEGER,
      ADD COLUMN IF NOT EXISTS zone_ag_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS zone_ag_mobile VARCHAR(20)
    `);
    console.log('✅ Zone columns added\n');
    
    // 2. Read zone mapping from Excel
    const workbook = XLSX.readFile('./public/ZONE WISE.xlsx');
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    
    // Create club to zone mapping
    const clubZoneMap = {};
    data.forEach(row => {
      if (row['Club Name'] && row['Zone ID'] && !row['Club Name'].includes('Total')) {
        clubZoneMap[row['Club Name']] = {
          zone_id: row['Zone ID'],
          ag_name: row['AG Name'] || null,
          ag_mobile: row['AG Mobile'] ? String(row['AG Mobile']) : null
        };
      }
    });
    
    console.log(`📋 Loaded ${Object.keys(clubZoneMap).length} club-zone mappings\n`);
    
    // 3. Update registrations with zone info
    let updated = 0;
    let notFound = new Set();
    
    for (const [clubName, zoneInfo] of Object.entries(clubZoneMap)) {
      const result = await pool.query(`
        UPDATE registrations
        SET zone_id = $1,
            zone_ag_name = $2,
            zone_ag_mobile = $3
        WHERE club = $4
      `, [zoneInfo.zone_id, zoneInfo.ag_name, zoneInfo.ag_mobile, clubName]);
      
      if (result.rowCount > 0) {
        updated += result.rowCount;
        console.log(`✅ ${clubName.padEnd(40)} → Zone ${zoneInfo.zone_id} (${result.rowCount} records)`);
      }
    }
    
    // Find clubs not in zone mapping
    const unmappedClubs = await pool.query(`
      SELECT DISTINCT club, COUNT(*) as count
      FROM registrations
      WHERE zone_id IS NULL AND payment_status = 'SUCCESS'
      GROUP BY club
      ORDER BY count DESC
    `);
    
    if (unmappedClubs.rows.length > 0) {
      console.log('\n⚠️  CLUBS NOT IN ZONE MAPPING:\n');
      unmappedClubs.rows.forEach(row => {
        console.log(`   ${row.club.padEnd(40)} - ${row.count} registrations`);
        notFound.add(row.club);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Updated ${updated} registrations with zone information`);
    console.log(`⚠️  ${notFound.size} clubs not found in zone mapping`);
    console.log('='.repeat(60) + '\n');
    
    // Show zone summary
    const zoneSummary = await pool.query(`
      SELECT 
        zone_id,
        zone_ag_name,
        COUNT(*) as registrations
      FROM registrations
      WHERE zone_id IS NOT NULL AND payment_status = 'SUCCESS'
      GROUP BY zone_id, zone_ag_name
      ORDER BY zone_id
    `);
    
    console.log('📊 ZONE SUMMARY:\n');
    zoneSummary.rows.forEach(row => {
      console.log(`   Zone ${row.zone_id}: ${row.zone_ag_name || 'N/A'} - ${row.registrations} registrations`);
    });
    console.log();
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

addZoneColumn();
