const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function analyzeZones() {
  try {
    console.log('\n🗺️  ANALYZING CLUBS AND ZONES\n');
    
    // Get all unique clubs
    const clubs = await pool.query(`
      SELECT DISTINCT club, COUNT(*) as count
      FROM registrations
      WHERE payment_status = 'SUCCESS'
      GROUP BY club
      ORDER BY club
    `);
    
    console.log(`📊 Total Clubs: ${clubs.rows.length}\n`);
    console.log('CLUBS LIST:\n');
    clubs.rows.forEach(row => {
      console.log(`   ${row.club.padEnd(40)} - ${row.count} registrations`);
    });
    
    console.log('\n💡 Please provide zone mapping for these clubs\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeZones();
