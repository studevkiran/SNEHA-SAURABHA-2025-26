const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  const result = await pool.query(`
    SELECT registration_id, name, registration_type
    FROM registrations 
    WHERE LENGTH(registration_id) >= 4
      AND SUBSTRING(registration_id FROM '.{4}$') ~ '^[0-9]{4}$'
    ORDER BY CAST(SUBSTRING(registration_id FROM '.{4}$') AS INTEGER) DESC
    LIMIT 5
  `);
  
  console.log('\n📋 Last 5 registrations by sequence:');
  result.rows.reverse().forEach(r => {
    console.log(`${r.registration_id} - ${r.name} (${r.registration_type})`);
  });
  
  await pool.end();
})();
