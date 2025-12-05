/**
 * Database Migration: Add zone column to clubs table and populate with zone data
 * Run this script once to update the clubs table with zone information
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateClubsWithZones() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database migration: Add zones to clubs table...\n');
    
    // Step 1: Add zone column if it doesn't exist
    console.log('Step 1: Adding zone column to clubs table...');
    await client.query(`
      ALTER TABLE clubs 
      ADD COLUMN IF NOT EXISTS zone VARCHAR(50);
    `);
    console.log('✅ Zone column added successfully\n');
    
    // Step 2: Load clubs data from JSON file
    console.log('Step 2: Loading zone data from clubs.json...');
    const clubsPath = path.join(__dirname, 'data', 'clubs.json');
    const clubsData = JSON.parse(fs.readFileSync(clubsPath, 'utf8'));
    console.log(`✅ Loaded ${clubsData.length} clubs with zone information\n`);
    
    // Step 3: Update each club with its zone
    console.log('Step 3: Updating clubs with zone information...');
    let updated = 0;
    let notFound = 0;
    
    for (const club of clubsData) {
      const result = await client.query(
        'UPDATE clubs SET zone = $1 WHERE id = $2',
        [club.zone, club.id]
      );
      
      if (result.rowCount > 0) {
        updated++;
        console.log(`  ✓ Updated club ${club.id}: ${club.name} → ${club.zone}`);
      } else {
        notFound++;
        console.log(`  ⚠ Club ${club.id} not found in database: ${club.name}`);
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   Total clubs in JSON: ${clubsData.length}`);
    console.log(`   Successfully updated: ${updated}`);
    console.log(`   Not found in DB: ${notFound}`);
    
    // Step 4: Verify the update
    console.log('\nStep 4: Verifying zone distribution...');
    const zoneStats = await client.query(`
      SELECT zone, COUNT(*) as count 
      FROM clubs 
      WHERE zone IS NOT NULL 
      GROUP BY zone 
      ORDER BY zone;
    `);
    
    console.log('\n📈 Zone Distribution:');
    zoneStats.rows.forEach(row => {
      console.log(`   ${row.zone}: ${row.count} clubs`);
    });
    
    // Check for clubs without zones
    const missingZones = await client.query(`
      SELECT id, name 
      FROM clubs 
      WHERE zone IS NULL;
    `);
    
    if (missingZones.rows.length > 0) {
      console.log('\n⚠️  Clubs without zone assignment:');
      missingZones.rows.forEach(club => {
        console.log(`   ID ${club.id}: ${club.name}`);
      });
    } else {
      console.log('\n✅ All clubs have zone assignments!');
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
updateClubsWithZones()
  .then(() => {
    console.log('\n✅ Database migration script finished');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Database migration failed:', error);
    process.exit(1);
  });
