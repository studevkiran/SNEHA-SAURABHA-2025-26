require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

async function findMismatches() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        // Get all unique club names from database
        const dbResult = await pool.query(`
            SELECT DISTINCT club_name
            FROM club_members
            ORDER BY club_name
        `);
        
        const dbClubs = dbResult.rows.map(r => r.club_name);
        
        // Get clubs from JSON
        const jsonClubs = JSON.parse(fs.readFileSync('data/clubs.json', 'utf8'));
        const jsonClubNames = jsonClubs.map(c => c.name);
        
        console.log('=== CLUBS IN DATABASE BUT NOT IN JSON ===\n');
        dbClubs.forEach(dbClub => {
            if (!jsonClubNames.includes(dbClub)) {
                console.log(`❌ "${dbClub}"`);
            }
        });
        
        console.log('\n=== CLUBS IN JSON BUT NOT IN DATABASE ===\n');
        jsonClubNames.forEach(jsonClub => {
            if (!dbClubs.includes(jsonClub)) {
                console.log(`❌ "${jsonClub}"`);
            }
        });
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

findMismatches();
