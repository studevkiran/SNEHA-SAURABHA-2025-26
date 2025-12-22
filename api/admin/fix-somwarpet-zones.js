/**
 * API: Fix unmapped Somwarpet Hills registrations
 * Assign IDs 3121 and 3119 to Zone 6B
 */

import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔧 Fixing Somwarpet Hills unmapped zones...');

    // The 2 unmapped Somwarpet Hills registrations
    const idsToFix = [3121, 3119];

    // Update both zone and club_id
    const result = await query(`
      UPDATE registrations 
      SET zone = 'Zone 6B',
          club_id = 114,
          updated_at = NOW()
      WHERE id = ANY($1::int[])
      RETURNING id, registration_id, name, club, zone, club_id
    `, [idsToFix]);

    console.log(`✅ Updated ${result.rows.length} registrations`);

    // Verify remaining unmapped
    const unmappedCheck = await query(`
      SELECT COUNT(*) as count
      FROM registrations
      WHERE (zone IS NULL OR zone = '' OR zone = 'Unmapped')
      AND payment_status != 'test'
      AND club != 'Guest/No Club'
    `);

    return res.status(200).json({
      success: true,
      message: 'Fixed Somwarpet Hills zones',
      updated: result.rows,
      remainingUnmapped: parseInt(unmappedCheck.rows[0].count)
    });

  } catch (error) {
    console.error('❌ Error fixing zones:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
