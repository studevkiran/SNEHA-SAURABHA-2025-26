// Fix name prefixes: Replace Mr./Mrs./Miss with Rtn.
// Keep initials as-is (e.g., "Mr. A. B. Smith" has initials)
// Usage: node database/fix-name-prefix.js

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Check if name has initials (single letters followed by periods)
function hasInitials(name) {
  // Pattern: single letter followed by period (e.g., "A.", "B.", "Jr.")
  const initialPattern = /\b[A-Z]\.\s/;
  return initialPattern.test(name);
}

async function fixNamePrefixes() {
  console.log('🔧 Fixing name prefixes in club_members table...\n');

  try {
    // Get all members with Mr./Mrs./Miss prefix
    const result = await pool.query(`
      SELECT id, member_name, club_name 
      FROM club_members 
      WHERE member_name LIKE 'Mr.%' 
         OR member_name LIKE 'Mrs.%' 
         OR member_name LIKE 'Miss%'
      ORDER BY club_name, member_name
    `);

    console.log(`📊 Found ${result.rows.length} names to check\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const member of result.rows) {
      try {
        const originalName = member.member_name;
        
        // Check if name has initials - if yes, keep as-is
        if (hasInitials(originalName)) {
          console.log(`⏭️  SKIP (has initials): ${originalName} [${member.club_name}]`);
          skipped++;
          continue;
        }

        // Replace prefix with Rtn.
        let newName = originalName;
        
        if (originalName.startsWith('Mr. ')) {
          newName = originalName.replace(/^Mr\.\s*/, 'Rtn. ');
        } else if (originalName.startsWith('Mrs. ')) {
          newName = originalName.replace(/^Mrs\.\s*/, 'Rtn. ');
        } else if (originalName.startsWith('Miss ')) {
          newName = originalName.replace(/^Miss\s*/, 'Rtn. ');
        }

        // Update database
        await pool.query(
          'UPDATE club_members SET member_name = $1 WHERE id = $2',
          [newName, member.id]
        );

        console.log(`✅ ${originalName} → ${newName} [${member.club_name}]`);
        updated++;

      } catch (err) {
        console.error(`❌ Error updating ${member.member_name}:`, err.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(80));
    console.log(`✅ Updated: ${updated} names`);
    console.log(`⏭️  Skipped (has initials): ${skipped} names`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📋 Total checked: ${result.rows.length}`);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await pool.end();
  }
}

fixNamePrefixes();
