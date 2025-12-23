/**
 * API: Fix registrations with zone='None' 
 * These are recent registrations that got 'None' instead of proper zone assignment
 */

const { Pool } = require('pg');
const { getZoneForClub } = require('../../lib/zone-mapping.js');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🔍 Finding registrations with zone="None"...');

    // Find all registrations with zone = 'None' (not NULL, the literal string 'None')
    const result = await pool.query(`
      SELECT id, name, club, club_id, zone, registration_type
      FROM registrations 
      WHERE zone = 'None'
        AND payment_status != 'test'
        AND payment_status != 'manual-B'
      ORDER BY id DESC
    `);

    console.log(`📊 Found ${result.rows.length} registrations with zone='None'`);

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No registrations with zone="None" found',
        fixed: 0
      });
    }

    const fixes = [];
    let fixed = 0;

    // Fix each one
    for (const r of result.rows) {
      const club = r.club || 'Guest/No Club';
      const correctZone = getZoneForClub(club);

      if (correctZone && correctZone !== 'Unmapped') {
        await pool.query(
          'UPDATE registrations SET zone = $1 WHERE id = $2',
          [correctZone, r.id]
        );

        fixes.push({
          id: r.id,
          name: r.name,
          club: club,
          oldZone: 'None',
          newZone: correctZone
        });

        console.log(`✅ Fixed ID ${r.id}: ${club} → ${correctZone}`);
        fixed++;
      } else {
        fixes.push({
          id: r.id,
          name: r.name,
          club: club,
          oldZone: 'None',
          newZone: 'Could not map',
          error: 'Club not in zone mapping'
        });
        console.log(`⚠️  Cannot fix ID ${r.id}: ${club} not in mapping`);
      }
    }

    // Verify
    const verifyResult = await pool.query(`
      SELECT COUNT(*) as remaining
      FROM registrations 
      WHERE zone = 'None'
        AND payment_status != 'test'
        AND payment_status != 'manual-B'
    `);

    res.status(200).json({
      success: true,
      message: `Fixed ${fixed} out of ${result.rows.length} registrations with zone="None"`,
      fixed: fixed,
      total: result.rows.length,
      remaining: parseInt(verifyResult.rows[0].remaining),
      details: fixes
    });

  } catch (error) {
    console.error('❌ Error fixing None zones:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fix None zones',
      details: error.message
    });
  }
};
