/**
 * Fix Registration Club IDs
 * Updates all registrations to set correct club_id based on club name matching
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Known club name aliases/variations
const CLUB_ALIASES = {
  'BC Road City': 'B C Road City',
  'Mangalore Hillside': 'Mangalore Hill-Side',
  'Mangalore Downtown': 'Mangalore Down Town',
  'Mangalore Sea Side': 'Mangalore Seaside',
  'Mysore Midtown': 'Mysore Mid-Town',
  'Mysore Main': 'Mysore',
  'Puttur East': 'Puttur-East',
  'Periyapatna Midtown': 'Periyapatna Mid Town',
  'Hunsur': 'Hunsur, Hunsur',
  'Panchsheel': 'Panchsheel Mysore',
  'E Club Mysure Center': 'E-Club of Mysuru Center',
  'Vijaynagar Mysore': 'Vijayanagar Mysore',
  'Mysore Diamonds': 'Mysuru Diamond',
  'HD Kote': 'H.D. Kote',
  'Kollegal Midtown': 'Kollegal Mid Town',
  'Moodbidri Midtown': 'Moodbidri Mid Town',
  'Virajpete': 'Virajpet',
  'Gonikoppal ': 'Gonikoppal',
  'Misty Hills Madikeri ': 'Misty Hills Madikeri'
};

async function fixRegistrationClubIds() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting club_id fix for registrations...\n');
    
    // Step 1: Get all clubs from clubs table
    const clubsResult = await client.query('SELECT id, name FROM clubs ORDER BY name');
    const clubsMap = new Map();
    
    clubsResult.rows.forEach(club => {
      clubsMap.set(club.name.toLowerCase().trim(), club.id);
    });
    
    console.log(`✅ Loaded ${clubsMap.size} clubs from database\n`);
    
    // Step 2: Get all registrations with their current club names
    const regsResult = await client.query(`
      SELECT id, club, club_id 
      FROM registrations 
      WHERE club_id IS NULL OR club_id = 0
      ORDER BY id
    `);
    
    console.log(`📊 Found ${regsResult.rows.length} registrations to update\n`);
    
    let updated = 0;
    let notFound = 0;
    const notFoundClubs = new Set();
    
    // Step 3: Update each registration
    for (const reg of regsResult.rows) {
      let clubName = (reg.club || '').trim();
      
      // Try alias first
      if (CLUB_ALIASES[clubName]) {
        clubName = CLUB_ALIASES[clubName];
      }
      
      const clubId = clubsMap.get(clubName.toLowerCase());
      
      if (clubId) {
        await client.query(
          'UPDATE registrations SET club_id = $1 WHERE id = $2',
          [clubId, reg.id]
        );
        updated++;
        if (updated % 100 === 0) {
          console.log(`  ✓ Updated ${updated} registrations...`);
        }
      } else {
        notFound++;
        notFoundClubs.add(clubName);
      }
    }
    
    console.log(`\n📊 Update Summary:`);
    console.log(`   ✅ Successfully updated: ${updated}`);
    console.log(`   ⚠️  Not found: ${notFound}`);
    
    if (notFoundClubs.size > 0) {
      console.log(`\n⚠️  Clubs not found in clubs table:`);
      Array.from(notFoundClubs).sort().forEach(club => {
        console.log(`   - "${club}"`);
      });
    }
    
    // Step 4: Verify the fix
    const verification = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE club_id IS NOT NULL AND club_id != 0) as mapped,
        COUNT(*) FILTER (WHERE club_id IS NULL OR club_id = 0) as unmapped
      FROM registrations
    `);
    
    console.log(`\n🎯 Verification:`);
    console.log(`   Mapped registrations: ${verification.rows[0].mapped}`);
    console.log(`   Unmapped registrations: ${verification.rows[0].unmapped}`);
    
    // Show zone distribution
    const zoneStats = await client.query(`
      SELECT c.zone, COUNT(*) as count
      FROM registrations r
      JOIN clubs c ON r.club_id = c.id
      WHERE r.club_id IS NOT NULL AND r.club_id != 0
      GROUP BY c.zone
      ORDER BY c.zone
    `);
    
    console.log(`\n📈 Zone Distribution:`);
    zoneStats.rows.forEach(row => {
      console.log(`   ${row.zone}: ${row.count} registrations`);
    });
    
    console.log('\n✅ Club ID fix completed!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixRegistrationClubIds()
  .then(() => {
    console.log('\n✅ Script finished successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
