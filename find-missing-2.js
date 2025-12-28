// Find the 2 missing registrations (930 total - 928 counted = 2 missing)

const knownCategories = [
    'Rotarian',
    'Rotarian with Spouse',
    'Silver Sponsor',
    'Gold Sponsor',
    'Rotary Ann',
    'Rotaractor',
    'Patron Sponsor',
    'Innerwheel Member',
    'Rotary Annet'
];

async function findMissingRegistrations() {
    try {
        const response = await fetch('https://www.sneha2026.in/api/registrations/list');
        const data = await response.json();
        
        if (!data.success) {
            console.log('❌ Failed to fetch registrations');
            return;
        }
        
        const registrations = data.data.registrations;
        
        // Filter out test entries
        const validRegistrations = registrations.filter(r => 
            r.payment_status !== 'test' && 
            r.payment_status !== 'manual-B'
        );
        
        console.log(`\n📊 Total registrations: ${validRegistrations.length}`);
        
        // Find registrations NOT in the known categories
        const missingRegistrations = validRegistrations.filter(r => 
            !knownCategories.includes(r.registration_type)
        );
        
        console.log(`\n🔍 Found ${missingRegistrations.length} registrations with unknown/different types:\n`);
        
        missingRegistrations.forEach(r => {
            console.log(`ID: ${r.id}`);
            console.log(`Registration ID: ${r.registration_id}`);
            console.log(`Name: ${r.name}`);
            console.log(`Type: "${r.registration_type}" (${typeof r.registration_type})`);
            console.log(`Payment Status: ${r.payment_status}`);
            console.log(`Amount: ₹${r.registration_amount}`);
            console.log(`---`);
        });
        
        // Also check for NULL or empty types
        const nullTypes = validRegistrations.filter(r => 
            !r.registration_type || r.registration_type === '' || r.registration_type === 'null'
        );
        
        if (nullTypes.length > 0) {
            console.log(`\n⚠️ Found ${nullTypes.length} registrations with NULL/empty types:\n`);
            nullTypes.forEach(r => {
                console.log(`ID: ${r.id}, Name: ${r.name}, Status: ${r.payment_status}`);
            });
        }
        
        // Show all unique registration types
        const uniqueTypes = [...new Set(validRegistrations.map(r => r.registration_type))];
        console.log(`\n📋 All unique registration types (${uniqueTypes.length}):`);
        uniqueTypes.sort().forEach(type => {
            const count = validRegistrations.filter(r => r.registration_type === type).length;
            console.log(`  - "${type}": ${count}`);
        });
        
        // Check if there are exact string matches with extra spaces
        console.log(`\n🔍 Checking for spacing issues...`);
        validRegistrations.forEach(r => {
            const trimmed = r.registration_type?.trim();
            if (trimmed !== r.registration_type) {
                console.log(`  - ID ${r.id}: "${r.registration_type}" has extra spaces!`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

findMissingRegistrations();
