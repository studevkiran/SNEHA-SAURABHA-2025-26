/**
 * API: Get all registrations
 * Reads from Google Sheets as primary source, falls back to PostgreSQL
 */

const { getAllRegistrations } = require('../../lib/db-neon');
const { getAllRegistrationsFromSheets } = require('../../lib/db-google-sheets');

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

    // Try Google Sheets first (primary database)
    let registrations = [];
    try {
      console.log('📊 Fetching from Google Sheets...');
      registrations = await getAllRegistrationsFromSheets();
      
      if (registrations && registrations.length > 0) {
        console.log(`✅ Loaded ${registrations.length} registrations from Google Sheets`);
      }
    } catch (sheetsError) {
      console.warn('⚠️ Google Sheets fetch failed:', sheetsError.message);
    }

    // Fallback to PostgreSQL if Google Sheets failed or returned no data
    if (!registrations || registrations.length === 0) {
      console.log('📊 Fetching from PostgreSQL (fallback)...');
      registrations = await getAllRegistrations(filters);
      console.log(`✅ Loaded ${registrations.length} registrations from PostgreSQL`);
    }

    // Apply filters if using Google Sheets data
    if (registrations.length > 0) {
      if (search) {
        const searchLower = search.toLowerCase();
        registrations = registrations.filter(reg =>
          (reg.name && reg.name.toLowerCase().includes(searchLower)) ||
          (reg.mobile && reg.mobile.includes(searchLower)) ||
          (reg.email && reg.email.toLowerCase().includes(searchLower)) ||
          (reg.registration_id && reg.registration_id.toLowerCase().includes(searchLower))
        );
      }
      
      if (paymentStatus) {
        registrations = registrations.filter(reg => 
          reg.payment_status === paymentStatus.toLowerCase()
        );
      }
      
      if (registrationType) {
        registrations = registrations.filter(reg => 
          reg.registration_type === registrationType
        );
      }
    }

    return res.status(200).json({
      success: true,
      registrations: registrations,
      total: registrations.length,
      page: page,
      limit: limit,
      source: registrations.length > 0 && registrations[0].manually_added !== undefined ? 'google_sheets' : 'postgresql'
    });

  } catch (error) {
    console.error('❌ List registrations error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
