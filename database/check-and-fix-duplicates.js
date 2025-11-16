require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAndFixDuplicates() {
  try {
    console.log('🔍 Checking for duplicate mobile numbers...\n');

    // Find duplicates
    const duplicatesQuery = `
      SELECT mobile, COUNT(*) as count, 
             STRING_AGG(registration_id || ' - ' || name || ' (' || registration_type || ')', ', ') as registrations
      FROM registrations
      GROUP BY mobile
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC;
    `;

    const duplicates = await pool.query(duplicatesQuery);

    if (duplicates.rows.length > 0) {
      console.log('⚠️  Found duplicate mobile numbers:\n');
      duplicates.rows.forEach(row => {
        console.log(`📱 Mobile: ${row.mobile} (${row.count} registrations)`);
        console.log(`   ${row.registrations}\n`);
      });
    } else {
      console.log('✅ No duplicate mobile numbers found.\n');
    }

    // Check the three problematic registrations
    console.log('🔍 Checking SS00027, SS00028, SS00029...\n');
    const problemQuery = `
      SELECT registration_id, created_at, name, mobile, email, registration_type, club, registration_amount, bypass_code
      FROM registrations
      WHERE registration_id IN ('SS00027', 'SS00028', 'SS00029')
      ORDER BY registration_id;
    `;

    const problems = await pool.query(problemQuery);
    
    if (problems.rows.length > 0) {
      console.log('📋 Found problematic registrations:\n');
      problems.rows.forEach(row => {
        console.log(`ID: ${row.registration_id}`);
        console.log(`   Name: ${row.name}`);
        console.log(`   Mobile: ${row.mobile}`);
        console.log(`   Email: ${row.email}`);
        console.log(`   Type: ${row.registration_type}`);
        console.log(`   Club: ${row.club}`);
        console.log(`   Amount: ₹${row.registration_amount}`);
        console.log(`   Bypass: ${row.bypass_code}`);
        console.log(`   Created: ${row.created_at}\n`);
      });

      // Ask to delete
      console.log('❌ DELETE these 3 records? They will be removed from database.');
      console.log('   To proceed, run: node database/delete-test-records.js\n');
    } else {
      console.log('✅ No problematic registrations found (SS00027-29).\n');
    }

    // Check current max registration ID
    console.log('🔢 Checking current registration ID sequence...\n');
    const maxIdQuery = `
      SELECT registration_id 
      FROM registrations 
      WHERE registration_id LIKE 'ROTA04V%'
      ORDER BY created_at DESC 
      LIMIT 10;
    `;

    const maxIds = await pool.query(maxIdQuery);
    
    if (maxIds.rows.length > 0) {
      console.log('📊 Last 10 ROTA04V registration IDs:\n');
      maxIds.rows.forEach(row => {
        console.log(`   ${row.registration_id}`);
      });

      // Extract the highest number
      const numbers = maxIds.rows
        .map(row => parseInt(row.registration_id.replace('ROTA04V', '')))
        .filter(num => !isNaN(num));

      if (numbers.length > 0) {
        const highestNum = Math.max(...numbers);
        const nextNum = highestNum + 1;
        console.log(`\n✅ Highest number: ${highestNum}`);
        console.log(`✅ Next registration ID should be: ROTA04V${String(nextNum).padStart(4, '0')}\n`);
      }
    } else {
      console.log('⚠️  No ROTA04V registrations found. Will start from ROTA04V0001\n');
    }

    // Check for SS prefix registrations
    const ssQuery = `
      SELECT COUNT(*) as count
      FROM registrations
      WHERE registration_id LIKE 'SS%';
    `;

    const ssCount = await pool.query(ssQuery);
    console.log(`⚠️  Found ${ssCount.rows[0].count} registrations with SS prefix (should be using ROTA04V)\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAndFixDuplicates();
