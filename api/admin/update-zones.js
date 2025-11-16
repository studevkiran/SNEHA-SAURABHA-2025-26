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
    
    // Batch update using CASE statement for better performance
    const updates = result.rows.map(row => {
      const zone = getZoneForClub(row.club);
      if (zone === 'Unmapped') {
        unmapped++;
      } else {
        updated++;
      }
      return { id: row.registration_id, zone, club: row.club };
    });

    // Update in batches
    const batchSize = 100;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      for (const item of batch) {
        await pool.query(
          `UPDATE registrations SET zone = $1 WHERE registration_id = $2`,
          [item.zone, item.id]
        );
      }
      
      console.log(`✅ Processed ${Math.min(i + batchSize, updates.length)} / ${updates.length}`);
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
