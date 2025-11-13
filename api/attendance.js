// Combined API: Attendance (checkin + stats)
// POST /api/attendance?action=checkin
// GET /api/attendance?action=stats

const { markAttendance, getRegistrationById } = require('../lib/db-functions');
const { sql } = require('@vercel/postgres');
const { requireAuth } = require('../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action = 'stats' } = req.query;

  // Require authentication
  const authResult = requireAuth(req);
  if (!authResult.authenticated) {
    return res.status(401).json({ success: false, error: authResult.error });
  }

  // POST: Check-in
  if (req.method === 'POST' && action === 'checkin') {
    try {
      const { confirmationId } = req.body;
      if (!confirmationId) {
        return res.status(400).json({ success: false, error: 'Confirmation ID required' });
      }

      const registration = await getRegistrationById(confirmationId);
      if (!registration) {
        return res.status(404).json({ success: false, error: 'Registration not found' });
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

      const updated = await markAttendance(confirmationId);
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
      return res.status(500).json({ success: false, error: 'Check-in failed' });
    }
  }

  // GET: Stats
  if (req.method === 'GET' && action === 'stats') {
    try {
      const overallStats = await sql`
        SELECT 
          COUNT(*) as total_registrations,
          COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as total_paid,
          COUNT(CASE WHEN attended = true THEN 1 END) as total_attended,
          COUNT(CASE WHEN payment_status = 'completed' AND attended = false THEN 1 END) as not_yet_attended
        FROM registrations
      `;

      const byType = await sql`
        SELECT 
          registration_type,
          COUNT(*) as total,
          COUNT(CASE WHEN attended = true THEN 1 END) as attended,
          COUNT(CASE WHEN attended = false THEN 1 END) as not_attended
        FROM registrations
        WHERE payment_status = 'completed'
        GROUP BY registration_type
        ORDER BY total DESC
      `;

      const byMeal = await sql`
        SELECT 
          meal_preference,
          COUNT(*) as total,
          COUNT(CASE WHEN attended = true THEN 1 END) as attended
        FROM registrations
        WHERE payment_status = 'completed'
        GROUP BY meal_preference
      `;

      const recentCheckIns = await sql`
        SELECT 
          confirmation_id,
          full_name,
          registration_type,
          meal_preference,
          check_in_time
        FROM registrations
        WHERE attended = true
        ORDER BY check_in_time DESC
        LIMIT 20
      `;

      const stats = overallStats.rows[0];
      const attendanceRate = stats.total_paid > 0 
        ? ((stats.total_attended / stats.total_paid) * 100).toFixed(1)
        : 0;

      return res.status(200).json({
        success: true,
        overall: {
          totalRegistrations: parseInt(stats.total_registrations),
          totalPaid: parseInt(stats.total_paid),
          totalAttended: parseInt(stats.total_attended),
          notYetAttended: parseInt(stats.not_yet_attended),
          attendanceRate: parseFloat(attendanceRate)
        },
        byType: byType.rows.map(row => ({
          registrationType: row.registration_type,
          total: parseInt(row.total),
          attended: parseInt(row.attended),
          notAttended: parseInt(row.not_attended),
          attendanceRate: row.total > 0 
            ? ((row.attended / row.total) * 100).toFixed(1)
            : 0
        })),
        byMeal: byMeal.rows.map(row => ({
          mealPreference: row.meal_preference,
          total: parseInt(row.total),
          attended: parseInt(row.attended)
        })),
        recentCheckIns: recentCheckIns.rows.map(row => ({
          confirmationId: row.confirmation_id,
          fullName: row.full_name,
          registrationType: row.registration_type,
          mealPreference: row.meal_preference,
          checkInTime: row.check_in_time
        }))
      });
    } catch (error) {
      console.error('❌ Attendance stats error:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch attendance stats' });
    }
  }

  return res.status(400).json({ success: false, error: 'Invalid request' });
};
