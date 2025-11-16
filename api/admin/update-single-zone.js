const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { registrationId, zone, adminPassword } = req.body;

    // Simple auth check
    if (adminPassword !== process.env.ADMIN_PASSWORD && adminPassword !== 'rotary@3181') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!registrationId || !zone) {
      return res.status(400).json({ error: 'Missing registrationId or zone' });
    }

    console.log(`🔄 Updating zone for registration ${registrationId} to ${zone}...`);
    
    const result = await pool.query(
      `UPDATE registrations 
       SET zone = $1 
       WHERE registration_id = $2
       RETURNING registration_id, name, club, zone`,
      [zone, registrationId]
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Successfully updated:', result.rows[0]);
      return res.status(200).json({
        success: true,
        message: 'Zone updated successfully',
        data: result.rows[0]
      });
    } else {
      console.log('❌ Registration not found');
      return res.status(404).json({ error: 'Registration not found' });
    }
    
  } catch (error) {
    console.error('❌ Error updating zone:', error);
    return res.status(500).json({ 
      error: 'Failed to update zone',
      details: error.message 
    });
  }
};
