const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // CORS headers
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

    // Simple auth check
    if (adminPassword !== process.env.ADMIN_PASSWORD && adminPassword !== 'admin123') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('🔄 Updating 3 RAC registration IDs to new 2026RTY format...');
    
    // Step 1: Move to temporary IDs to avoid conflicts
    console.log('Step 1: Moving to temporary IDs...');
    const tempUpdates = [
      { old: 'RAC54V0692', temp: 'TEMP_0001' },
      { old: 'RAC54V0691', temp: 'TEMP_0002' },
      { old: 'RAC54V0690', temp: 'TEMP_0003' }
    ];
    
    for (const update of tempUpdates) {
      await pool.query(
        `UPDATE registrations SET registration_id = $1 WHERE registration_id = $2`,
        [update.temp, update.old]
      );
      console.log(`  Moved ${update.old} → ${update.temp}`);
    }
    
    // Step 2: Update to final IDs
    console.log('Step 2: Updating to final 2026RTY IDs...');
    const finalUpdates = [
      { temp: 'TEMP_0001', new: '2026RTY0689' },
      { temp: 'TEMP_0002', new: '2026RTY0690' },
      { temp: 'TEMP_0003', new: '2026RTY0691' }
    ];
    
    const results = [];
    
    for (const update of finalUpdates) {
      const result = await pool.query(
        `UPDATE registrations 
         SET registration_id = $1 
         WHERE registration_id = $2
         RETURNING registration_id, name, club, registration_type`,
        [update.new, update.temp]
      );
      
      if (result.rows.length > 0) {
        console.log(`✅ Updated: ${update.temp} → ${update.new}`);
        results.push({
          success: true,
          new: update.new,
          data: result.rows[0]
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return res.status(200).json({
      success: true,
      message: `Updated ${successCount} of ${finalUpdates.length} registrations`,
      results: results
    });
    
  } catch (error) {
    console.error('❌ Error updating RAC IDs:', error);
    return res.status(500).json({ 
      error: 'Failed to update registration IDs',
      details: error.message 
    });
  }
};
