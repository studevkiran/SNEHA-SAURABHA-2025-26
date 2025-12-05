const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Updating database with corrected zone assignments...\n');
    
    // Load clubs.json with correct zones
    const clubsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'clubs.json'), 'utf8'));
    
    let updated = 0;
    for (const club of clubsData) {
      await client.query(
        'UPDATE clubs SET zone = $1 WHERE id = $2',
        [club.zone, club.id]
      );
      updated++;
    }
    
    console.log(`✅ Updated ${updated} clubs with corrected zones\n`);
    
    // Verify
    const zones = await client.query(`
      SELECT c.zone, COUNT(*) as count
      FROM registrations r
      JOIN clubs c ON r.club_id = c.id
      GROUP BY c.zone
      ORDER BY c.zone
    `);
    
    console.log('📊 Updated Zone Distribution:\n');
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
    console.log(`\n✅ Total: ${total.rows[0].total} registrations\n`);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
