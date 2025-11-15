const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_xwvxNIcm5tz2@ep-spring-pond-a5smywgs-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require');

async function checkRegistrations() {
    try {
        console.log('Fetching registrations...\n');
        
        const result = await sql`
            SELECT registration_id, name, mobile, club
            FROM registrations 
            WHERE registration_id IN ('2026RTY0006', '2026RTY0029', '2026RTY0402', '2026RTY0155')
            ORDER BY registration_id
        `;
        
        console.log('Current club assignments:\n');
        console.table(result);
        
        console.log(`\nTotal found: ${result.length} registrations`);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkRegistrations();
