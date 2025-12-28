// Fix spelling inconsistency: "ROTARY ANNE" → "Rotary Ann"

const { neon } = require('@neondatabase/serverless');

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

    try {
        const sql = neon(process.env.DATABASE_URL);

        console.log('🔍 Finding registrations with "ROTARY ANNE"...');

        // Find all registrations with "ROTARY ANNE"
        const wrongSpelling = await sql`
            SELECT id, registration_id, name, registration_type 
            FROM registrations 
            WHERE registration_type = 'ROTARY ANNE'
            AND payment_status NOT IN ('test', 'manual-B')
            ORDER BY id
        `;

        console.log(`Found ${wrongSpelling.length} registrations to fix`);

        if (wrongSpelling.length === 0) {
            return res.json({
                success: true,
                message: 'No registrations found with "ROTARY ANNE"',
                fixed: 0
            });
        }

        // Update them to "Rotary Ann"
        const result = await sql`
            UPDATE registrations 
            SET registration_type = 'Rotary Ann'
            WHERE registration_type = 'ROTARY ANNE'
            AND payment_status NOT IN ('test', 'manual-B')
            RETURNING id, registration_id, name, registration_type
        `;

        console.log('✅ Fixed registrations:', result);

        res.json({
            success: true,
            message: `Fixed spelling for ${result.length} registrations`,
            fixed: result.length,
            registrations: result.map(r => ({
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
    }
};
