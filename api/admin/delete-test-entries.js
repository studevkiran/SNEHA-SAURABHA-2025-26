const { Pool } = require('pg');

// Use environment variable from Vercel (must run with proper env)
const connectionString = process.argv[2];

if (!connectionString) {
  console.error('❌ Usage: node delete-test-entries.js <POSTGRES_URL>');
  console.error('Get POSTGRES_URL from: https://vercel.com/kirans-projects-cb89f9d8/sneha2026/settings/environment-variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function deleteTestEntries() {
  const testIds = [
    'ROT54V0694',    // Old format test (Rtn. Satish Kumar K R, manual-B)
    '2026RTY0693',   // TESTER entry
    '2026RTY0695'    // TEST (just created with Mysore Metro)
  ];
  
  try {
    for (const id of testIds) {
      console.log(`\n🗑️  Deleting ${id}...`);
      
      const result = await pool.query(
        'DELETE FROM registrations WHERE registration_id = $1 RETURNING *',
        [id]
      );
      
      if (result.rowCount > 0) {
        console.log(`✅ Deleted: ${result.rows[0].name} (${result.rows[0].mobile})`);
      } else {
        console.log(`⚠️  Not found: ${id}`);
      }
    }
    
    console.log('\n✅ Cleanup complete!');
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

deleteTestEntries();
