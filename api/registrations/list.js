/**
 * API: Get all registrations
 * Uses Neon PostgreSQL - queries registrations table (SUCCESS only)
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

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
    // Get query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';
    const registrationType = req.query.registrationType || '';
    const mealPreference = req.query.mealPreference || '';
    const clubId = req.query.clubId || '';
    const registrationSource = req.query.registrationSource || '';

    console.log('📊 Fetching confirmed registrations from Neon PostgreSQL...');
    
    // Query only registrations table (all are SUCCESS by definition)
    let query = 'SELECT * FROM registrations';
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    // Build WHERE conditions
    if (search) {
      conditions.push(`(
        LOWER(name) LIKE $${paramIndex} OR 
        mobile LIKE $${paramIndex} OR 
        LOWER(email) LIKE $${paramIndex} OR 
        LOWER(registration_id) LIKE $${paramIndex}
      )`);
      values.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }
    
    if (registrationType) {
      conditions.push(`registration_type = $${paramIndex}`);
      values.push(registrationType);
      paramIndex++;
    }
    
    if (mealPreference) {
      conditions.push(`meal_preference = $${paramIndex}`);
      values.push(mealPreference);
      paramIndex++;
    }
    
    if (clubId) {
      conditions.push(`club_id = $${paramIndex}`);
      values.push(parseInt(clubId));
      paramIndex++;
    }
    
    if (registrationSource) {
      conditions.push(`registration_source = $${paramIndex}`);
      values.push(registrationSource);
      paramIndex++;
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Sort by the numeric part of registration_id (last 4 digits) in descending order
    query += ' ORDER BY CAST(RIGHT(registration_id, 4) AS INTEGER) DESC';
    
    const result = await pool.query(query, values);
    const registrations = result.rows;
    
    console.log(`✅ Loaded ${registrations.length} confirmed registrations`);

    return res.status(200).json({
      success: true,
      data: {
        registrations: registrations,
        total: registrations.length,
        page: page
      }
    });

  } catch (error) {
    console.error('❌ List registrations error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};
