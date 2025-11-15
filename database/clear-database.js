// Clear all registrations from database
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function clearDatabase() {
  try {
    console.log('\n⚠️  WARNING: This will delete ALL registrations!\n');
    
    const result = await pool.query('DELETE FROM registrations');
    console.log(`✅ Deleted ${result.rowCount} registrations\n`);
    
    // Verify empty
    const count = await pool.query('SELECT COUNT(*) FROM registrations');
    console.log(`📊 Current count: ${count.rows[0].count}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

clearDatabase();
