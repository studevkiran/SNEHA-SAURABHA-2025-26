/**
 * API: Quick fix for specific club name mismatches
 * Fixes: "BC Road City" → "B C Road City" and "Kollegal Midtown" → "Kollegal Mid Town"
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
    console.log('🔧 Quick fix: Correcting BC Road City and Kollegal Midtown...');
    
    const results = [];
    
    // Fix 1: BC Road City → B C Road City
    const fix1 = await pool.query(`
      UPDATE registrations 
      SET club = 'B C Road City' 
      WHERE club = 'BC Road City' 
      AND payment_status != 'test'
    `);
    
    results.push({
      from: 'BC Road City',
      to: 'B C Road City',
      updated: fix1.rowCount
    });
    
    console.log(`✅ Fixed BC Road City: ${fix1.rowCount} registrations`);
    
    // Fix 2: Kollegal Midtown → Kollegal Mid Town
    const fix2 = await pool.query(`
      UPDATE registrations 
      SET club = 'Kollegal Mid Town' 
      WHERE club = 'Kollegal Midtown' 
      AND payment_status != 'test'
    `);
    
    results.push({
      from: 'Kollegal Midtown',
      to: 'Kollegal Mid Town',
      updated: fix2.rowCount
    });
    
    console.log(`✅ Fixed Kollegal Midtown: ${fix2.rowCount} registrations`);
    
    // Verify counts
    const bcRoadCount = await pool.query(`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE club = 'B C Road City' 
      AND payment_status != 'test'
    `);
    
    const kollegalCount = await pool.query(`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE club = 'Kollegal Mid Town' 
      AND payment_status != 'test'
    `);
    
    const totalFixed = fix1.rowCount + fix2.rowCount;
    
    return res.status(200).json({
      success: true,
      message: `Fixed ${totalFixed} registrations`,
      fixes: results,
      verification: {
        'B C Road City': parseInt(bcRoadCount.rows[0].count),
        'Kollegal Mid Town': parseInt(kollegalCount.rows[0].count)
      }
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
