// API: Get dashboard statistics
const { getStatistics } = require('../../lib/db');
const { requireAuth } = require('../../lib/auth');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const auth = requireAuth(req);
    if (!auth.authenticated) {
      return res.status(401).json({
        success: false,
        error: auth.error
      });
    }

    // Get statistics
    const stats = await getStatistics();

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Statistics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
