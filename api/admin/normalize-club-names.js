const { Pool } = require('pg');

// Map of variant -> canonical names as per public/data/clubs.json
const NORMALIZE = {
  'Chamarajanagara': 'Chamarajanagar',
  'Chamarajanagara Silk City': 'Chamarajanagar Silk City',
  'E Club of Mysore Center': 'E-Club of Mysuru Center',
  'H D Kote': 'H.D. Kote',
  'Hemavathi Kodlipete': 'Hemavathi Kodlipet',
  'Ivory City': 'Ivory City Mysuru',
  'Kollegala': 'Kollegal',
  'Kollegala Midtown': 'Kollegal Mid Town',
  'Krishnarajanagara': 'Krishnarajanagar',
  'Kushalnagara': 'Kushalnagar',
  'Moodabidri Temple Town': 'Moodbidri Temple Town',
  'Mulki': 'Mulky',
  'Mysore SouthEast': 'Mysore South East',
  'Mysore Sreegandha': 'Mysore Shreegandha',
  'Panchasheel': 'Panchsheel Mysore',
  'Shanivarashanthe': 'Shanivarsanthe',
  'Siddakatte': 'Siddakatte Phalguni',
  'Somarpete Hills': 'Somwarpet Hills',
  'Uppinangdi': 'Uppinangadi',
  'Vijayanagara Mysore': 'Vijayanagar Mysore',
  'Yelandur Greenway': 'Yelanduru Greenway'
};

const pool = new Pool({
  connectionString: process.argv[2],
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    console.log('🔄 Normalizing variant club names to canonical spellings...');
    let total = 0;
    for (const [variant, canonical] of Object.entries(NORMALIZE)) {
      const res = await pool.query(
        'UPDATE registrations SET club = $1 WHERE club = $2',
        [canonical, variant]
      );
      if (res.rowCount > 0) {
        total += res.rowCount;
        console.log(`   • ${variant} -> ${canonical}  (updated ${res.rowCount})`);
      }
    }
    console.log(`✅ Normalization complete. Rows updated: ${total}`);
    await pool.end();
  } catch (err) {
    console.error('❌ Error during normalization:', err.message);
    await pool.end();
    process.exit(1);
  }
})();
