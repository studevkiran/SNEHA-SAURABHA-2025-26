require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkClubNames() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        // Get unique club names from database
        const result = await pool.query(`
            SELECT DISTINCT club_name, COUNT(*) as member_count
            FROM club_members
            WHERE club_name ILIKE '%mysore%' OR club_name ILIKE '%krishna%'
            GROUP BY club_name
            ORDER BY club_name
        `);
        
        console.log('Clubs in database with Mysore or Krishna:\n');
        result.rows.forEach(row => {
            console.log(`${row.club_name} (${row.member_count} members)`);
        });
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkClubNames();
