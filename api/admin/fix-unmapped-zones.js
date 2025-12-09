/**
 * API: Fix unmapped zones
 * Updates registrations with NULL zones to correct zone values
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Define the 2 registrations that need zone updates
    const updates = [
      { id: '2026RTY0778', zone: 'Zone 6B' },  // Somwarpet Hills → Zone 6B
      { id: '2026RTY0772', zone: 'Zone 7A' }   // Ivory City Mysuru → Zone 7A
    ];
    
    const results = [];
    
    for (const { id, zone } of updates) {
      const result = await pool.query(
        'UPDATE registrations SET zone = $1 WHERE registration_id = $2 RETURNING registration_id, name, club, zone',
        [zone, id]
      );
      
      if (result.rows.length > 0) {
        results.push({
          success: true,
          ...result.rows[0]
        });
      } else {
        results.push({
          success: false,
          registration_id: id,
          error: 'Not found'
        });
      }
    }
    
    // Verify no more NULL zones
    const nullZones = await pool.query(
      `SELECT registration_id, name, club, zone 
       FROM registrations 
       WHERE payment_status != 'test' 
       AND (zone IS NULL OR zone = '')`
    );
    
    return res.status(200).json({
      success: true,
      updated: results,
      remaining_null_zones: nullZones.rows.length,
      null_zone_registrations: nullZones.rows
    });
    
  } catch (error) {
    console.error('Fix unmapped zones error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
