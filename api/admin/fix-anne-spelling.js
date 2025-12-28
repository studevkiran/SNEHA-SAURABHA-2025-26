// Fix spelling inconsistency: "ROTARY ANNE" → "Rotary Ann"
// Direct SQL update for IDs: 2696, 2516

const { Pool } = require('pg');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    let client;
    try {
        client = await pool.connect();

        client = await pool.connect();

        console.log('🔍 Finding registrations with "ROTARY ANNE"...');

        // Find all registrations with "ROTARY ANNE" - specific IDs: 2696, 2516
        const wrongSpelling = await client.query(`
            SELECT id, registration_id, name, registration_type 
            FROM registrations 
            WHERE id IN (2696, 2516)
            ORDER BY id
        `);

        console.log(`Found ${wrongSpelling.rows.length} registrations to fix`);

        if (wrongSpelling.rows.length === 0) {
            return res.json({
                success: true,
                message: 'No registrations found to fix',
                fixed: 0
            });
        }

        // Update them to "Rotary Ann"
        const result = await client.query(`
            UPDATE registrations 
            SET registration_type = 'Rotary Ann'
            WHERE id IN (2696, 2516)
            RETURNING id, registration_id, name, registration_type
        `);

        console.log('✅ Fixed registrations:', result.rows);

        res.json({
            success: true,
            message: `Fixed spelling for ${result.rows.length} registrations`,
            fixed: result.rows.length,
            registrations: result.rows.map(r => ({
                id: r.id,
                registration_id: r.registration_id,
                name: r.name,
                new_type: r.registration_type
            }))
        });

    } catch (error) {
        console.error('❌ Error fixing spelling:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    } finally {
        if (client) client.release();
        await pool.end();
    }
};
