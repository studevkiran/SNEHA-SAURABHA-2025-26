// API to delete a registration by ID
const { query } = require('../../lib/db-neon');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get registration ID from query param or body
    const regId = req.query.registration_id || req.body?.registration_id;
    
    if (!regId) {
      return res.status(400).json({ 
        success: false, 
        error: 'registration_id parameter is required' 
      });
    }

    console.log('🗑️ Deleting registration:', regId);

    // Check if registration exists
    const checkResult = await query(
      'SELECT registration_id, name, mobile, email FROM registrations WHERE registration_id = $1',
      [regId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    const registration = checkResult.rows[0];

    // Delete the registration
    const deleteResult = await query(
      'DELETE FROM registrations WHERE registration_id = $1 RETURNING registration_id',
      [regId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete registration'
      });
    }

    console.log('✅ Registration deleted successfully:', regId);
    console.log('Deleted data:', registration);

    return res.status(200).json({
      success: true,
      message: 'Registration deleted successfully',
      deleted: {
        registration_id: registration.registration_id,
        name: registration.name,
        mobile: registration.mobile,
        email: registration.email
      }
    });

  } catch (error) {
    console.error('❌ Error deleting registration:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete registration'
    });
  }
};
