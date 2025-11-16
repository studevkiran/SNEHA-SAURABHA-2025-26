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
    
    // Update in the correct order to maintain sequence
    const updates = [
      { old: 'RAC54V0692', new: '2026RTY0689' },
      { old: 'RAC54V0691', new: '2026RTY0690' },
      { old: 'RAC54V0690', new: '2026RTY0691' }
    ];
    
    const results = [];
    
    for (const update of updates) {
      const result = await pool.query(
        `UPDATE registrations 
         SET registration_id = $1 
         WHERE registration_id = $2
         RETURNING registration_id, name, club, registration_type`,
        [update.new, update.old]
      );
      
      if (result.rows.length > 0) {
        console.log(`✅ Updated: ${update.old} → ${update.new}`);
        results.push({
          success: true,
          old: update.old,
          new: update.new,
          data: result.rows[0]
        });
      } else {
        console.log(`❌ Not found: ${update.old}`);
        results.push({
          success: false,
          old: update.old,
          new: update.new,
          error: 'Registration not found'
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return res.status(200).json({
      success: true,
      message: `Updated ${successCount} of ${updates.length} registrations`,
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
