// Delete test registrations SS00027, SS00028, SS00029
const { Pool } = require('pg');

// Vercel environment variables
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function deleteTestRecords() {
  try {
    console.log('🔍 Searching for test registrations to delete...\n');

    // First, check what we're about to delete
    const checkQuery = `
      SELECT registration_id, name, mobile, email, registration_type, registration_amount, created_at
      FROM registrations
      WHERE registration_id IN ('SS00027', 'SS00028', 'SS00029')
      ORDER BY registration_id;
    `;

    const check = await pool.query(checkQuery);

    if (check.rows.length === 0) {
      console.log('✅ No test records found (SS00027-29). Database is clean.\n');
      await pool.end();
      return;
    }

    console.log(`⚠️  Found ${check.rows.length} test record(s) to delete:\n`);
    check.rows.forEach(row => {
      console.log(`❌ ${row.registration_id} - ${row.name}`);
      console.log(`   Mobile: ${row.mobile}`);
      console.log(`   Email: ${row.email}`);
      console.log(`   Type: ${row.registration_type}`);
      console.log(`   Amount: ₹${row.registration_amount}`);
      console.log(`   Created: ${row.created_at}\n`);
    });

    // Delete them
    const deleteQuery = `
      DELETE FROM registrations
      WHERE registration_id IN ('SS00027', 'SS00028', 'SS00029')
      RETURNING registration_id;
    `;

    const result = await pool.query(deleteQuery);

    console.log(`✅ Successfully deleted ${result.rows.length} test record(s):`);
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.registration_id}`);
    });
    console.log('\n📊 Database cleaned. Ready for fresh testing.\n');

  } catch (error) {
    console.error('❌ Error deleting records:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

deleteTestRecords();
