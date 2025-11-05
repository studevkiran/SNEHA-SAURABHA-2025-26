// Enhanced Database Connection Utility
// For Vercel Postgres with @vercel/postgres
// Falls back to mock data on localhost

let sql;
let isDbAvailable = false;

// Try to load database, fall back gracefully if not available
try {
  const postgres = require('@vercel/postgres');
  sql = postgres.sql;
  isDbAvailable = !!process.env.POSTGRES_URL;
  console.log('📦 Database status:', isDbAvailable ? 'Connected' : 'Mock mode (localhost)');
} catch (error) {
  console.log('📦 Database not available - using mock data (localhost mode)');
  isDbAvailable = false;
}

// Mock data storage for localhost
let mockRegistrations = [
  {
    id: 1,
    registration_id: 'SS00001',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    mobile: '9876543210',
    club_name: 'Mysore',
    registration_type: 'rotarian',
    amount: 4500,
    meal_preference: 'Veg',
    payment_status: 'Paid',
    payment_method: 'Cashfree',
    transaction_id: 'TXN1001',
    upi_id: null,
    verification_status: 'Verified',
    created_at: new Date('2025-10-28')
  }
];

// ========================================
// REGISTRATION FUNCTIONS
// ========================================

// Get next registration ID (SS00001, SS00002, etc.)
async function getNextRegistrationId() {
  if (!isDbAvailable) {
    // Mock mode
    const lastId = mockRegistrations.length > 0 
      ? mockRegistrations[mockRegistrations.length - 1].registration_id 
      : 'SS00000';
    const numPart = parseInt(lastId.substring(2)) + 1;
    return 'SS' + numPart.toString().padStart(5, '0');
  }
  
  try {
    const result = await sql`
      SELECT registration_id 
      FROM registrations 
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    if (result.rows.length === 0) {
      return 'SS00001';
    }
    
    const lastId = result.rows[0].registration_id;
    const numPart = parseInt(lastId.substring(2)) + 1;
    return 'SS' + numPart.toString().padStart(5, '0');
  } catch (error) {
    console.error('Error getting next registration ID:', error);
    return 'SS00001';
  }
}

// Create new registration
async function createRegistration(data) {
  const registrationId = await getNextRegistrationId();
  
  if (!isDbAvailable) {
    // Mock mode - store in memory
    const newReg = {
      id: mockRegistrations.length + 1,
      registration_id: registrationId,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      club_name: data.clubName,
      registration_type: data.registrationType,
      amount: data.amount,
      meal_preference: data.mealPreference,
      payment_status: data.paymentStatus || 'Pending',
      payment_method: data.paymentMethod || 'Cashfree',
      transaction_id: data.transactionId || null,
      upi_id: data.upiId || null,
      verification_status: 'Pending',
      created_at: new Date()
    };
    mockRegistrations.push(newReg);
    console.log('✅ Mock registration created:', registrationId);
    return { success: true, registration: newReg };
  }
  
  try {
    const result = await sql`
      INSERT INTO registrations (
        registration_id, name, email, mobile, club_name,
        registration_type, amount, meal_preference,
        payment_status, payment_method, transaction_id, upi_id
      ) VALUES (
        ${registrationId}, ${data.name}, ${data.email}, ${data.mobile}, ${data.clubName},
        ${data.registrationType}, ${data.amount}, ${data.mealPreference},
        ${data.paymentStatus || 'Pending'}, ${data.paymentMethod || 'Cashfree'}, 
        ${data.transactionId || null}, ${data.upiId || null}
      )
      RETURNING *
    `;
    
    return { success: true, registration: result.rows[0] };
  } catch (error) {
    console.error('Error creating registration:', error);
    throw error;
  }
}

// Get all registrations
async function getAllRegistrations(filters = {}) {
  if (!isDbAvailable) {
    // Mock mode - return mock data with filters
    let results = [...mockRegistrations];
    
    if (filters.registrationType) {
      results = results.filter(r => r.registration_type === filters.registrationType);
    }
    if (filters.paymentStatus) {
      results = results.filter(r => r.payment_status === filters.paymentStatus);
    }
    if (filters.mealPreference) {
      results = results.filter(r => r.meal_preference === filters.mealPreference);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      results = results.filter(r => 
        r.name.toLowerCase().includes(search) ||
        r.email.toLowerCase().includes(search) ||
        r.mobile.includes(search)
      );
    }
    
    return results;
  }
  
  try {
    let query = 'SELECT * FROM registrations WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    // Apply filters
    if (filters.registrationType) {
      query += ` AND registration_type = $${paramCount}`;
      params.push(filters.registrationType);
      paramCount++;
    }
    
    if (filters.paymentStatus) {
      query += ` AND payment_status = $${paramCount}`;
      params.push(filters.paymentStatus);
      paramCount++;
    }
    
    if (filters.mealPreference) {
      query += ` AND meal_preference = $${paramCount}`;
      params.push(filters.mealPreference);
      paramCount++;
    }
    
    if (filters.search) {
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR mobile ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await sql.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching registrations:', error);
    throw error;
  }
}

// Get registration by ID
async function getRegistrationById(registrationId) {
  if (!isDbAvailable) {
    // Mock mode
    const registration = mockRegistrations.find(r => r.registration_id === registrationId);
    return registration || null;
  }
  
  try {
    const result = await sql`
      SELECT * FROM registrations 
      WHERE registration_id = ${registrationId}
      LIMIT 1
    `;
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching registration:', error);
    throw error;
  }
}

// Get registration statistics
async function getRegistrationStats() {
  if (!isDbAvailable) {
    // Mock mode
    const total = mockRegistrations.length;
    const paid = mockRegistrations.filter(r => r.payment_status === 'Paid').length;
    const pending = mockRegistrations.filter(r => r.payment_status === 'Pending').length;
    const revenue = mockRegistrations
      .filter(r => r.payment_status === 'Paid')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const mealCounts = {
      veg: mockRegistrations.filter(r => r.meal_preference === 'Veg').length,
      nonVeg: mockRegistrations.filter(r => r.meal_preference === 'Non-Veg').length,
      jain: mockRegistrations.filter(r => r.meal_preference === 'Jain').length
    };
    
    return {
      totalRegistrations: total,
      totalRevenue: revenue,
      paidCount: paid,
      pendingCount: pending,
      mealCounts
    };
  }
  
  try {
    const stats = await sql`
      SELECT 
        COUNT(*) as total_registrations,
        SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN payment_status = 'Paid' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN payment_status = 'Pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN meal_preference = 'Veg' THEN 1 ELSE 0 END) as veg_count,
        SUM(CASE WHEN meal_preference = 'Non-Veg' THEN 1 ELSE 0 END) as non_veg_count,
        SUM(CASE WHEN meal_preference = 'Jain' THEN 1 ELSE 0 END) as jain_count
      FROM registrations
    `;
    
    const row = stats.rows[0];
    return {
      totalRegistrations: parseInt(row.total_registrations),
      totalRevenue: parseInt(row.total_revenue || 0),
      paidCount: parseInt(row.paid_count),
      pendingCount: parseInt(row.pending_count),
      mealCounts: {
        veg: parseInt(row.veg_count),
        nonVeg: parseInt(row.non_veg_count),
        jain: parseInt(row.jain_count)
      }
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}

// Update registration
async function updateRegistration(registrationId, updates) {
  if (!isDbAvailable) {
    // Mock mode
    const index = mockRegistrations.findIndex(r => r.registration_id === registrationId);
    if (index !== -1) {
      mockRegistrations[index] = { ...mockRegistrations[index], ...updates };
      return { success: true, registration: mockRegistrations[index] };
    }
    return { success: false, error: 'Registration not found' };
  }
  
  try {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `UPDATE registrations SET ${setClause} WHERE registration_id = $1 RETURNING *`;
    const result = await sql.query(query, [registrationId, ...values]);
    
    return { success: true, registration: result.rows[0] };
  } catch (error) {
    console.error('Error updating registration:', error);
    throw error;
  }
}

// ========================================
// PAYMENT LOG FUNCTIONS
// ========================================

// Create payment log
async function createPaymentLog(data) {
  if (!isDbAvailable) {
    // Mock mode - just log it
    console.log('📝 Payment log (mock):', data);
    return { success: true };
  }
  
  try {
    await sql`
      INSERT INTO payment_logs (
        registration_id, order_id, transaction_id, amount,
        status, payment_method, cashfree_response
      ) VALUES (
        ${data.registrationId}, ${data.orderId}, ${data.transactionId},
        ${data.amount}, ${data.status}, ${data.paymentMethod},
        ${JSON.stringify(data.cashfreeResponse || {})}
      )
    `;
    return { success: true };
  } catch (error) {
    console.error('Error creating payment log:', error);
    throw error;
  }
}

module.exports = {
  getNextRegistrationId,
  createRegistration,
  getAllRegistrations,
  getRegistrationById,
  getRegistrationStats,
  updateRegistration,
  createPaymentLog,
  isDbAvailable  // Export this so APIs can check
};
    const query = `
      UPDATE registrations 
      SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE registration_id = $${paramCount}
      RETURNING *
    `;
    
    const result = await sql.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating registration:', error);
    throw error;
  }
}

// Update payment status
async function updatePaymentStatus(registrationId, status, transactionId = null) {
  try {
    const result = await sql`
      UPDATE registrations 
      SET 
        payment_status = ${status},
        transaction_id = ${transactionId},
        payment_date = ${status === 'Paid' ? new Date() : null},
        verification_status = ${status === 'Paid' ? 'Verified' : 'Pending'},
        updated_at = CURRENT_TIMESTAMP
      WHERE registration_id = ${registrationId}
      RETURNING *
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

// ========================================
// PAYMENT LOG FUNCTIONS
// ========================================

// Create payment log
async function createPaymentLog(data) {
  try {
    const result = await sql`
      INSERT INTO payment_logs (
        registration_id, order_id, payment_session_id, cf_payment_id,
        amount, currency, payment_status, payment_method,
        payment_message, bank_reference, payment_time
      ) VALUES (
        ${data.registrationId}, ${data.orderId}, ${data.paymentSessionId}, ${data.cfPaymentId || null},
        ${data.amount}, ${data.currency || 'INR'}, ${data.paymentStatus}, ${data.paymentMethod || null},
        ${data.paymentMessage || null}, ${data.bankReference || null}, ${data.paymentTime || new Date()}
      )
      RETURNING *
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating payment log:', error);
    throw error;
  }
}

// Update payment log with webhook data
async function updatePaymentLogWebhook(orderId, webhookData) {
  try {
    const result = await sql`
      UPDATE payment_logs 
      SET 
        webhook_received = true,
        webhook_data = ${JSON.stringify(webhookData)},
        payment_status = ${webhookData.payment_status},
        cf_payment_id = ${webhookData.cf_payment_id || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE order_id = ${orderId}
      RETURNING *
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating payment log webhook:', error);
    throw error;
  }
}

// ========================================
// STATISTICS FUNCTIONS
// ========================================

// Get dashboard statistics
async function getDashboardStats() {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total_registrations,
        COALESCE(SUM(amount), 0) as total_revenue,
        COUNT(CASE WHEN payment_status = 'Paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN payment_status = 'Pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN payment_status = 'Failed' THEN 1 END) as failed_count,
        COUNT(CASE WHEN meal_preference = 'Veg' THEN 1 END) as veg_count,
        COUNT(CASE WHEN meal_preference = 'Non-Veg' THEN 1 END) as non_veg_count,
        COUNT(CASE WHEN meal_preference = 'Jain' THEN 1 END) as jain_count
      FROM registrations
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

// Get registration type breakdown
async function getRegistrationTypeStats() {
  try {
    const result = await sql`
      SELECT 
        registration_type,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as revenue,
        COUNT(CASE WHEN payment_status = 'Paid' THEN 1 END) as paid_count
      FROM registrations
      GROUP BY registration_type
      ORDER BY count DESC
    `;
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching registration type stats:', error);
    throw error;
  }
}

// ========================================
// ADMIN FUNCTIONS
// ========================================

// Get admin user by username
async function getAdminByUsername(username) {
  try {
    const result = await sql`
      SELECT * FROM admin_users 
      WHERE username = ${username} AND is_active = true
      LIMIT 1
    `;
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching admin user:', error);
    throw error;
  }
}

// Update admin last login
async function updateAdminLogin(username) {
  try {
    const result = await sql`
      UPDATE admin_users 
      SET 
        last_login = CURRENT_TIMESTAMP,
        login_count = login_count + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE username = ${username}
      RETURNING *
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating admin login:', error);
    throw error;
  }
}

// Log admin activity
async function logActivity(data) {
  try {
    const result = await sql`
      INSERT INTO activity_logs (
        admin_username, action, entity_type, entity_id,
        description, ip_address, user_agent
      ) VALUES (
        ${data.username}, ${data.action}, ${data.entityType || null}, ${data.entityId || null},
        ${data.description || null}, ${data.ipAddress || null}, ${data.userAgent || null}
      )
      RETURNING *
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - logging errors shouldn't break the app
    return null;
  }
}

// ========================================
// EXPORTS
// ========================================

module.exports = {
  // Registration functions
  getNextRegistrationId,
  createRegistration,
  getAllRegistrations,
  getRegistrationById,
  updateRegistration,
  updatePaymentStatus,
  
  // Payment log functions
  createPaymentLog,
  updatePaymentLogWebhook,
  
  // Statistics functions
  getDashboardStats,
  getRegistrationTypeStats,
  
  // Admin functions
  getAdminByUsername,
  updateAdminLogin,
  logActivity,
  
  // Direct SQL access for custom queries
  sql
};
