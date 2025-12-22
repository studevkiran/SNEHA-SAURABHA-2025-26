const https = require('https');

function fetchRegistrations() {
  return new Promise((resolve, reject) => {
    https.get('https://www.sneha2026.in/api/registrations/list', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.data || parsed);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function investigateSomwarpet() {
  try {
    console.log('🔍 Investigating why 2 Somwarpet registrations have NULL zones...\n');
    
    const data = await fetchRegistrations();
    const allRegs = data.registrations || [];

    // Get all Somwarpet registrations
    const somwarpet = allRegs.filter(r => {
      if (r.payment_status === 'test') return false;
      const club = (r.club || '').toLowerCase();
      return club.includes('somwarpet');
    }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    console.log(`📊 Total Somwarpet registrations: ${somwarpet.length}\n`);

    console.log('📅 CHRONOLOGICAL ORDER:\n');
    console.log('=' .repeat(100));

    somwarpet.forEach((r, idx) => {
      const hasZone = r.zone ? '✅' : '❌';
      console.log(`\n${idx + 1}. ${hasZone} ID: ${r.id} | ${r.registration_id}`);
      console.log(`   Date: ${new Date(r.created_at).toLocaleString()}`);
      console.log(`   Name: ${r.name}`);
      console.log(`   Club: "${r.club}" (exact spelling)`);
      console.log(`   Zone: ${r.zone || 'NULL'}`);
      console.log(`   Payment Status: ${r.payment_status}`);
      console.log(`   Order ID: ${r.order_id || 'N/A'}`);
      console.log(`   Payment ID: ${r.payment_id || 'N/A'}`);
      console.log(`   Club ID: ${r.club_id || 'N/A'}`);
    });

    console.log('\n\n🔍 ANALYSIS:\n');
    
    // Check for exact club name differences
    const clubNames = new Set(somwarpet.map(r => r.club));
    console.log(`Different club name spellings found: ${clubNames.size}`);
    clubNames.forEach(name => {
      const count = somwarpet.filter(r => r.club === name).length;
      const withZone = somwarpet.filter(r => r.club === name && r.zone).length;
      const withoutZone = somwarpet.filter(r => r.club === name && !r.zone).length;
      console.log(`   "${name}": ${count} total (${withZone} with zone, ${withoutZone} without)`);
    });

    // Check if NULL zone ones are recent
    const nullZones = somwarpet.filter(r => !r.zone);
    console.log(`\n❌ Registrations with NULL zones: ${nullZones.length}`);
    nullZones.forEach(r => {
      console.log(`   ${r.id} | Created: ${new Date(r.created_at).toLocaleString()} | Status: ${r.payment_status}`);
    });

    // Check if they were created after a certain date
    if (nullZones.length > 0) {
      const nullDates = nullZones.map(r => new Date(r.created_at));
      const withZoneDates = somwarpet.filter(r => r.zone).map(r => new Date(r.created_at));
      
      console.log(`\n📅 Timeline:`);
      console.log(`   Last registration WITH zone: ${new Date(Math.max(...withZoneDates)).toLocaleString()}`);
      console.log(`   First NULL zone registration: ${new Date(Math.min(...nullDates)).toLocaleString()}`);
      console.log(`   Last NULL zone registration: ${new Date(Math.max(...nullDates)).toLocaleString()}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

investigateSomwarpet();
