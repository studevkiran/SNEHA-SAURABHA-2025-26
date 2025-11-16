// API: Add zone column to payment_attempts table
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Admin authentication
    const { adminPassword } = req.body;
    if (adminPassword !== 'admin123') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('🔧 Adding zone column to payment_attempts table...');

    // Add zone column
    await pool.query(`
      ALTER TABLE payment_attempts 
      ADD COLUMN IF NOT EXISTS zone VARCHAR(50)
    `);
    console.log('✅ Zone column added/verified');

    // Update existing records with default
    const updateResult = await pool.query(`
      UPDATE payment_attempts 
      SET zone = 'Unmapped' 
      WHERE zone IS NULL
    `);
    console.log(`✅ Updated ${updateResult.rowCount} records with default zone`);

    return res.status(200).json({
      success: true,
      message: 'Successfully added zone column to payment_attempts',
      details: {
        zoneColumnAdded: true,
        recordsUpdated: updateResult.rowCount
      }
    });
  } catch (error) {
    console.error('❌ Migration error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
