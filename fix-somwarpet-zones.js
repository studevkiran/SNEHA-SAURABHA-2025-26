/**
 * Fix the 2 unmapped Somwarpet Hills registrations
 * Assign them to Zone 6B
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixSomwarpetZones() {
  try {
    console.log('🔧 Fixing Somwarpet Hills unmapped registrations...\n');

    // The 2 unmapped Somwarpet Hills registrations
    const idsToFix = [3121, 3119];

    console.log('Registrations to fix:');
    console.log('  - ID 3121: B S Sundar');
    console.log('  - ID 3119: P K Ravi');
    console.log('  - Club: Somwarpet Hills');
    console.log('  - Fixing: Zone 6B + Club ID 114\n');

    // Update both zone and club_id
    const result = await pool.query(`
      UPDATE registrations 
      SET zone = 'Zone 6B',
          club_id = 114,
          updated_at = NOW()
      WHERE id = ANY($1)
      RETURNING id, registration_id, name, club, zone, club_id
    `, [idsToFix]);

    console.log('✅ Successfully updated:\n');
    result.rows.forEach(r => {
      console.log(`   ${r.id} | ${r.registration_id} | ${r.name}`);
      console.log(`      Club: ${r.club}`);
      console.log(`      Zone: ${r.zone}`);
      console.log(`      Club ID: ${r.club_id}`);
      console.log('');
    });

    // Verify the fix
    console.log('🔍 Verification - Checking remaining unmapped:\n');
    const unmappedCheck = await pool.query(`
      SELECT COUNT(*) as count
      FROM registrations
      WHERE (zone IS NULL OR zone = '' OR zone = 'Unmapped')
      AND payment_status != 'test'
      AND club != 'Guest/No Club'
    `);

    console.log(`   Remaining unmapped (excluding Guests): ${unmappedCheck.rows[0].count}`);

    // Check Somwarpet Hills total
    const somwarpetCheck = await pool.query(`
      SELECT zone, COUNT(*) as count
      FROM registrations
      WHERE club = 'Somwarpet Hills'
      AND payment_status != 'test'
      GROUP BY zone
      ORDER BY zone
    `);

    console.log('\n📊 Somwarpet Hills zone distribution:');
    somwarpetCheck.rows.forEach(r => {
      console.log(`   ${r.zone || 'NULL'}: ${r.count}`);
    });

    await pool.end();
    console.log('\n✅ Done!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixSomwarpetZones();
