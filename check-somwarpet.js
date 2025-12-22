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

async function checkSomwarpet() {
  try {
    console.log('🔍 Checking all Somwarpet registrations...\n');
    
    const data = await fetchRegistrations();
    const allRegs = data.registrations || [];

    // Find all Somwarpet variations
    const somwarpet = allRegs.filter(r => {
      if (r.payment_status === 'test') return false;
      const club = (r.club || '').toLowerCase();
      return club.includes('somwarpet') || club.includes('somvarpet') || club.includes('somawarpet');
    });

    console.log(`📊 Found ${somwarpet.length} registrations with "Somwarpet" in club name\n`);

    // Group by exact club name
    const byClubName = {};
    somwarpet.forEach(r => {
      const club = r.club || 'NO CLUB';
      if (!byClubName[club]) byClubName[club] = [];
      byClubName[club].push(r);
    });

    console.log('🏢 CLUB NAME VARIATIONS:\n');
    Object.entries(byClubName).forEach(([club, regs]) => {
      console.log(`${club}: ${regs.length} registration(s)`);
      
      // Show zone distribution
      const zones = {};
      regs.forEach(r => {
        const zone = r.zone || 'NULL';
        zones[zone] = (zones[zone] || 0) + 1;
      });
      
      console.log('   Zones:');
      Object.entries(zones).forEach(([zone, count]) => {
        console.log(`      ${zone}: ${count}`);
      });
      console.log('');
    });

    console.log('\n📋 DETAILED LIST:\n');
    somwarpet.forEach(r => {
      console.log(`ID: ${r.id} | ${r.registration_id}`);
      console.log(`   Name: ${r.name}`);
      console.log(`   Club: "${r.club}"`);
      console.log(`   Zone: ${r.zone || 'NULL'}`);
      console.log(`   Status: ${r.payment_status}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSomwarpet();
