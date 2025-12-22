/**
 * Find which clubs/registrations are showing as "Unmapped" in the zone breakdown
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function findUnmappedClubs() {
  try {
    console.log('🔍 Finding unmapped registrations...\n');

    // Check all possible "unmapped" scenarios
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        club, 
        club_id,
        zone, 
        registration_type,
        payment_status,
        created_at
      FROM registrations 
      WHERE payment_status = 'completed'
        AND (
          zone IS NULL 
          OR zone = '' 
          OR zone = 'Unmapped'
          OR zone NOT LIKE 'Zone%'
        )
      ORDER BY created_at DESC
    `);

    console.log(`📊 Total Unmapped: ${result.rows.length} registrations\n`);

    if (result.rows.length === 0) {
      console.log('✅ No unmapped registrations found!\n');
      await pool.end();
      return;
    }

    // Group by club
    const clubGroups = {};
    result.rows.forEach(reg => {
      const club = reg.club || 'NO CLUB';
      if (!clubGroups[club]) {
        clubGroups[club] = [];
      }
      clubGroups[club].push(reg);
    });

    console.log('📋 UNMAPPED CLUBS:\n');
    Object.keys(clubGroups).sort().forEach(club => {
      const regs = clubGroups[club];
      console.log(`\n🏢 ${club}`);
      console.log(`   Count: ${regs.length}`);
      console.log(`   Registrations:`);
      regs.forEach(r => {
        console.log(`      • ID: ${r.id} | ${r.name} | ${r.registration_type} | Zone: ${r.zone || 'NULL'}`);
      });
    });

    console.log(`\n\n📌 SUMMARY:`);
    console.log(`Total unmapped registrations: ${result.rows.length}`);
    console.log(`From ${Object.keys(clubGroups).length} different club(s)\n`);

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

findUnmappedClubs();
