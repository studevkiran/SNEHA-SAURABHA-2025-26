/**
 * Direct fix for specific IDs with NULL zones
 */

const { Pool } = require('pg');
const { getZoneForClub } = require('../../lib/zone-mapping.js');

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

  try {
    // The 9 IDs with NULL zones
    const ids = [3169, 3166, 3165, 3163, 3161, 3159, 3149, 3139, 3067];
    
    console.log(`🔧 Fixing ${ids.length} specific registrations with NULL zones...`);

    const fixes = [];
    for (const id of ids) {
      // Get the registration
      const regResult = await pool.query(
        'SELECT id, name, club, zone FROM registrations WHERE id = $1',
        [id]
      );

      if (regResult.rows.length === 0) {
        fixes.push({ id, status: 'not_found' });
        continue;
      }

      const reg = regResult.rows[0];
      const club = reg.club || 'Guest/No Club';
      
      // Skip guests
      if (club === 'Guest/No Club') {
        fixes.push({
          id,
          name: reg.name,
          club,
          status: 'skipped_guest'
        });
        continue;
      }

      const correctZone = getZoneForClub(club);

      if (correctZone && correctZone !== 'Unmapped') {
        await pool.query(
          'UPDATE registrations SET zone = $1 WHERE id = $2',
          [correctZone, id]
        );

        fixes.push({
          id,
          name: reg.name,
          club,
          oldZone: reg.zone || 'NULL',
          newZone: correctZone,
          status: 'fixed'
        });
        console.log(`✅ Fixed ID ${id}: ${club} → ${correctZone}`);
      } else {
        fixes.push({
          id,
          name: reg.name,
          club,
          oldZone: reg.zone || 'NULL',
          status: 'no_mapping',
          error: `Club '${club}' not in zone mapping`
        });
        console.log(`⚠️  ID ${id}: Cannot map club '${club}'`);
      }
    }

    const fixed = fixes.filter(f => f.status === 'fixed').length;

    res.status(200).json({
      success: true,
      message: `Fixed ${fixed} out of ${ids.length} registrations`,
      fixed,
      total: ids.length,
      details: fixes
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
