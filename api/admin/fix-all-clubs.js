/**
 * API: Fix ALL identified club name mismatches
 * Based on verification results showing 4 unknown clubs
 */

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
    console.log('🔧 Fixing all identified club name mismatches...');
    
    const fixes = [
      { from: 'Hunsur', to: 'Hunsur, Hunsur' },
      { from: 'Mysore Midtown', to: 'Mysore Mid-Town' },
      { from: 'Puttur East', to: 'Puttur-East' },
      { from: 'Virajpete', to: 'Virajpet' }
    ];
    
    const results = [];
    let totalFixed = 0;
    
    for (const fix of fixes) {
      try {
        const updateResult = await pool.query(
          `UPDATE registrations 
           SET club = $1 
           WHERE club = $2 
           AND payment_status != 'test'`,
          [fix.to, fix.from]
        );
        
        results.push({
          from: fix.from,
          to: fix.to,
          updated: updateResult.rowCount,
          status: 'success'
        });
        
        totalFixed += updateResult.rowCount;
        console.log(`✅ ${fix.from} → ${fix.to}: ${updateResult.rowCount} rows`);
        
      } catch (err) {
        results.push({
          from: fix.from,
          to: fix.to,
          error: err.message,
          status: 'error'
        });
        console.error(`❌ Error fixing ${fix.from}:`, err.message);
      }
    }
    
    // Get verification counts
    const verification = {};
    for (const fix of fixes) {
      const count = await pool.query(
        `SELECT COUNT(*) as count 
         FROM registrations 
         WHERE club = $1 
         AND payment_status != 'test'`,
        [fix.to]
      );
      verification[fix.to] = parseInt(count.rows[0].count);
    }
    
    return res.status(200).json({
      success: true,
      message: `Fixed ${totalFixed} registrations across ${fixes.length} clubs`,
      totalFixed,
      fixes: results,
      verification
    });
    
  } catch (error) {
    console.error('❌ Error fixing clubs:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};
