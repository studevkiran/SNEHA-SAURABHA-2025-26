require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');

async function syncClubNames() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        // Get all unique club names from database with member counts
        const dbResult = await pool.query(`
            SELECT DISTINCT club_name, COUNT(*) as member_count
            FROM club_members
            GROUP BY club_name
            ORDER BY club_name
        `);
        
        // Load existing clubs.json to preserve IDs
        const existingClubs = JSON.parse(fs.readFileSync('data/clubs.json', 'utf8'));
        
        // Create a map of existing clubs by name (case-insensitive)
        const existingMap = new Map();
        existingClubs.forEach(club => {
            existingMap.set(club.name.toLowerCase().replace(/[^a-z0-9]/g, ''), club);
        });
        
        // Build new clubs array
        const newClubs = [];
        let nextId = Math.max(...existingClubs.map(c => c.id)) + 1;
        
        dbResult.rows.forEach(row => {
            const dbClubName = row.club_name;
            const normalizedName = dbClubName.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            // Try to find existing club with similar name
            let existingClub = existingMap.get(normalizedName);
            
            if (existingClub) {
                // Use existing ID, update name to match database
                newClubs.push({
                    id: existingClub.id,
                    name: dbClubName,
                    memberCount: row.member_count
                });
            } else {
                // New club not found in existing, assign new ID
                newClubs.push({
                    id: nextId++,
                    name: dbClubName,
                    memberCount: row.member_count
                });
            }
        });
        
        // Sort by name
        newClubs.sort((a, b) => a.name.localeCompare(b.name));
        
        // Remove memberCount before saving (it's just for info)
        const clubsToSave = newClubs.map(({ memberCount, ...club }) => club);
        
        // Show summary
        console.log(`\n📊 Summary:`);
        console.log(`   Total clubs in database: ${dbResult.rows.length}`);
        console.log(`   Total clubs in old JSON: ${existingClubs.length}`);
        console.log(`   Total clubs in new JSON: ${clubsToSave.length}`);
        console.log(`\n✅ Clubs with members:\n`);
        newClubs.slice(0, 10).forEach(club => {
            console.log(`   ${club.name} (${club.memberCount} members)`);
        });
        console.log(`   ... and ${newClubs.length - 10} more clubs\n`);
        
        // Save to both data/clubs.json and public/data/clubs.json
        fs.writeFileSync('data/clubs.json', JSON.stringify(clubsToSave, null, 2));
        fs.writeFileSync('public/data/clubs.json', JSON.stringify(clubsToSave, null, 2));
        
        console.log('✅ Updated data/clubs.json');
        console.log('✅ Updated public/data/clubs.json');
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

syncClubNames();
