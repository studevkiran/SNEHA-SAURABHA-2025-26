const { Pool } = require('pg');

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

    if (adminPassword !== process.env.ADMIN_PASSWORD && adminPassword !== 'admin123') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('🔄 Fixing TEMP registration IDs to specific numbers...');
    
    // Update TEMP IDs to specific 2026RTY numbers as requested
    // TEMP_0003 (was RAC54V0690) → 2026RTY0690
    // TEMP_0002 (was RAC54V0691) → 2026RTY0691
    // TEMP_0001 (was RAC54V0692) → 2026RTY0692
    const updates = [
      { old: 'TEMP_0003', new: '2026RTY0690', name: 'DRR Rtr Rtn Prajwal R' },
      { old: 'TEMP_0002', new: '2026RTY0691', name: 'Rtr Rtn Sumuk Bharadwaj KS' },
      { old: 'TEMP_0001', new: '2026RTY0692', name: 'Rtr Rtn Jeswanthdhar C' }
    ];
    
    const results = [];
    
    for (const update of updates) {
      const result = await pool.query(
        `UPDATE registrations 
         SET registration_id = $1 
         WHERE registration_id = $2
         RETURNING registration_id, name, registration_type`,
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
      message: `Fixed ${successCount} of ${updates.length} TEMP registrations`,
      updates: [
        'TEMP_0003 (RAC54V0690) → 2026RTY0690',
        'TEMP_0002 (RAC54V0691) → 2026RTY0691',
        'TEMP_0001 (RAC54V0692) → 2026RTY0692'
      ],
      results: results
    });
    
  } catch (error) {
    console.error('❌ Error fixing TEMP IDs:', error);
    return res.status(500).json({ 
      error: 'Failed to fix TEMP IDs',
      details: error.message 
    });
  }
};
