const https = require('https');

function fetchStats() {
  return new Promise((resolve, reject) => {
    https.get('https://www.sneha2026.in/api/registrations/list', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function checkZones() {
  const data = await fetchStats();
  const regs = data.data?.registrations || [];
  
  const completed = regs.filter(r => 
    r.payment_status === 'completed' && 
    r.club !== 'Guest/No Club'
  );

  console.log(`Total completed (non-guest): ${completed.length}\n`);

  // Count by zone pattern
  const zonePatterns = {};
  completed.forEach(r => {
    const zone = r.zone || 'NULL';
    const match = zone.match(/^Zone\s+(\d+)$/i);
    if (match) {
      zonePatterns['Simple Zone X'] = (zonePatterns['Simple Zone X'] || 0) + 1;
    } else if (zone.match(/^Zone\s+\d+[A-Z]$/i)) {
      zonePatterns['Sub-zone (Zone XY)'] = (zonePatterns['Sub-zone (Zone XY)'] || 0) + 1;
    } else {
      zonePatterns[zone] = (zonePatterns[zone] || 0) + 1;
    }
  });

  console.log('Zone Pattern Distribution:');
  Object.entries(zonePatterns).sort((a,b) => b[1] - a[1]).forEach(([pattern, count]) => {
    console.log(`  ${pattern}: ${count}`);
  });
}

checkZones().catch(console.error);
