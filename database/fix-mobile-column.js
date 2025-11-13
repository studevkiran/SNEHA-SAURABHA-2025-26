// Fix mobile column length
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function fixMobileColumn() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  console.log('🔧 Fixing mobile column length...');
  
  await pool.query(`
    ALTER TABLE club_members 
    ALTER COLUMN mobile TYPE VARCHAR(50);
  `);
  
  console.log('✅ Mobile column updated to VARCHAR(50)');
  
  console.log('🔧 Fixing member_name column length...');
  
  await pool.query(`
    ALTER TABLE club_members 
    ALTER COLUMN member_name TYPE VARCHAR(500);
  `);
  
  console.log('✅ Member name column updated to VARCHAR(500)');
  
  await pool.end();
}

fixMobileColumn()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
