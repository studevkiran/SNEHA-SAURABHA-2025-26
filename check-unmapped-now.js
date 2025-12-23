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

async function checkUnmapped() {
  try {
    console.log('🔍 Fetching registrations from production...\n');
    
    const data = await fetchRegistrations();
    const allRegs = data.registrations || [];

    const unmapped = allRegs.filter(r => {
      if (r.payment_status === 'test' || r.payment_status !== 'completed') return false;
      if (!r.zone || r.zone === '' || r.zone === 'Unmapped') return true;
      const match = r.zone.match(/Zone\s+(\d+)[A-Z]?/i);
      return !match;
    });

    console.log(`📊 TOTAL UNMAPPED: ${unmapped.length} registrations\n`);

    if (unmapped.length === 0) {
      console.log('✅ No unmapped registrations found!\n');
      return;
    }

    const clubGroups = {};
    unmapped.forEach(r => {
      const club = r.club || 'NO CLUB/GUEST';
      if (!clubGroups[club]) clubGroups[club] = [];
      clubGroups[club].push(r);
    });

    Object.entries(clubGroups).sort((a,b) => b[1].length - a[1].length).forEach(([club, regs]) => {
      console.log(`🏢 ${club} (${regs.length} registration${regs.length > 1 ? 's' : ''}):`);
      regs.forEach(r => {
        console.log(`   • ID: ${r.id}`);
        console.log(`     Name: ${r.name}`);
        console.log(`     Type: ${r.registration_type}`);
        console.log(`     Phone: ${r.phone}`);
        console.log(`     Email: ${r.email}`);
        console.log(`     Zone: ${r.zone || 'NULL'}`);
        console.log('');
      });
    });

    console.log('\n📋 SUMMARY:');
    console.log(`   Total: ${unmapped.length} unmapped`);
    console.log(`   Clubs: ${Object.keys(clubGroups).length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUnmapped();
