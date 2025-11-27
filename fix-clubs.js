#!/usr/bin/env node
/**
 * Fix club name mismatches in registrations database
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load official clubs list
const clubsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'clubs.json'), 'utf8'));
const officialClubs = clubsData.map(c => c.name);
const officialClubsLower = officialClubs.map(c => c.toLowerCase());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixClubs() {
  try {
    console.log('🔧 Fixing club name mismatches...\n');
    
    // Get all unique club names from registrations
    const result = await pool.query(`
      SELECT DISTINCT club, COUNT(*) as count
      FROM registrations 
      WHERE payment_status != 'test'
      GROUP BY club 
      ORDER BY club
    `);
    
    const fixes = [];
    
    // Find mismatches
    for (const row of result.rows) {
      const dbClub = row.club;
      const dbClubLower = dbClub.toLowerCase();
      
      // Skip if exact match
      if (officialClubs.includes(dbClub)) {
        continue;
      }
      
      // Check for case-insensitive match
      const matchIndex = officialClubsLower.indexOf(dbClubLower);
      if (matchIndex >= 0) {
        const correctName = officialClubs[matchIndex];
        if (correctName !== dbClub) {
          fixes.push({
            wrong: dbClub,
            correct: correctName,
            count: row.count
          });
        }
        continue;
      }
      
      // Check for close matches (spaces, capitalization)
      const closeMatch = officialClubs.find(official => {
        const officialNorm = official.toLowerCase().replace(/\s+/g, '');
        const dbNorm = dbClub.toLowerCase().replace(/\s+/g, '');
        return officialNorm === dbNorm;
      });
      
      if (closeMatch) {
        fixes.push({
          wrong: dbClub,
          correct: closeMatch,
          count: row.count
        });
      }
    }
    
    if (fixes.length === 0) {
      console.log('✅ No club name mismatches to fix!\n');
      await pool.end();
      return;
    }
    
    console.log(`Found ${fixes.length} club name(s) to fix:\n`);
    fixes.forEach((fix, i) => {
      console.log(`   ${i + 1}. "${fix.wrong}" → "${fix.correct}" (${fix.count} registrations)`);
    });
    
    console.log('\n🔄 Applying fixes...\n');
    
    let totalFixed = 0;
    
    for (const fix of fixes) {
      try {
        const updateResult = await pool.query(
          'UPDATE registrations SET club = $1 WHERE club = $2 AND payment_status != \'test\'',
          [fix.correct, fix.wrong]
        );
        
        console.log(`✅ Fixed "${fix.wrong}" → "${fix.correct}" (${updateResult.rowCount} rows)`);
        totalFixed += updateResult.rowCount;
      } catch (err) {
        console.error(`❌ Error fixing "${fix.wrong}":`, err.message);
      }
    }
    
    console.log(`\n✅ Total fixed: ${totalFixed} registrations\n`);
    
    // Verify the fixes
    console.log('🔍 Verifying fixes...\n');
    
    const verifyResult = await pool.query(`
      SELECT DISTINCT club, COUNT(*) as count
      FROM registrations 
      WHERE payment_status != 'test'
      GROUP BY club 
      ORDER BY club
    `);
    
    const remaining = [];
    verifyResult.rows.forEach(row => {
      if (!officialClubs.includes(row.club)) {
        const closeMatch = officialClubs.find(official => 
          official.toLowerCase().replace(/\s+/g, '') === row.club.toLowerCase().replace(/\s+/g, '')
        );
        if (!closeMatch) {
          remaining.push(row);
        }
      }
    });
    
    if (remaining.length === 0) {
      console.log('✅ All club names are now correct!\n');
    } else {
      console.log(`⚠️  ${remaining.length} unknown club(s) still remain:\n`);
      remaining.forEach(r => {
        console.log(`   - "${r.club}" (${r.count} registrations)`);
      });
      console.log('\n⚠️  These clubs may need to be added to clubs.json\n');
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

fixClubs();
