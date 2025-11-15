// Update registration dates from DATA.xlsx (properly sorted dates)
const XLSX = require('xlsx');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function excelDateToJSDate(excelDate) {
  // Excel date starts from 1900-01-01
  // JavaScript date calculation
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const excelEpoch = new Date(1900, 0, 1).getTime();
  const daysOffset = excelDate - 2; // Excel has 2-day offset bug
  return new Date(excelEpoch + (daysOffset * millisecondsPerDay));
}

async function updateDates() {
  console.log('📅 Updating registration dates from DATA.xlsx...\n');

  try {
    // Read DATA.xlsx
    const workbook = XLSX.readFile('./public/DATA.xlsx');
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✅ Found ${data.length} rows in DATA.xlsx\n`);

    let updated = 0;
    let errors = 0;

    for (const row of data) {
      try {
        const registrationId = row['App No.'];
        const excelDate = row['Date'];
        
        if (!registrationId || !excelDate) {
          continue;
        }

        // Convert Excel date to JavaScript date
        let dateObj;
        if (typeof excelDate === 'number') {
          dateObj = excelDateToJSDate(excelDate);
        } else if (typeof excelDate === 'string') {
          dateObj = new Date(excelDate);
        } else {
          continue;
        }

        // Update in database
        const result = await pool.query(`
          UPDATE registrations 
          SET created_at = $1,
              updated_at = $1
          WHERE registration_id = $2
        `, [dateObj, registrationId]);

        if (result.rowCount > 0) {
          updated++;
          if (updated % 100 === 0) {
            console.log(`✅ Updated ${updated} dates...`);
          }
        }

      } catch (error) {
        errors++;
        console.error(`❌ Error updating ${row['App No.']}: ${error.message}`);
      }
    }

    console.log(`\n✅ Updated ${updated} registration dates\n`);

    // Show sample of updated dates
    console.log('📅 SAMPLE OF UPDATED DATES:\n');
    const sample = await pool.query(`
      SELECT registration_id, name, created_at
      FROM registrations
      ORDER BY created_at ASC
      LIMIT 10
    `);

    sample.rows.forEach(row => {
      const date = new Date(row.created_at).toLocaleDateString('en-IN');
      console.log(`   ${row.registration_id}: ${row.name.padEnd(30)} - ${date}`);
    });

    console.log('\n📊 DATE RANGE:\n');
    const range = await pool.query(`
      SELECT 
        MIN(created_at) as earliest,
        MAX(created_at) as latest
      FROM registrations
    `);

    if (range.rows.length > 0) {
      const earliest = new Date(range.rows[0].earliest).toLocaleDateString('en-IN');
      const latest = new Date(range.rows[0].latest).toLocaleDateString('en-IN');
      console.log(`   Earliest: ${earliest}`);
      console.log(`   Latest:   ${latest}`);
    }

    console.log('\n✅ Date update complete!\n');

  } catch (error) {
    console.error('❌ Update failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

updateDates();
