// API: Import club members from Excel/CSV
// POST /api/members/import
// Accepts Excel data and bulk imports into club_members table

const { Pool } = require('pg');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { members, overwrite = false } = req.body;

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data. Expected array of members.'
      });
    }

    console.log(`📥 Importing ${members.length} members...`);

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    let imported = 0;
    let skipped = 0;
    let errors = [];

    for (const member of members) {
      try {
        const {
          clubName,
          clubId,
          memberName,
          email,
          mobile,
          memberType = 'Rotarian'
        } = member;

        // Validate required fields
        if (!clubName || !memberName) {
          errors.push(`Missing required fields for: ${memberName || 'Unknown'}`);
          skipped++;
          continue;
        }

        // Check if member exists
        const existingQuery = `
          SELECT id FROM club_members 
          WHERE club_name = $1 AND member_name = $2 AND email = $3
        `;
        const existing = await pool.query(existingQuery, [clubName, memberName, email]);

        if (existing.rows.length > 0) {
          if (overwrite) {
            // Update existing member
            const updateQuery = `
              UPDATE club_members 
              SET mobile = $1, member_type = $2, updated_at = NOW()
              WHERE id = $3
            `;
            await pool.query(updateQuery, [mobile, memberType, existing.rows[0].id]);
            imported++;
          } else {
            skipped++;
            continue;
          }
        } else {
          // Insert new member
          const insertQuery = `
            INSERT INTO club_members (club_id, club_name, member_name, email, mobile, member_type)
            VALUES ($1, $2, $3, $4, $5, $6)
          `;
          await pool.query(insertQuery, [
            clubId || null,
            clubName,
            memberName,
            email,
            mobile,
            memberType
          ]);
          imported++;
        }
      } catch (err) {
        console.error('Error importing member:', err);
        errors.push(`Failed to import: ${member.memberName} - ${err.message}`);
        skipped++;
      }
    }

    await pool.end();

    console.log(`✅ Import complete: ${imported} imported, ${skipped} skipped`);

    return res.status(200).json({
      success: true,
      imported,
      skipped,
      total: members.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('❌ Import error:', error);
    return res.status(500).json({
      success: false,
      error: 'Import failed',
      details: error.message
    });
  }
};
