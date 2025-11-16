const { Pool } = require('pg');

const connectionString = process.argv[2];

if (!connectionString) {
  console.error('❌ Usage: node check-test-zones.js <POSTGRES_URL>');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkTestZones() {
  try {
    const result = await pool.query(`
      SELECT 
        registration_id,
        name,
        club,
        zone,
        registration_type,
        payment_status,
        created_at
      FROM registrations
      WHERE registration_id IN ('ROT54V0694', '2026RTY0693', '2026RTY0695', '2026RTY0696')
      ORDER BY created_at ASC
    `);
    
    console.log('\n📊 TEST ENTRIES - ZONE MAPPING CHECK\n');
    console.log('Expected: All "Mysore Metro" entries should be "Zone 7"\n');
    
    for (const row of result.rows) {
      console.log(`Registration ID: ${row.registration_id}`);
      console.log(`  Name: ${row.name}`);
      console.log(`  Club: ${row.club}`);
      console.log(`  Zone: ${row.zone || 'NULL/UNMAPPED'}`);
      console.log(`  Type: ${row.registration_type}`);
      console.log(`  Status: ${row.payment_status}`);
      console.log(`  Created: ${row.created_at}`);
      
      // Check if zone mapping worked
      if (row.club === 'Mysore Metro') {
        if (row.zone === 'Zone 7') {
          console.log(`  ✅ ZONE MAPPED CORRECTLY!`);
        } else {
          console.log(`  ❌ ZONE MAPPING FAILED! Expected "Zone 7", got "${row.zone || 'UNMAPPED'}"`);
        }
      }
      console.log('');
    }
    
    // Also check recent registrations
    const recentResult = await pool.query(`
      SELECT registration_id, name, club, zone
      FROM registrations
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log('\n📋 RECENT 10 REGISTRATIONS (including test entries):');
    for (const row of recentResult.rows) {
      console.log(`${row.registration_id}\t${row.zone || 'UNMAPPED'}\t${row.club}\t${row.name}`);
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkTestZones();
