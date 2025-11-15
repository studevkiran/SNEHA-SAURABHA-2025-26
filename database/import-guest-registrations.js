// Import Guest.xlsx registrations to database
// Usage: node database/import-guest-registrations.js

const XLSX = require('xlsx');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function importGuestRegistrations() {
  console.log('📊 Starting Guest.xlsx import...\n');

  try {
    // 1. Read Excel file
    const workbook = XLSX.readFile('./public/Guest.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✅ Found ${data.length} rows in Excel file\n`);

    // 2. Clear existing data (optional - comment out if you want to keep)
    // await pool.query('TRUNCATE TABLE registrations RESTART IDENTITY CASCADE');
    // console.log('🗑️  Cleared existing registrations\n');

    // 3. Process each row
    let imported = 0;
    let cancelled = 0;
    let errors = 0;

    for (const row of data) {
      try {
        // Extract data from Excel
        const registrationId = row['Registration No'] || '';
        const fullName = row['Name'] || '';
        const registrationType = row['Registration Type'] || 'Guest';
        const clubName = row['Club'] || '';
        
        // Default values (not in Excel)
        const mobile = '0000000000'; // Default mobile since Excel doesn't have it and DB requires NOT NULL
        const email = 'Not Provided'; // Not in Excel
        const mealPreference = 'Veg'; // Default
        const tshirtSize = 'M'; // Default
        
        // Amount based on registration type
        const amountMap = {
          'ROTARIAN': 7500,
          'ROTARIAN WITH SPOUSE': 14000,
          'ANN': 7500,
          'ANNET': 7500,
          'GUEST': 5000,
          'ROTARACTOR': 3000
        };
        const amount = amountMap[registrationType.toUpperCase()] || 0;

        // Check if this is a CANCELLED entry
        const isCancelled = !fullName || 
                          fullName === '' || 
                          fullName.toUpperCase() === 'CANCELLED' ||
                          fullName.toUpperCase() === 'DUMMY';

        // Standardize club names
        let standardClubName = clubName;
        if (clubName) {
          const lowerClub = clubName.toLowerCase().trim();
          if (lowerClub === 'mid-town' || lowerClub === 'mid town') {
            standardClubName = 'Midtown';
          }
        }

        // Prepare data for insertion (using correct column names from schema)
        const insertData = {
          registration_id: registrationId,
          name: isCancelled ? 'CANCELLED' : fullName,
          mobile: isCancelled ? '0000000000' : mobile,
          email: isCancelled ? 'cancelled@placeholder.com' : (email || 'Not Provided'),
          registration_type: registrationType,
          club: isCancelled ? 'N/A' : (standardClubName || 'N/A'),
          club_id: 0,
          meal_preference: isCancelled ? 'Veg' : mealPreference,
          tshirt_size: isCancelled ? 'M' : tshirtSize,
          registration_amount: isCancelled ? 0 : amount,
          payment_status: isCancelled ? 'CANCELLED' : 'SUCCESS',
          order_id: registrationId,
          payment_method: 'Manual Import',
          registration_source: 'manual_import'
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
          cancelled++;
          console.log(`⚠️  ${registrationId}: CANCELLED (placeholder)`);
        } else {
          imported++;
          console.log(`✅ ${registrationId}: ${fullName}`);
        }

      } catch (error) {
        errors++;
        console.error(`❌ Error importing row:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Imported: ${imported} registrations`);
    console.log(`⚠️  Cancelled: ${cancelled} placeholders`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📋 Total: ${data.length} rows processed`);
    console.log('='.repeat(50) + '\n');

    // 4. Verify highest registration number
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

    console.log('✅ Import complete!\n');
    console.log('🌐 View at: https://www.sneha2026.in/admin/tally.html\n');

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run import
importGuestRegistrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
