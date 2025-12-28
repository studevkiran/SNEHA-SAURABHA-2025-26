// Fix spelling inconsistency: "ROTARY ANNE" → "Rotary Ann"
// Direct database update script

const https = require('https');

async function fixSpelling() {
    try {
        console.log('🔍 Fetching all registrations...');
        
        const response = await fetch('https://www.sneha2026.in/api/registrations/list');
        const data = await response.json();
        
        if (!data.success) {
            console.log('❌ Failed to fetch registrations');
            return;
        }
        
        const registrations = data.data.registrations;
        
        // Find registrations with "ROTARY ANNE"
        const wrongSpelling = registrations.filter(r => 
            r.registration_type === 'ROTARY ANNE' &&
            r.payment_status !== 'test' &&
            r.payment_status !== 'manual-B'
        );
        
        console.log(`\n📋 Found ${wrongSpelling.length} registrations with "ROTARY ANNE":\n`);
        
        wrongSpelling.forEach(r => {
            console.log(`ID: ${r.id}, Reg ID: ${r.registration_id}, Name: ${r.name}`);
        });
        
        if (wrongSpelling.length === 0) {
            console.log('\n✅ No registrations need fixing!');
            return;
        }
        
        console.log(`\n🔧 To fix these ${wrongSpelling.length} registrations, run this SQL:`);
        console.log('\nUPDATE registrations');
        console.log("SET registration_type = 'Rotary Ann'");
        console.log("WHERE registration_type = 'ROTARY ANNE'");
        console.log("AND payment_status NOT IN ('test', 'manual-B');");
        console.log('\nOr use the API endpoint: POST /api/admin/fix-anne-spelling');
        
        // Show the IDs
        const ids = wrongSpelling.map(r => r.id).join(', ');
        console.log(`\nIDs to update: ${ids}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fixSpelling();
