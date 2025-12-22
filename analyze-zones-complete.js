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

async function analyzeZones() {
  try {
    console.log('🔍 Fetching all registrations...\n');
    
    const data = await fetchRegistrations();
    const allRegs = data.registrations || [];

    console.log(`Total registrations: ${allRegs.length}\n`);

    // Count by zone including all statuses
    const zoneStats = {};
    const completedByZone = {};
    const unmappedDetails = [];

    allRegs.forEach(r => {
      // Skip test entries
      if (r.payment_status === 'test') return;

      const zone = r.zone || 'NULL/EMPTY';
      zoneStats[zone] = (zoneStats[zone] || 0) + 1;

      if (r.payment_status === 'completed') {
        completedByZone[zone] = (completedByZone[zone] || 0) + 1;

        // Check for unmapped
        if (!r.zone || r.zone === '' || r.zone === 'Unmapped' || !r.zone.match(/^Zone\s+\d+/i)) {
          unmappedDetails.push(r);
        }
      }
    });

    console.log('📊 ALL ZONES (including incomplete):');
    Object.entries(zoneStats).sort((a,b) => {
      if (a[0] === 'NULL/EMPTY') return 1;
      if (b[0] === 'NULL/EMPTY') return -1;
      return a[0].localeCompare(b[0]);
    }).forEach(([zone, count]) => {
      const completed = completedByZone[zone] || 0;
      console.log(`   ${zone}: ${count} total (${completed} completed)`);
    });

    console.log('\n\n🎯 COMPLETED PAYMENTS BY ZONE:');
    Object.entries(completedByZone).sort((a,b) => {
      const aNum = a[0].match(/Zone\s+(\d+)/i);
      const bNum = b[0].match(/Zone\s+(\d+)/i);
      if (!aNum) return 1;
      if (!bNum) return -1;
      return parseInt(aNum[1]) - parseInt(bNum[1]);
    }).forEach(([zone, count]) => {
      console.log(`   ${zone}: ${count}`);
    });

    if (unmappedDetails.length > 0) {
      console.log(`\n\n❌ UNMAPPED REGISTRATIONS (${unmappedDetails.length}):\n`);
      unmappedDetails.forEach(r => {
        console.log(`ID: ${r.id} | Reg: ${r.registration_id}`);
        console.log(`   Name: ${r.name}`);
        console.log(`   Club: ${r.club || 'NO CLUB'}`);
        console.log(`   Type: ${r.registration_type}`);
        console.log(`   Zone: "${r.zone || 'NULL'}"`);
        console.log(`   Payment: ${r.payment_status}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

analyzeZones();
