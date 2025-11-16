const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.argv[2],
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    console.log('🔍 CHECKING ALL CLUB NAME VARIATIONS IN DATABASE\n');
    
    const result = await pool.query(`
      SELECT DISTINCT club, COUNT(*) as count, zone
      FROM registrations
      WHERE club != 'TEST'
      GROUP BY club, zone
      ORDER BY club
    `);
    
    console.log('📊 All unique club names:\n');
    result.rows.forEach(row => {
      const zoneStatus = row.zone === 'Unmapped' || !row.zone ? '❌ UNMAPPED' : '✅ ' + row.zone;
      console.log(`${zoneStatus}  [${row.count} reg] ${row.club}`);
    });
    
    console.log(`\n📈 Total unique clubs: ${result.rows.length}`);
    
    // Check for potential mismatches
    console.log('\n\n🔍 POTENTIAL INCONSISTENCIES:\n');
    
    const clubs = result.rows.map(r => r.club);
    const issues = [];
    
    // Check for hyphen/space variations
    clubs.forEach(club => {
      if (club.includes('-')) {
        const noHyphen = club.replace(/-/g, ' ');
        const oneWord = club.replace(/-/g, '');
        if (clubs.includes(noHyphen)) {
          issues.push(`⚠️  "${club}" vs "${noHyphen}"`);
        }
        if (clubs.includes(oneWord)) {
          issues.push(`⚠️  "${club}" vs "${oneWord}"`);
        }
      }
    });
    
    // Check for case variations
    const lowerMap = {};
    clubs.forEach(club => {
      const lower = club.toLowerCase();
      if (!lowerMap[lower]) {
        lowerMap[lower] = [];
      }
      lowerMap[lower].push(club);
    });
    
    Object.values(lowerMap).forEach(variants => {
      if (variants.length > 1) {
        issues.push(`⚠️  Case variation: ${variants.join(' vs ')}`);
      }
    });
    
    if (issues.length > 0) {
      issues.forEach(i => console.log(i));
    } else {
      console.log('✅ No obvious inconsistencies found!');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
})();
