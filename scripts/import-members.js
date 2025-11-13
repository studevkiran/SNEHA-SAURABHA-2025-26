// Import script for ClubsandMembersinYourDistrictList.xlsx
// Reads Excel and imports to database

const XLSX = require('xlsx');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function importClubMembers() {
  console.log('📊 Reading Excel file...');
  
  // Read Excel file
  const workbook = XLSX.readFile('./public/images/ClubsandMembersinYourDistrictList.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log(`Found ${data.length} rows in Excel`);
  
  // Connect to database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  // First, create table if not exists
  console.log('🗄️  Creating table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS club_members (
      id SERIAL PRIMARY KEY,
      club_id VARCHAR(10),
      club_name VARCHAR(255) NOT NULL,
      member_name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      mobile VARCHAR(20),
      member_type VARCHAR(50) DEFAULT 'Rotarian',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT unique_member UNIQUE (club_name, member_name, email)
    );
  `);
  
  console.log('📥 Importing members...');
  
  let imported = 0;
  let skipped = 0;
  let errors = [];
  
  // Skip header row, start from row 1
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    // Excel columns: [Club Name, Member Name, Email, Mobile]
    const clubName = row[0]?.toString().trim();
    const memberName = row[1]?.toString().trim();
    const email = row[2]?.toString().trim() || null;
    const mobile = row[3]?.toString().trim() || null;
    
    // Skip empty rows
    if (!clubName || !memberName) {
      skipped++;
      continue;
    }
    
    try {
      // Map club name to club_id from clubs.json
      let clubId = null;
      const clubNameLower = clubName.toLowerCase();
      
      // Simple mapping (you can enhance this)
      if (clubNameLower.includes('mysore')) clubId = 'RC_MYSORE';
      else if (clubNameLower.includes('bangalore')) clubId = 'RC_BANGALORE';
      // Add more mappings as needed
      
      // Insert member
      await pool.query(`
        INSERT INTO club_members (club_id, club_name, member_name, email, mobile, member_type)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (club_name, member_name, email) 
        DO UPDATE SET 
          mobile = EXCLUDED.mobile,
          updated_at = NOW()
      `, [clubId, clubName, memberName, email, mobile, 'Rotarian']);
      
      imported++;
      
      if (imported % 50 === 0) {
        console.log(`  ✓ Imported ${imported} members...`);
      }
    } catch (err) {
      errors.push(`Row ${i + 1}: ${memberName} - ${err.message}`);
      skipped++;
    }
  }
  
  await pool.end();
  
  console.log('\n✅ Import complete!');
  console.log(`   Imported: ${imported}`);
  console.log(`   Skipped: ${skipped}`);
  
  if (errors.length > 0) {
    console.log(`\n❌ Errors (${errors.length}):`);
    errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more`);
    }
  }
}

// Run import
importClubMembers()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });
