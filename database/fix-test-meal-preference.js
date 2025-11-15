// Fix test entries - set meal preference to "CHECK"
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixTestMealPreference() {
  try {
    console.log('\n🔧 Fixing test entries meal preference...\n');
    
    const result = await pool.query(`
      UPDATE registrations 
      SET meal_preference = 'CHECK'
      WHERE payment_status = 'test'
    `);
    
    console.log(`✅ Updated ${result.rowCount} test entries to meal_preference = "CHECK"\n`);
    
    // Verify
    const verify = await pool.query(`
      SELECT registration_id, name, meal_preference, payment_status
      FROM registrations
      WHERE payment_status = 'test'
      ORDER BY registration_id
    `);
    
    console.log('📋 Test entries after update:\n');
    verify.rows.forEach(row => {
      console.log(`   ${row.registration_id}: ${row.name.padEnd(20)} Meal: ${row.meal_preference}`);
    });
    
    // Show meal preference breakdown
    const summary = await pool.query(`
      SELECT meal_preference, COUNT(*) as count
      FROM registrations
      GROUP BY meal_preference
      ORDER BY meal_preference
    `);
    
    console.log('\n🍽️  MEAL PREFERENCE SUMMARY:\n');
    summary.rows.forEach(row => {
      console.log(`   ${row.meal_preference.padEnd(10)}: ${row.count} entries`);
    });
    console.log();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixTestMealPreference();
