#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { query } = require('./lib/db-neon');

async function fixClubNameSpaces() {
  console.log('🔧 Fixing club names with trailing spaces...\n');
  
  try {
    // Find clubs with trailing spaces
    const result = await query(`
      SELECT DISTINCT club 
      FROM registrations 
      WHERE club LIKE '% '
      ORDER BY club
    `);
    
    console.log(`Found ${result.rows.length} club names with trailing spaces:\n`);
    
    for (const row of result.rows) {
      const oldName = row.club;
      const newName = oldName.trim();
      
      console.log(`Fixing: "${oldName}" → "${newName}"`);
      
      const updateResult = await query(
        'UPDATE registrations SET club = $1 WHERE club = $2',
        [newName, oldName]
      );
      
      console.log(`  ✅ Updated ${updateResult.rowCount} registrations\n`);
    }
    
    console.log('✅ All club names fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixClubNameSpaces();
