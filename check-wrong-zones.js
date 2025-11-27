const { query } = require('./lib/db-neon');

async function checkZones() {
  const result = await query(`
    SELECT club, zone, COUNT(*) as count 
    FROM registrations 
    WHERE club IN ('Bantwal', 'Sullia', 'Mysore Metro', 'Mulky')
    GROUP BY club, zone
    ORDER BY club, zone
  `);
  
  console.log('\n🔍 Current database zones:');
  result.rows.forEach(row => {
    const expected = row.club === 'Mulky' ? 'Zone 1' : 
                     row.club === 'Bantwal' ? 'Zone 4' :
                     row.club === 'Sullia' ? 'Zone 5' :
                     row.club === 'Mysore Metro' ? 'Zone 7' : 'Unknown';
    const status = row.zone === expected ? '✅' : '❌';
    console.log(`  ${status} ${row.club} → ${row.zone} (Expected: ${expected}) - ${row.count} registrations`);
  });
  
  process.exit(0);
}

checkZones().catch(console.error);
