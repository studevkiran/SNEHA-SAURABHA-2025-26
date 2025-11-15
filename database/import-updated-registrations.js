// Import updated registrations from excellfile.xlsx (Sheet 2)
// With 8 entries marked as "test" payment status
// Usage: node database/import-updated-registrations.js

const XLSX = require('xlsx');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Define which 8 entries should be marked as "test"
// Using entries 0001-0008 for testing
const TEST_ENTRY_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

async function importUpdatedRegistrations() {
  console.log('📊 Starting import from excellfile.xlsx (Sheet 2)...\n');

  try {
    // 1. Read Excel file - Sheet 2
    const workbook = XLSX.readFile('./public/excellfile.xlsx');
    const sheetName = workbook.SheetNames[1]; // Sheet 2
    console.log(`📄 Reading: ${sheetName}`);
    
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
        const rowNumber = row['Column1'];
        const registrationId = row['App No.'] || '';
        const fullName = row['Name'] || '';
        const mobile = row['Mobile'] ? String(row['Mobile']) : '0000000000';
        const email = row['eMail'] || 'Not Provided';
        const registrationType = row['Registration Type'] || 'Guest';
        const clubName = row['Club Name'] || '';
        const amount = parseFloat(row['Column2'] || 0);

        // Check if this should be a test entry
        const isTestEntry = TEST_ENTRY_NUMBERS.includes(rowNumber);

        // Standardize club names
        let standardClubName = clubName;
        if (clubName) {
          const lowerClub = clubName.toLowerCase().trim();
          if (lowerClub.includes('mid-town') || lowerClub.includes('mid town') || lowerClub === 'mysore midtown') {
            standardClubName = 'Mysore Midtown';
          }
        }

        // For test entries, keep minimal/blank data
        const insertData = {
          registration_id: registrationId,
          name: isTestEntry ? 'TEST ENTRY' : fullName,
          mobile: isTestEntry ? '0000000000' : mobile,
          email: isTestEntry ? 'test@example.com' : email,
          registration_type: isTestEntry ? 'Guest' : registrationType,
          club: isTestEntry ? 'Test Club' : (standardClubName || 'N/A'),
          club_id: 0,
          meal_preference: 'Veg', // Default since not in Excel
          tshirt_size: '', // Keep blank as per your requirement
          registration_amount: isTestEntry ? 0 : amount,
          payment_status: isTestEntry ? 'test' : 'SUCCESS',
          order_id: registrationId,
          payment_method: isTestEntry ? 'Test Payment' : 'Manual Import',
          registration_source: isTestEntry ? 'test_data' : 'manual_import'
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

        if (isTestEntry) {
          testEntries++;
          console.log(`🧪 ${registrationId}: TEST ENTRY (payment_status: test)`);
        } else {
          imported++;
          console.log(`✅ ${registrationId}: ${fullName}`);
        }

      } catch (error) {
        errors++;
        console.error(`❌ Error importing row:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Imported: ${imported} real registrations (payment_status: SUCCESS)`);
    console.log(`🧪 Test Entries: ${testEntries} entries (payment_status: test)`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📋 Total: ${data.length} rows processed`);
    console.log('='.repeat(60) + '\n');

    // 4. Show test entries details
    console.log('🧪 TEST ENTRIES (payment_status: test):');
    const testResults = await pool.query(`
      SELECT registration_id, name, payment_status, mobile, email
      FROM registrations 
      WHERE payment_status = 'test'
      ORDER BY registration_id
    `);
    testResults.rows.forEach(row => {
      console.log(`   ${row.registration_id}: ${row.name} (${row.payment_status})`);
    });
    console.log();

    // 5. Verify highest registration number
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
        console.log(`🔢 Next registration will be: xxxx${nextNumber.toString().padStart(4, '0')}`);
        console.log(`   Example: GST00V${nextNumber.toString().padStart(4, '0')}\n`);
      }
    }

    // 6. Show data summary
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
    summary.rows.forEach(row => {
      console.log(`   ${row.payment_status.toUpperCase()}: ${row.count} entries, ₹${parseFloat(row.total_amount).toLocaleString('en-IN')}`);
    });
    console.log();

    console.log('✅ Import complete!\n');
    console.log('🌐 View at: https://www.sneha2026.in/admin/tally.html\n');
    console.log('📝 Notes:');
    console.log('   - 8 entries marked as "test" payment status (entries 0001-0008)');
    console.log('   - All entries have blank t-shirt size (will be filled on new registrations)');
    console.log('   - Meal preference set to "Veg" as default (not in Excel)');
    console.log('   - Mobile numbers and emails imported from Excel');
    console.log('   - Next registration will start from 0690\n');

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run import
importUpdatedRegistrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
