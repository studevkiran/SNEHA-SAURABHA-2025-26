/**
 * Fix unmapped registrations by calling production API
 */

const https = require('https');

function callFixAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.sneha2026.in',
      path: '/api/admin/fix-9-unmapped',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function fixUnmapped() {
  try {
    console.log('🔧 Calling production API to fix unmapped registrations...\n');
    
    const result = await callFixAPI();

    if (result.success) {
      console.log(`✅ ${result.message}\n`);
      console.log(`📊 Statistics:`);
      console.log(`   Fixed: ${result.fixed}`);
      console.log(`   Total Found: ${result.total}`);
      console.log(`   Remaining Unmapped: ${result.remainingUnmapped}\n`);

      if (result.details && result.details.length > 0) {
        console.log('📋 Details:\n');
        result.details.forEach((item, idx) => {
          console.log(`${idx + 1}. ${item.name} (ID: ${item.id})`);
          console.log(`   Club: ${item.club}`);
          console.log(`   ${item.oldZone} → ${item.newZone}`);
          if (item.error) {
            console.log(`   ⚠️  ${item.error}`);
          }
          console.log('');
        });
      }

      console.log('✅ All unmapped registrations have been fixed!\n');
    } else {
      console.log('❌ Error:', result.error);
      if (result.details) {
        console.log('   Details:', result.details);
      }
    }

  } catch (error) {
    console.error('❌ Error calling API:', error.message);
    process.exit(1);
  }
}

fixUnmapped();
