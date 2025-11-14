/**
 * Remove duplicate entries from club_members table
 * Keep only one copy of each unique member
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function removeDuplicates() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        console.log('🔍 Finding duplicates...\n');
        
        // Count duplicates
        const dupeCount = await pool.query(`
            SELECT COUNT(*) as total
            FROM (
                SELECT club_name, member_name, COUNT(*) as cnt
                FROM club_members
                GROUP BY club_name, member_name
                HAVING COUNT(*) > 1
            ) as dupes
        `);
        
        console.log(`Found ${dupeCount.rows[0].total} members with duplicates\n`);
        
        // Get total before
        const beforeCount = await pool.query('SELECT COUNT(*) as total FROM club_members');
        console.log(`Total entries before: ${beforeCount.rows[0].total}`);
        
        // Delete duplicates, keeping the one with the lowest ID
        console.log('\n🗑️  Removing duplicates...\n');
        
        const result = await pool.query(`
            DELETE FROM club_members
            WHERE id IN (
                SELECT id
                FROM (
                    SELECT id,
                           ROW_NUMBER() OVER (
                               PARTITION BY club_name, member_name, COALESCE(email, ''), COALESCE(mobile, '')
                               ORDER BY id
                           ) as rnum
                    FROM club_members
                ) t
                WHERE t.rnum > 1
            )
            RETURNING id
        `);
        
        console.log(`✅ Deleted ${result.rows.length} duplicate entries`);
        
        // Get total after
        const afterCount = await pool.query('SELECT COUNT(*) as total FROM club_members');
        console.log(`Total entries after: ${afterCount.rows[0].total}`);
        
        // Verify no more duplicates
        const remaining = await pool.query(`
            SELECT club_name, member_name, COUNT(*) as cnt
            FROM club_members
            GROUP BY club_name, member_name
            HAVING COUNT(*) > 1
        `);
        
        console.log(`\n✅ Remaining duplicates: ${remaining.rows.length}`);
        
        // Show club counts
        console.log('\n📊 Club member counts after cleanup:\n');
        const clubs = await pool.query(`
            SELECT club_name, COUNT(*) as members
            FROM club_members
            GROUP BY club_name
            ORDER BY club_name
        `);
        
        clubs.rows.forEach(row => {
            console.log(`${row.club_name.padEnd(40)} : ${row.members} members`);
        });
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
        process.exit(1);
    }
}

removeDuplicates();
