// API: Get attendance statistics
const { sql } = require('@vercel/postgres');
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
    // Require authentication
    const authResult = requireAuth(req);
    if (!authResult.authenticated) {
      return res.status(401).json({
        success: false,
        error: authResult.error
      });
    }

    // Get overall attendance stats
    const overallStats = await sql`
      SELECT 
        COUNT(*) as total_registrations,
        COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as total_paid,
        COUNT(CASE WHEN attended = true THEN 1 END) as total_attended,
        COUNT(CASE WHEN payment_status = 'completed' AND attended = false THEN 1 END) as not_yet_attended
      FROM registrations
    `;

    // Attendance by registration type
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

    // Attendance by meal preference
    const byMeal = await sql`
      SELECT 
        meal_preference,
        COUNT(*) as total,
        COUNT(CASE WHEN attended = true THEN 1 END) as attended
      FROM registrations
      WHERE payment_status = 'completed'
      GROUP BY meal_preference
    `;

    // Recent check-ins (last 20)
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
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch attendance stats'
    });
  }
};
