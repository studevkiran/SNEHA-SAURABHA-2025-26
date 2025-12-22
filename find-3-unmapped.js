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

async function findUnmapped() {
  try {
    console.log('🔍 Finding the 3 unmapped registrations...\n');
    
    const data = await fetchRegistrations();
    const allRegs = data.registrations || [];

    // Find all with null/empty zones (excluding test)
    const unmapped = allRegs.filter(r => {
      if (r.payment_status === 'test') return false;
      return !r.zone || r.zone === '' || r.zone === 'Unmapped';
    });

    console.log(`\n🎯 FOUND ${unmapped.length} UNMAPPED REGISTRATIONS:\n`);
    console.log('=' .repeat(80));

    unmapped.forEach((r, idx) => {
      console.log(`\n${idx + 1}. REGISTRATION ID: ${r.registration_id} (DB ID: ${r.id})`);
      console.log(`   Order ID: ${r.order_id || 'N/A'}`);
      console.log(`   Name: ${r.name}`);
      console.log(`   Phone: ${r.mobile}`);
      console.log(`   Email: ${r.email}`);
      console.log(`   Club: ${r.club || 'NO CLUB'}`);
      console.log(`   Type: ${r.registration_type}`);
      console.log(`   Zone: ${r.zone || 'NULL'}`);
      console.log(`   Payment Status: ${r.payment_status}`);
      console.log(`   Payment ID: ${r.payment_id || 'N/A'}`);
      console.log(`   Amount: ₹${r.total_amount || 0}`);
      console.log(`   Created: ${r.created_at}`);
      console.log('   ' + '-'.repeat(76));
    });

    console.log('\n\n📋 SUMMARY:');
    const byStatus = {};
    const byClub = {};
    unmapped.forEach(r => {
      byStatus[r.payment_status] = (byStatus[r.payment_status] || 0) + 1;
      const club = r.club || 'NO CLUB';
      byClub[club] = (byClub[club] || 0) + 1;
    });

    console.log('\nBy Payment Status:');
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    console.log('\nBy Club:');
    Object.entries(byClub).forEach(([club, count]) => {
      console.log(`   ${club}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

findUnmapped();
