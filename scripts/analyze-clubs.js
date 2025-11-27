const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function analyzeClubConsistency() {
    console.log('🔍 Starting Club Data Consistency Analysis...');

    // 1. Load Official Club List
    const clubsPath = path.join(__dirname, '../data/clubs.json');
    const clubsData = JSON.parse(fs.readFileSync(clubsPath, 'utf8'));
    const officialClubs = new Set(clubsData.map(c => c.name.trim()));
    console.log(`✅ Loaded ${officialClubs.size} official clubs from data/clubs.json`);

    // 2. Fetch All Registrations from DB
    try {
        const res = await pool.query('SELECT registration_id, name, club FROM registrations');
        const registrations = res.rows;
        console.log(`✅ Fetched ${registrations.length} registrations from database`);

        // 3. Analyze DB Data
        const dbClubs = new Set();
        const invalidClubs = new Map(); // clubName -> count
        const validClubs = new Map();   // clubName -> count

        registrations.forEach(reg => {
            const club = (reg.club || '').trim();
            if (!club) return; // Skip empty

            dbClubs.add(club);

            if (officialClubs.has(club)) {
                validClubs.set(club, (validClubs.get(club) || 0) + 1);
            } else {
                invalidClubs.set(club, (invalidClubs.get(club) || 0) + 1);
            }
        });

        console.log('\n📊 ANALYSIS RESULTS:');
        console.log('----------------------------------------');
        console.log(`Total Unique Clubs in DB: ${dbClubs.size}`);
        console.log(`Matching Official List:   ${validClubs.size}`);
        console.log(`MISMATCHES Found:         ${invalidClubs.size}`);
        console.log('----------------------------------------');

        if (invalidClubs.size > 0) {
            console.log('\n❌ MISMATCHED CLUBS (In DB but not in Official List):');
            console.log('Count | Club Name');
            console.log('------+---------------------------------');
            [...invalidClubs.entries()]
                .sort((a, b) => b[1] - a[1])
                .forEach(([club, count]) => {
                    console.log(`${count.toString().padStart(5)} | "${club}"`);
                });

            console.log('\n💡 SUGGESTED FIXES:');
            // Simple fuzzy match suggestion could go here, but for now just listing is enough
            [...invalidClubs.keys()].forEach(invalid => {
                // Find closest match?
                // For now, let's just assume the user will map them manually or we use a library
                // We'll just print them for the user to see
            });
        } else {
            console.log('\n✅ AMAZING! All clubs in DB match the official list.');
        }

    } catch (err) {
        console.error('❌ Error querying database:', err);
    } finally {
        await pool.end();
    }
}

analyzeClubConsistency();
