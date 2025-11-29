// Combined API: Club Members
// GET /api/club-members?action=list&clubName=xxx
// POST /api/club-members?action=import

const { sql } = require('../lib/db');
const { normalizeClubName } = require('../lib/zone-mapping');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action = 'list' } = req.query;

  // GET: List members by club
  if (req.method === 'GET' && action === 'list') {
    try {
      const { clubName } = req.query;
      if (!clubName) {
        return res.status(400).json({ success: false, error: 'clubName required' });
      }

      // Use shared sql client - using tagged template literal syntax
      const result = await sql`
        SELECT id, member_name, email, mobile, member_type 
        FROM club_members 
        WHERE club_name = ${normalizeClubName(clubName)} AND is_active = true 
        ORDER BY member_name ASC
      `;

      return res.json({
        success: true,
        clubName,
        count: result.rows.length,
        members: result.rows.map(r => ({
          id: r.id,
          name: r.member_name,
          email: r.email,
          mobile: r.mobile,
          type: r.member_type
        }))
      });
    } catch (error) {
      console.error('Error fetching club members:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(400).json({ success: false, error: 'Invalid request' });
};
