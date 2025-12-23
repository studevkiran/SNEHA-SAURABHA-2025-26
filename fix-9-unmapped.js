/**
 * Fix the 9 unmapped registrations
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Import zone mapping
const { getZoneForClub } = require('./lib/zone-mapping.js');

async function fixUnmapped() {
  try {
    console.log('🔍 Finding the 9 unmapped registrations...\n');

    // Get all unmapped (excluding test entries)
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        email,
        club, 
        club_id,
        zone, 
        registration_type,
        payment_status,
        created_at
      FROM registrations 
      WHERE payment_status = 'completed'
        AND payment_status != 'test'
        AND (
          zone IS NULL 
          OR zone = '' 
          OR zone = 'Unmapped'
          OR zone NOT LIKE 'Zone%'
        )
      ORDER BY created_at DESC
    `);

    console.log(`📊 Found ${result.rows.length} unmapped registrations:\n`);

    if (result.rows.length === 0) {
      console.log('✅ No unmapped registrations found!\n');
      await pool.end();
      return;
    }

    // Display all unmapped
    result.rows.forEach((r, idx) => {
      console.log(`${idx + 1}. ID: ${r.id}`);
      console.log(`   Name: ${r.name}`);
      console.log(`   Club: ${r.club || 'NO CLUB'}`);
      console.log(`   Club ID: ${r.club_id || 'NULL'}`);
      console.log(`   Current Zone: ${r.zone || 'NULL'}`);
      console.log(`   Type: ${r.registration_type}`);
      console.log(`   Created: ${new Date(r.created_at).toLocaleString()}`);
      console.log('');
    });

    // Group by club to see patterns
    const clubGroups = {};
    result.rows.forEach(r => {
      const club = r.club || 'NO CLUB';
      if (!clubGroups[club]) clubGroups[club] = [];
      clubGroups[club].push(r);
    });

    console.log('\n📋 Grouped by Club:');
    Object.entries(clubGroups).forEach(([club, regs]) => {
      const correctZone = getZoneForClub(club);
      console.log(`\n${club} (${regs.length} registration${regs.length > 1 ? 's' : ''}):`);
      console.log(`   Should be in: ${correctZone}`);
      regs.forEach(r => console.log(`   - ID ${r.id}: ${r.name}`));
    });

    // Now fix each one
    console.log('\n\n🔧 Fixing unmapped registrations...\n');

    let fixed = 0;
    for (const r of result.rows) {
      const club = r.club || 'Guest/No Club';
      const correctZone = getZoneForClub(club);
      
      if (correctZone && correctZone !== 'Unmapped') {
        await pool.query(
          'UPDATE registrations SET zone = $1 WHERE id = $2',
          [correctZone, r.id]
        );
        console.log(`✅ Fixed ID ${r.id} (${r.name}): ${club} → ${correctZone}`);
        fixed++;
      } else {
        console.log(`⚠️  Cannot fix ID ${r.id} (${r.name}): ${club} not in mapping`);
      }
    }

    console.log(`\n✨ Fixed ${fixed} out of ${result.rows.length} registrations\n`);

    // Verify
    console.log('🔍 Verification:\n');
    const verifyResult = await pool.query(`
      SELECT 
        COUNT(*) as total_unmapped
      FROM registrations 
      WHERE payment_status = 'completed'
        AND payment_status != 'test'
        AND (
          zone IS NULL 
          OR zone = '' 
          OR zone = 'Unmapped'
          OR zone NOT LIKE 'Zone%'
        )
    `);

    console.log(`   Remaining unmapped: ${verifyResult.rows[0].total_unmapped}`);

    // Show zone distribution
    const zoneStats = await pool.query(`
      SELECT 
        zone,
        COUNT(*) as count
      FROM registrations 
      WHERE payment_status = 'completed'
        AND payment_status != 'test'
      GROUP BY zone
      ORDER BY 
        CASE 
          WHEN zone ~ '^Zone [0-9]+' THEN 
            CAST(substring(zone FROM 'Zone ([0-9]+)') AS INTEGER)
          ELSE 999
        END
    `);

    console.log('\n📊 Current Zone Distribution:');
    zoneStats.rows.forEach(row => {
      console.log(`   ${row.zone || 'NULL'}: ${row.count}`);
    });

    await pool.end();
    console.log('\n✅ Done!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

fixUnmapped();
