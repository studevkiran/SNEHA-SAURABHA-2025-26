const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function updateClubs() {
    const updates = [
        { id: '2026RTY0006', name: 'Ranganatha Rao', mobile: '9343830682', club: 'Mysore Metro' },
        { id: '2026RTY0029', name: 'Ravindranath Shroff', mobile: '9845108070', club: 'Mysore Metro' },
        { id: '2026RTY0402', name: 'Venkatesha Venkatappa', mobile: '9535712782', club: 'Mysore Metro' },
        { id: '2026RTY0155', name: 'Mohan Gurumurthy', mobile: '9845110711', club: 'Mysore Metro' }
    ];

    console.log('Updating club names to Mysore Metro...\n');

    for (const reg of updates) {
        try {
            const result = await pool.query(
                'UPDATE registrations SET club = $1 WHERE registration_id = $2 RETURNING registration_id, name, club',
                [reg.club, reg.id]
            );
            
            if (result.rows.length > 0) {
                console.log(`✅ Updated: ${result.rows[0].registration_id} - ${result.rows[0].name} → ${result.rows[0].club}`);
            } else {
                console.log(`❌ Not found: ${reg.id} - ${reg.name}`);
            }
        } catch (error) {
            console.error(`❌ Error updating ${reg.id}:`, error.message);
        }
    }

    // Verify updates
    console.log('\n--- Verification ---');
    const verify = await pool.query(
        `SELECT registration_id, name, mobile, club 
         FROM registrations 
         WHERE registration_id IN ('2026RTY0006', '2026RTY0029', '2026RTY0402', '2026RTY0155')
         ORDER BY registration_id`
    );
    
    console.table(verify.rows);
    
    await pool.end();
}

updateClubs().catch(console.error);
