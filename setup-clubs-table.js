/**
 * Database Migration: Create clubs table and populate with zone data
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

async function setupClubsTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting clubs table setup...\n');
    
    // Step 1: Check if clubs table exists
    console.log('Step 1: Checking for existing clubs table...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clubs'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    console.log(`   Clubs table exists: ${tableExists}\n`);
    
    // Step 2: Create clubs table if it doesn't exist
    if (!tableExists) {
      console.log('Step 2: Creating clubs table...');
      await client.query(`
        CREATE TABLE clubs (
          id INTEGER PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          zone VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Clubs table created successfully\n');
    } else {
      console.log('Step 2: Table already exists, checking for zone column...');
      const columnCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'clubs' 
          AND column_name = 'zone'
        );
      `);
      
      if (!columnCheck.rows[0].exists) {
        console.log('   Adding zone column...');
        await client.query(`
          ALTER TABLE clubs 
          ADD COLUMN zone VARCHAR(50);
        `);
        console.log('✅ Zone column added\n');
      } else {
        console.log('   Zone column already exists\n');
      }
    }
    
    // Step 3: Load clubs data from JSON file
    console.log('Step 3: Loading clubs data from clubs.json...');
    const clubsPath = path.join(__dirname, 'data', 'clubs.json');
    const clubsData = JSON.parse(fs.readFileSync(clubsPath, 'utf8'));
    console.log(`✅ Loaded ${clubsData.length} clubs\n`);
    
    // Step 4: Insert or update clubs
    console.log('Step 4: Inserting/updating clubs...');
    let inserted = 0;
    let updated = 0;
    
    for (const club of clubsData) {
      const existingClub = await client.query(
        'SELECT id FROM clubs WHERE id = $1',
        [club.id]
      );
      
      if (existingClub.rows.length === 0) {
        // Insert new club
        await client.query(
          'INSERT INTO clubs (id, name, zone) VALUES ($1, $2, $3)',
          [club.id, club.name, club.zone]
        );
        inserted++;
        console.log(`  ➕ Inserted club ${club.id}: ${club.name} (${club.zone})`);
      } else {
        // Update existing club
        await client.query(
          'UPDATE clubs SET name = $1, zone = $2 WHERE id = $3',
          [club.name, club.zone, club.id]
        );
        updated++;
        console.log(`  ✏️  Updated club ${club.id}: ${club.name} (${club.zone})`);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   Total clubs in JSON: ${clubsData.length}`);
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Updated: ${updated}`);
    
    // Step 5: Verify the data
    console.log('\nStep 5: Verifying zone distribution...');
    const zoneStats = await client.query(`
      SELECT zone, COUNT(*) as count 
      FROM clubs 
      GROUP BY zone 
      ORDER BY zone;
    `);
    
    console.log('\n📈 Zone Distribution:');
    zoneStats.rows.forEach(row => {
      console.log(`   ${row.zone}: ${row.count} clubs`);
    });
    
    const totalClubs = await client.query('SELECT COUNT(*) as total FROM clubs');
    console.log(`\n✅ Total clubs in database: ${totalClubs.rows[0].total}`);
    
    console.log('\n🎉 Setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the setup
setupClubsTable()
  .then(() => {
    console.log('\n✅ Database setup script finished');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Database setup failed:', error);
    process.exit(1);
  });
