/**
 * API: Fix the 9 unmapped registrations
 */

const { Pool } = require('pg');
const { getZoneForClub } = require('../../lib/zone-mapping.js');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🔍 Finding unmapped registrations...');

    // Get all unmapped (excluding test entries)
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        email,
        club, 
        club_id,
        zone, 
        registration_type,
        payment_status,
        created_at
      FROM registrations 
      WHERE payment_status = 'completed'
        AND payment_status != 'test'
        AND (
          zone IS NULL 
          OR zone = '' 
          OR zone = 'Unmapped'
          OR zone NOT LIKE 'Zone%'
        )
      ORDER BY created_at DESC
    `);

    console.log(`📊 Found ${result.rows.length} unmapped registrations`);

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No unmapped registrations found',
        fixed: 0,
        details: []
      });
    }

    // Fix each one
    const fixedDetails = [];
    let fixed = 0;

    for (const r of result.rows) {
      const club = r.club || 'Guest/No Club';
      const correctZone = getZoneForClub(club);
      
      if (correctZone && correctZone !== 'Unmapped') {
        await pool.query(
          'UPDATE registrations SET zone = $1 WHERE id = $2',
          [correctZone, r.id]
        );
        
        fixedDetails.push({
          id: r.id,
          name: r.name,
          club: club,
          oldZone: r.zone || 'NULL',
          newZone: correctZone
        });
        
        console.log(`✅ Fixed ID ${r.id}: ${club} → ${correctZone}`);
        fixed++;
      } else {
        fixedDetails.push({
          id: r.id,
          name: r.name,
          club: club,
          oldZone: r.zone || 'NULL',
          newZone: 'Could not map',
          error: 'Club not in zone mapping'
        });
        console.log(`⚠️  Cannot fix ID ${r.id}: ${club} not in mapping`);
      }
    }

    // Verify remaining unmapped
    const verifyResult = await pool.query(`
      SELECT COUNT(*) as total_unmapped
      FROM registrations 
      WHERE payment_status = 'completed'
        AND payment_status != 'test'
        AND (
          zone IS NULL 
          OR zone = '' 
          OR zone = 'Unmapped'
          OR zone NOT LIKE 'Zone%'
        )
    `);

    res.status(200).json({
      success: true,
      message: `Fixed ${fixed} out of ${result.rows.length} unmapped registrations`,
      fixed: fixed,
      total: result.rows.length,
      remainingUnmapped: parseInt(verifyResult.rows[0].total_unmapped),
      details: fixedDetails
    });

  } catch (error) {
    console.error('❌ Fix unmapped error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fix unmapped registrations',
      details: error.message
    });
  }
};
