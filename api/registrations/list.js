// API: Get all registrations with pagination and filters
const { getAllRegistrations } = require('../../lib/db-neon');

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
    // TODO: Re-enable authentication with proper JWT tokens
    // Check authentication
    // const auth = requireAuth(req);
    // if (!auth.authenticated) {
    //   return res.status(401).json({
    //     success: false,
    //     error: auth.error
    //   });
    // }

    // Get query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';
    const paymentStatus = req.query.paymentStatus || '';
    const registrationType = req.query.registrationType || '';

    // Build filters
    const filters = {};
    if (search) filters.search = search;
    if (paymentStatus) filters.paymentStatus = paymentStatus;
    if (registrationType) filters.registrationType = registrationType;

    // Get registrations
    const registrations = await getAllRegistrations(filters);

    return res.status(200).json({
      success: true,
      registrations: registrations,
      total: registrations.length,
      page: page,
      limit: limit
    });

  } catch (error) {
    console.error('❌ List registrations error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
