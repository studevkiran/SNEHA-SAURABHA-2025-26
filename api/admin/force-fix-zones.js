/**
 * FORCE UPDATE zones for the 9 IDs - direct SQL
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Direct mapping: ID → Zone
    const updates = [
      { id: 3169, zone: 'Zone 9A' },  // Chamarajanagar
      { id: 3166, zone: 'Zone 9A' },  // Chamarajanagar
      { id: 3165, zone: 'Zone 9A' },  // Chamarajanagar
      { id: 3163, zone: 'Zone 6B' },  // Somwarpet Hills
      { id: 3161, zone: 'Zone 6B' },  // Somwarpet Hills
      { id: 3159, zone: 'Zone 9A' },  // Chamarajanagar
      { id: 3149, zone: 'Zone 1' },   // Mulky
      { id: 3139, zone: 'Zone 7A' }   // Ivory City Mysuru
      // Skip 3067 - guest
    ];

    console.log(`🔧 FORCE updating ${updates.length} registrations...`);

    const results = [];
    for (const { id, zone } of updates) {
      // First check current value
      const before = await pool.query('SELECT zone FROM registrations WHERE id = $1', [id]);
      const oldZone = before.rows[0]?.zone || 'NULL';
      
      // Update
      const result = await pool.query(
        'UPDATE registrations SET zone = $1 WHERE id = $2 RETURNING id, zone',
        [zone, id]
      );

      // Verify
      const after = await pool.query('SELECT zone FROM registrations WHERE id = $1', [id]);
      const newZone = after.rows[0]?.zone || 'NULL';

      results.push({
        id,
        oldZone,
        targetZone: zone,
        actualZone: newZone,
        rowsAffected: result.rowCount,
        success: newZone === zone
      });

      console.log(`  ID ${id}: "${oldZone}" → "${newZone}" (target: "${zone}") [${result.rowCount} rows]`);
    }

    const success = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success);

    res.status(200).json({
      success: failed.length === 0,
      updated: success,
      total: updates.length,
      failed: failed.length,
      details: results
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};
