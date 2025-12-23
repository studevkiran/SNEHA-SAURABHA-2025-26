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

  // Set timeout to 30 seconds
  res.socket.setTimeout(30000);

  try {
    console.log('🔍 Finding unmapped registrations...');

    // Get all unmapped (matching the stats page logic)
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
      WHERE payment_status != 'test'
        AND payment_status != 'manual-B'
        AND club != 'Guest/No Club'
        AND (
          zone IS NULL 
          OR zone = '' 
          OR zone = 'Unmapped'
          OR zone NOT SIMILAR TO 'Zone [0-9]+'
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

    // Fix all in one batch update
    let fixed = 0;
    const fixedDetails = [];

    // Build update cases for batch update
    const updateCases = [];
    const idsToUpdate = [];
    
    for (const r of result.rows) {
      const club = r.club || 'Guest/No Club';
      const correctZone = getZoneForClub(club);
      
      if (correctZone && correctZone !== 'Unmapped') {
        updateCases.push(`WHEN ${r.id} THEN '${correctZone.replace(/'/g, "''")}'`);
        idsToUpdate.push(r.id);
        
        fixedDetails.push({
          id: r.id,
          name: r.name,
          club: club,
          oldZone: r.zone || 'NULL',
          newZone: correctZone
        });
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
      }
    }

    // Execute batch update if we have records to fix
    if (idsToUpdate.length > 0) {
      const batchUpdate = `
        UPDATE registrations 
        SET zone = CASE id 
          ${updateCases.join(' ')}
        END
        WHERE id IN (${idsToUpdate.join(',')})
      `;
      await pool.query(batchUpdate);
      console.log(`✅ Batch updated ${idsToUpdate.length} registrations`);
    }

    // Verify remaining unmapped (matching stats page logic)
    const verifyResult = await pool.query(`
      SELECT COUNT(*) as total_unmapped
      FROM registrations 
      WHERE payment_status != 'test'
        AND payment_status != 'manual-B'
        AND club != 'Guest/No Club'
        AND (
          zone IS NULL 
          OR zone = '' 
          OR zone = 'Unmapped'
          OR zone NOT SIMILAR TO 'Zone [0-9]+'
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
