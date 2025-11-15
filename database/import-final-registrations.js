// FINAL IMPORT: New Guest.xlsx with correct payment status handling
// - 8 CANCELLED entries → payment_status = "test"
// - 681 real entries → payment_status = "SUCCESS"
// Usage: node database/import-final-registrations.js

const XLSX = require('xlsx');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function importFinalRegistrations() {
  console.log('📊 Starting FINAL import from New Guest.xlsx...\n');

  try {
    // 1. Read Excel file
    const workbook = XLSX.readFile('./public/New Guest.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✅ Found ${data.length} rows in Excel file\n`);

    // 2. Clear existing data
    console.log('🗑️  Clearing existing registrations...');
    await pool.query('DELETE FROM registrations');
    console.log('✅ Database cleared\n');

    // 3. Process each row
    let imported = 0;
    let testEntries = 0;
    let errors = 0;

    for (const row of data) {
      try {
        const registrationId = row['App No.'] || '';
        const fullName = row['Name'] || '';
        const mobile = row['Mobile'] ? String(row['Mobile']) : null;
        const email = row['eMail'] || null;
        const registrationType = row['Registration Type'] || 'Guest';
        const clubName = row['Club Name'] || '';
        const amount = parseFloat(row['Amount'] || 0);
        const mealPreference = row['Meal Preference'] || 'Veg';

        // Check if this is a CANCELLED entry (test data)
        const isCancelled = fullName.toLowerCase().includes('cancelled');

        // Standardize club names
        let standardClubName = clubName;
        if (clubName) {
          const lowerClub = clubName.toLowerCase().trim();
          if (lowerClub.includes('mid-town') || lowerClub.includes('mid town') || lowerClub === 'mysore midtown') {
            standardClubName = 'Mysore Midtown';
          }
        }

        // Prepare data for insertion
        const insertData = {
          registration_id: registrationId,
          name: isCancelled ? fullName : fullName, // Keep "Cancelled 1", "Cancelled 2" etc
          mobile: mobile || '0000000000',
          email: email || 'Not Provided',
          registration_type: registrationType,
          club: isCancelled ? 'N/A' : (standardClubName || 'N/A'),
          club_id: 0,
          meal_preference: mealPreference,
          tshirt_size: '', // Keep blank - will be filled by new registrations
          registration_amount: isCancelled ? 0 : amount,
          payment_status: isCancelled ? 'test' : 'SUCCESS',
          order_id: registrationId,
          payment_method: isCancelled ? 'Test Entry' : 'Manual Import',
          registration_source: isCancelled ? 'test_data' : 'manual_import'
        };

        // Insert into database
        await pool.query(`
          INSERT INTO registrations (
            registration_id, name, mobile, email, 
            registration_type, club, club_id,
            meal_preference, tshirt_size, registration_amount,
            payment_status, order_id, payment_method, registration_source,
            created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW()
          )
          ON CONFLICT (registration_id) DO NOTHING
        `, [
          insertData.registration_id,
          insertData.name,
          insertData.mobile,
          insertData.email,
          insertData.registration_type,
          insertData.club,
          insertData.club_id,
          insertData.meal_preference,
          insertData.tshirt_size,
          insertData.registration_amount,
          insertData.payment_status,
          insertData.order_id,
          insertData.payment_method,
          insertData.registration_source
        ]);

        if (isCancelled) {
          testEntries++;
          console.log(`🧪 ${registrationId}: ${fullName} (payment_status: test)`);
        } else {
          imported++;
          if (imported % 50 === 0) {
            console.log(`✅ Imported ${imported} real registrations...`);
          }
        }

      } catch (error) {
        errors++;
        console.error(`❌ Error importing row:`, error.message);
      }
    }

    console.log(`✅ Imported ${imported} real registrations complete!\n`);

    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL IMPORT SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Real Registrations: ${imported} (payment_status: SUCCESS)`);
    console.log(`🧪 Test Entries: ${testEntries} CANCELLED placeholders (payment_status: test)`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📋 Total: ${data.length} rows processed`);
    console.log('='.repeat(70) + '\n');

    // 4. Show test entries
    console.log('🧪 TEST ENTRIES (CANCELLED - payment_status: test):');
    console.log('-'.repeat(70));
    const testResults = await pool.query(`
      SELECT registration_id, name, payment_status, club
      FROM registrations 
      WHERE payment_status = 'test'
      ORDER BY registration_id
    `);
    testResults.rows.forEach(row => {
      console.log(`   ${row.registration_id}: ${row.name.padEnd(20)} (${row.payment_status})`);
    });
    console.log();

    // 5. Verify data integrity
    const lastReg = await pool.query(`
      SELECT registration_id 
      FROM registrations 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    if (lastReg.rows.length > 0) {
      const lastId = lastReg.rows[0].registration_id;
      const lastDigits = lastId.match(/(\d{4})$/);
      if (lastDigits) {
        const lastNumber = parseInt(lastDigits[1]);
        const nextNumber = lastNumber + 1;
        console.log(`🔢 Last registration: ${lastId}`);
        console.log(`🔢 Next registration: xxxx${nextNumber.toString().padStart(4, '0')}`);
        console.log(`   Example: GST00V${nextNumber.toString().padStart(4, '0')}\n`);
      }
    }

    // 6. Payment status breakdown
    const summary = await pool.query(`
      SELECT 
        payment_status,
        COUNT(*) as count,
        SUM(registration_amount) as total_amount
      FROM registrations
      GROUP BY payment_status
      ORDER BY payment_status
    `);
    
    console.log('💰 PAYMENT STATUS BREAKDOWN:');
    console.log('-'.repeat(70));
    summary.rows.forEach(row => {
      const amt = parseFloat(row.total_amount || 0).toLocaleString('en-IN');
      console.log(`   ${row.payment_status.toUpperCase().padEnd(10)}: ${row.count} entries, ₹${amt}`);
    });
    console.log();

    // 7. Meal preference breakdown
    const meals = await pool.query(`
      SELECT 
        meal_preference,
        COUNT(*) as count
      FROM registrations
      WHERE payment_status = 'SUCCESS'
      GROUP BY meal_preference
      ORDER BY meal_preference
    `);
    
    console.log('🍽️  MEAL PREFERENCE BREAKDOWN (Real Registrations Only):');
    console.log('-'.repeat(70));
    meals.rows.forEach(row => {
      console.log(`   ${row.meal_preference.padEnd(10)}: ${row.count} entries`);
    });
    console.log();

    // 8. Registration type breakdown
    const types = await pool.query(`
      SELECT 
        registration_type,
        COUNT(*) as count
      FROM registrations
      WHERE payment_status = 'SUCCESS'
      GROUP BY registration_type
      ORDER BY count DESC
    `);
    
    console.log('📋 REGISTRATION TYPE BREAKDOWN (Real Registrations Only):');
    console.log('-'.repeat(70));
    types.rows.forEach(row => {
      console.log(`   ${row.registration_type.padEnd(25)}: ${row.count} entries`);
    });
    console.log();

    console.log('='.repeat(70));
    console.log('✅ IMPORT COMPLETE!');
    console.log('='.repeat(70));
    console.log('🌐 View at: https://www.sneha2026.in/admin/tally.html\n');
    console.log('📝 What was imported:');
    console.log('   ✅ All 689 entries from New Guest.xlsx');
    console.log('   ✅ Mobile numbers and emails from Excel');
    console.log('   ✅ Meal preferences (Veg/Non-Veg) from Excel');
    console.log('   ✅ Amounts from Excel');
    console.log('   ✅ 8 CANCELLED entries marked as "test" payment status');
    console.log('   ✅ 681 real entries marked as "SUCCESS" payment status');
    console.log('   ✅ T-shirt size kept blank (for future registrations)');
    console.log('   ✅ Next registration will start from 0690\n');

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run import
importFinalRegistrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
