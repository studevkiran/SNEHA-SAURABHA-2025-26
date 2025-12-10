/**
 * API: Move Mysuru Diamond from Zone 8B to Zone 7B
 * Updates database clubs table and all affected registrations
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔧 Moving Mysuru Diamond from Zone 8B to Zone 7B...');
    
    // Step 1: Update clubs table
    const updateClubResult = await pool.query(
      `UPDATE clubs 
       SET zone = 'Zone 7B' 
       WHERE name = 'Mysuru Diamond' 
       RETURNING id, name, zone`
    );
    
    if (updateClubResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mysuru Diamond club not found in database'
      });
    }
    
    const clubInfo = updateClubResult.rows[0];
    console.log(`✅ Updated club: ${clubInfo.name} (ID: ${clubInfo.id}) to ${clubInfo.zone}`);
    
    // Step 2: Get all Mysuru Diamond registrations
    const registrationsResult = await pool.query(
      `SELECT r.registration_id, r.name, r.club, r.zone
       FROM registrations r
       JOIN clubs c ON r.club_id = c.id
       WHERE c.name = 'Mysuru Diamond' AND r.payment_status != 'test'`
    );
    
    const registrations = registrationsResult.rows;
    console.log(`Found ${registrations.length} Mysuru Diamond registrations`);
    
    // Step 3: Update registrations (zone will auto-update via JOIN on next query)
    // But we can explicitly update for immediate effect
    const updateRegsResult = await pool.query(
      `UPDATE registrations r
       SET zone = 'Zone 7B'
       FROM clubs c
       WHERE r.club_id = c.id 
         AND c.name = 'Mysuru Diamond'
         AND r.payment_status != 'test'
       RETURNING r.registration_id`
    );
    
    // Step 4: Verify the changes
    const verifyResult = await pool.query(
      `SELECT r.registration_id, r.name, r.club, r.zone
       FROM registrations r
       JOIN clubs c ON r.club_id = c.id
       WHERE c.name = 'Mysuru Diamond' AND r.payment_status != 'test'
       LIMIT 5`
    );
    
    return res.status(200).json({
      success: true,
      club_updated: clubInfo,
      registrations_affected: registrations.length,
      registrations_updated: updateRegsResult.rows.length,
      sample_registrations: verifyResult.rows,
      message: `Successfully moved Mysuru Diamond and ${registrations.length} registrations from Zone 8B to Zone 7B`
    });
    
  } catch (error) {
    console.error('Move zone error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
