// API: Update zones for existing registrations
const { Pool } = require('pg');
const { getZoneForClub } = require('../../lib/zone-mapping');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { adminPassword } = req.body;
    
    if (adminPassword !== 'admin123') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('🔧 Updating zones for all registrations...');

    // Get all registrations with Unmapped or NULL zones
    const result = await pool.query(`
      SELECT registration_id, club 
      FROM registrations 
      WHERE zone IS NULL OR zone = 'Unmapped'
    `);

    console.log(`📊 Found ${result.rows.length} registrations to update`);

    let updated = 0;
    let unmapped = 0;

    for (const row of result.rows) {
      const zone = getZoneForClub(row.club);
      
      await pool.query(
        `UPDATE registrations SET zone = $1 WHERE registration_id = $2`,
        [zone, row.registration_id]
      );

      if (zone === 'Unmapped') {
        console.log(`⚠️ ${row.registration_id}: ${row.club} → Unmapped`);
        unmapped++;
      } else {
        console.log(`✅ ${row.registration_id}: ${row.club} → ${zone}`);
        updated++;
      }
    }

    console.log(`✅ Updated ${updated} registrations with zones`);
    console.log(`⚠️ ${unmapped} registrations remain unmapped`);

    return res.status(200).json({
      success: true,
      message: 'Zones updated successfully',
      total: result.rows.length,
      updated,
      unmapped
    });

  } catch (error) {
    console.error('❌ Error updating zones:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
