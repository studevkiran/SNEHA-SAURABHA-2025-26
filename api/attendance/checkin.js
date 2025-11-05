// API: Mark attendance (check-in) via QR code scan
const { markAttendance, getRegistrationById } = require('../../lib/db');
const { requireAuth } = require('../../lib/auth');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Require authentication
    const authResult = requireAuth(req);
    if (!authResult.authenticated) {
      return res.status(401).json({
        success: false,
        error: authResult.error
      });
    }

    const { confirmationId } = req.body;

    if (!confirmationId) {
      return res.status(400).json({
        success: false,
        error: 'Confirmation ID required'
      });
    }

    // Verify registration exists
    const registration = await getRegistrationById(confirmationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    if (registration.payment_status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed',
        paymentStatus: registration.payment_status
      });
    }

    if (registration.attended) {
      return res.status(200).json({
        success: true,
        alreadyCheckedIn: true,
        checkInTime: registration.check_in_time,
        registration: {
          confirmationId: registration.confirmation_id,
          fullName: registration.full_name,
          registrationType: registration.registration_type,
          mealPreference: registration.meal_preference
        }
      });
    }

    // Mark attendance
    const updated = await markAttendance(confirmationId);

    console.log('✅ Attendance marked:', confirmationId, updated.full_name);

    return res.status(200).json({
      success: true,
      alreadyCheckedIn: false,
      checkInTime: updated.check_in_time,
      registration: {
        confirmationId: updated.confirmation_id,
        fullName: updated.full_name,
        registrationType: updated.registration_type,
        mealPreference: updated.meal_preference,
        mobile: updated.mobile
      }
    });

  } catch (error) {
    console.error('❌ Check-in error:', error);
    return res.status(500).json({
      success: false,
      error: 'Check-in failed'
    });
  }
};
