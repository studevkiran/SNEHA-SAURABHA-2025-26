const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'registrations'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 registrations table columns:\n');
    result.rows.forEach(col => {
      console.log(`  ${col.column_name.padEnd(30)} ${col.data_type}`);
    });
    console.log();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
