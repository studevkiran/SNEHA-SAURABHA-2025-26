// Add zone and tshirt_size columns to database
const { Pool } = require('pg');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { adminPassword } = req.body;

  if (adminPassword !== 'admin123') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Adding zone and tshirt_size columns...');

    // Add zone column
    await pool.query(`
      ALTER TABLE registrations 
      ADD COLUMN IF NOT EXISTS zone VARCHAR(50)
    `);
    console.log('✅ Added zone column');

    // Add tshirt_size column
    await pool.query(`
      ALTER TABLE registrations 
      ADD COLUMN IF NOT EXISTS tshirt_size VARCHAR(10)
    `);
    console.log('✅ Added tshirt_size column');

    // Update existing records with defaults
    const updateZone = await pool.query(`
      UPDATE registrations 
      SET zone = 'Unmapped' 
      WHERE zone IS NULL
      RETURNING id
    `);
    console.log(`✅ Updated ${updateZone.rowCount} records with default zone`);

    const updateTshirt = await pool.query(`
      UPDATE registrations 
      SET tshirt_size = 'N/A' 
      WHERE tshirt_size IS NULL
      RETURNING id
    `);
    console.log(`✅ Updated ${updateTshirt.rowCount} records with default tshirt_size`);

    await pool.end();

    return res.status(200).json({
      success: true,
      message: 'Successfully added zone and tshirt_size columns',
      details: {
        zoneColumnAdded: true,
        tshirtColumnAdded: true,
        recordsUpdatedWithZone: updateZone.rowCount,
        recordsUpdatedWithTshirt: updateTshirt.rowCount
      }
    });

  } catch (error) {
    console.error('Error adding columns:', error);
    await pool.end();
    return res.status(500).json({
      success: false,
      error: error.message,
      detail: error.detail
    });
  }
};
