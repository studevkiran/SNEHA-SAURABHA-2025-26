// Database connection utility for Vercel Postgres
const { sql } = require('@vercel/postgres');

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create registrations table
    await sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        confirmation_id VARCHAR(20) UNIQUE NOT NULL,
        registration_type VARCHAR(50) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        mobile VARCHAR(15) NOT NULL,
        email VARCHAR(100) NOT NULL,
        club_name VARCHAR(100) NOT NULL,
        meal_preference VARCHAR(20) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        transaction_id VARCHAR(50) UNIQUE,
        payment_status VARCHAR(20) DEFAULT 'pending',
        payment_date TIMESTAMP,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        attended BOOLEAN DEFAULT FALSE,
        check_in_time TIMESTAMP,
        manually_added BOOLEAN DEFAULT FALSE,
        qr_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create indexes for faster queries
    await sql`CREATE INDEX IF NOT EXISTS idx_confirmation_id ON registrations(confirmation_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mobile ON registrations(mobile);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email ON registrations(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payment_status ON registrations(payment_status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_registration_type ON registrations(registration_type);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_registration_date ON registrations(registration_date DESC);`;

    console.log('✅ Database initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Create registration
async function createRegistration(data) {
  const {
    confirmationId,
    registrationType,
    fullName,
    mobile,
    email,
    clubName,
    mealPreference,
    amount,
    transactionId,
    paymentStatus = 'pending',
    qrData,
    manuallyAdded = false
  } = data;

  const result = await sql`
    INSERT INTO registrations (
      confirmation_id, registration_type, full_name, mobile, email,
      club_name, meal_preference, amount, transaction_id,
      payment_status, qr_data, manually_added
    ) VALUES (
      ${confirmationId}, ${registrationType}, ${fullName}, ${mobile}, ${email},
      ${clubName}, ${mealPreference}, ${amount}, ${transactionId},
      ${paymentStatus}, ${qrData}, ${manuallyAdded}
    )
    RETURNING *;
  `;

  return result.rows[0];
}

// Get all registrations with pagination
async function getAllRegistrations(page = 1, limit = 50, filters = {}) {
  const offset = (page - 1) * limit;
  
  let whereClause = '';
  const params = [];
  
  if (filters.search) {
    whereClause = `WHERE (
      full_name ILIKE '%${filters.search}%' OR
      mobile ILIKE '%${filters.search}%' OR
      email ILIKE '%${filters.search}%' OR
      confirmation_id ILIKE '%${filters.search}%'
    )`;
  }
  
  if (filters.paymentStatus) {
    whereClause += whereClause ? ' AND ' : ' WHERE ';
    whereClause += `payment_status = '${filters.paymentStatus}'`;
  }
  
  if (filters.registrationType) {
    whereClause += whereClause ? ' AND ' : ' WHERE ';
    whereClause += `registration_type = '${filters.registrationType}'`;
  }

  const countResult = await sql.query(`SELECT COUNT(*) as total FROM registrations ${whereClause}`);
  const total = parseInt(countResult.rows[0].total);

  const result = await sql.query(`
    SELECT * FROM registrations
    ${whereClause}
    ORDER BY registration_date DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

// Get registration by confirmation ID
async function getRegistrationById(confirmationId) {
  const result = await sql`
    SELECT * FROM registrations
    WHERE confirmation_id = ${confirmationId}
    LIMIT 1;
  `;

  return result.rows[0];
}

// Update registration
async function updateRegistration(confirmationId, updates) {
  const setClauses = [];
  const values = [];

  Object.keys(updates).forEach((key, index) => {
    setClauses.push(`${key} = $${index + 1}`);
    values.push(updates[key]);
  });

  values.push(confirmationId);

  const result = await sql.query(`
    UPDATE registrations
    SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE confirmation_id = $${values.length}
    RETURNING *;
  `, values);

  return result.rows[0];
}

// Update payment status
async function updatePaymentStatus(confirmationId, status, transactionId, paymentDate) {
  const result = await sql`
    UPDATE registrations
    SET payment_status = ${status},
        transaction_id = ${transactionId},
        payment_date = ${paymentDate},
        updated_at = CURRENT_TIMESTAMP
    WHERE confirmation_id = ${confirmationId}
    RETURNING *;
  `;

  return result.rows[0];
}

// Mark attendance
async function markAttendance(confirmationId) {
  const result = await sql`
    UPDATE registrations
    SET attended = true,
        check_in_time = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE confirmation_id = ${confirmationId}
    RETURNING *;
  `;

  return result.rows[0];
}

// Get statistics
async function getStatistics() {
  const totalResult = await sql`SELECT COUNT(*) as count FROM registrations`;
  const paidResult = await sql`SELECT COUNT(*) as count FROM registrations WHERE payment_status = 'success'`;
  const pendingResult = await sql`SELECT COUNT(*) as count FROM registrations WHERE payment_status = 'pending'`;
  const attendedResult = await sql`SELECT COUNT(*) as count FROM registrations WHERE attended = true`;
  
  const revenueResult = await sql`
    SELECT SUM(amount) as total FROM registrations WHERE payment_status = 'success'
  `;

  const typeStatsResult = await sql`
    SELECT registration_type, COUNT(*) as count
    FROM registrations
    GROUP BY registration_type
    ORDER BY count DESC
  `;

  const mealStatsResult = await sql`
    SELECT meal_preference, COUNT(*) as count
    FROM registrations
    GROUP BY meal_preference
  `;

  return {
    total: parseInt(totalResult.rows[0].count),
    paid: parseInt(paidResult.rows[0].count),
    pending: parseInt(pendingResult.rows[0].count),
    attended: parseInt(attendedResult.rows[0].count),
    revenue: parseFloat(revenueResult.rows[0].total || 0),
    byType: typeStatsResult.rows,
    byMeal: mealStatsResult.rows
  };
}

// Delete registration (admin only)
async function deleteRegistration(confirmationId) {
  const result = await sql`
    DELETE FROM registrations
    WHERE confirmation_id = ${confirmationId}
    RETURNING *;
  `;

  return result.rows[0];
}

module.exports = {
  sql,
  initializeDatabase,
  createRegistration,
  getAllRegistrations,
  getRegistrationById,
  updateRegistration,
  updatePaymentStatus,
  markAttendance,
  getStatistics,
  deleteRegistration
};
