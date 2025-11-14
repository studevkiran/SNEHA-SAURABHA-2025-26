// API: Get members by club name
// GET /api/members/by-club?clubName=RC%20Mysore
// Returns list of members for autocomplete/dropdown

const { Pool } = require('pg');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clubName, clubId } = req.query;

    if (!clubName && !clubId) {
      return res.status(400).json({
        success: false,
        error: 'Club name or club ID required'
      });
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    let query, params;

    if (clubId) {
      query = `
        SELECT id, club_name, member_name, email, mobile, member_type
        FROM club_members
        WHERE club_id = $1 AND is_active = true
        ORDER BY member_name ASC
      `;
      params = [clubId];
    } else {
      query = `
        SELECT id, club_name, member_name, email, mobile, member_type
        FROM club_members
        WHERE club_name = $1 AND is_active = true
        ORDER BY member_name ASC
      `;
      params = [clubName];
    }

    const result = await pool.query(query, params);
    await pool.end();

    return res.status(200).json({
      success: true,
      clubName: clubName || result.rows[0]?.club_name,
      count: result.rows.length,
      members: result.rows.map(row => ({
        id: row.id,
        name: row.member_name,
        email: row.email,
        mobile: row.mobile,
        type: row.member_type
      }))
    });

  } catch (error) {
    console.error('❌ Fetch members error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch members',
      details: error.message
    });
  }
};
