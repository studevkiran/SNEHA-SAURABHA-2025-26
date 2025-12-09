// Fix the 2 registrations with NULL zones
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

(async () => {
    try {
        console.log('🔧 Fixing unmapped zones...\n');
        
        // Update the 2 registrations with correct zones
        const updates = [
            { id: '2026RTY0778', club: 'Somwarpet Hills', zone: 'Zone 6B' },
            { id: '2026RTY0772', club: 'Ivory City Mysuru', zone: 'Zone 7B' }
        ];
        
        for (const { id, club, zone } of updates) {
            const result = await pool.query(
                'UPDATE registrations SET zone = $1 WHERE registration_id = $2 RETURNING registration_id, name, club, zone',
                [zone, id]
            );
            
            if (result.rows.length > 0) {
                console.log(`✅ Updated ${result.rows[0].registration_id} - ${result.rows[0].name}`);
                console.log(`   Club: ${result.rows[0].club}`);
                console.log(`   Zone: ${result.rows[0].zone}\n`);
            } else {
                console.log(`❌ Registration ${id} not found\n`);
            }
        }
        
        console.log('✅ Zone fix complete!');
        console.log('\nVerifying...');
        
        // Verify no more NULL zones
        const nullZones = await pool.query(
            `SELECT registration_id, name, club, zone 
             FROM registrations 
             WHERE payment_status != 'test' 
             AND (zone IS NULL OR zone = '')`
        );
        
        if (nullZones.rows.length === 0) {
            console.log('✅ No more NULL zones found!');
        } else {
            console.log(`⚠️  Still ${nullZones.rows.length} registrations with NULL zones:`);
            nullZones.rows.forEach(r => {
                console.log(`   - ${r.registration_id} - ${r.name} | ${r.club}`);
            });
        }
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
})();
