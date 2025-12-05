const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

(async () => {
  const client = await pool.connect();
  
  const zones = await client.query(`
    SELECT c.zone, COUNT(*) as count
    FROM registrations r
    JOIN clubs c ON r.club_id = c.id
    GROUP BY c.zone
    ORDER BY c.zone
  `);
  
  console.log('📊 Zone Distribution:\n');
  
  const zoneTotals = {};
  zones.rows.forEach(row => {
    const match = row.zone.match(/Zone (\d+)/);
    if (match) {
      const mainZone = match[1];
      zoneTotals[mainZone] = (zoneTotals[mainZone] || 0) + parseInt(row.count);
      console.log(`  ${row.zone}: ${row.count}`);
    }
  });
  
  console.log('\n📈 Main Zone Totals:\n');
  Object.keys(zoneTotals).sort((a,b) => parseInt(a) - parseInt(b)).forEach(zone => {
    console.log(`  Zone ${zone}: ${zoneTotals[zone]}`);
  });
  
  const total = await client.query('SELECT COUNT(*) as total FROM registrations');
  console.log(`\n✅ Total: ${total.rows[0].total} registrations`);
  
  client.release();
  await pool.end();
})();
