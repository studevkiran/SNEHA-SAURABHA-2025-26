// Enhanced Database Connection Utility
// For Neon Database (PostgreSQL)
// Falls back to mock data on localhost

const { Pool } = require('pg');
let pool;
let isDbAvailable = false;

// Try to connect to Neon database
try {
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    isDbAvailable = true;
    console.log('📦 Neon Database: Connected');
  } else {
    console.log('📦 Database not configured - using mock data (localhost mode)');
    isDbAvailable = false;
  }
} catch (error) {
  console.log('📦 Database connection error - using mock data:', error.message);
  isDbAvailable = false;
}

// Mock data storage for localhost
let mockRegistrations = [
  {
    id: 1,
    registration_id: 'ROTA04V0001',
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

// Get next registration ID (ROTA04V0001, ROTA04V0002, etc.)
async function getNextRegistrationId() {
  if (!isDbAvailable) {
    // Mock mode
    const lastId = mockRegistrations.length > 0 
      ? mockRegistrations[mockRegistrations.length - 1].registration_id 
      : 'ROTA04V0000';
    const numPart = parseInt(lastId.replace('ROTA04V', '')) + 1;
    return 'ROTA04V' + numPart.toString().padStart(4, '0');
  }
  
  try {
    // Query for the HIGHEST numeric ROTA04V registration ID (not by date, by number!)
    // This ensures we always get the max number even if old data is imported later
    const result = await pool.query(`
      SELECT registration_id,
             CAST(SUBSTRING(registration_id FROM 8) AS INTEGER) as num_part
      FROM registrations 
      WHERE registration_id LIKE 'ROTA04V%'
      ORDER BY num_part DESC 
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      // No ROTA04V IDs exist yet, start from 0001
      return 'ROTA04V0001';
    }
    
    const lastId = result.rows[0].registration_id;
    const numPart = parseInt(lastId.replace('ROTA04V', '')) + 1;
    return 'ROTA04V' + numPart.toString().padStart(4, '0');
  } catch (error) {
    console.error('Error getting next registration ID:', error);
    // Fallback: try MAX with CAST
    try {
      const fallbackResult = await pool.query(`
        SELECT MAX(CAST(SUBSTRING(registration_id FROM 8) AS INTEGER)) as max_num
        FROM registrations 
        WHERE registration_id LIKE 'ROTA04V%'
      `);
      
      if (fallbackResult.rows[0].max_num) {
        const nextNum = fallbackResult.rows[0].max_num + 1;
        return 'ROTA04V' + nextNum.toString().padStart(4, '0');
      }
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
    }
    
    return 'ROTA04V0001';
  }
}

// Check if mobile number already exists
async function checkDuplicateMobile(mobile) {
  if (!isDbAvailable) {
    // Mock mode
    return mockRegistrations.some(r => r.mobile === mobile);
  }
  
  try {
    const result = await pool.query(
      'SELECT registration_id, name, registration_type FROM registrations WHERE mobile = $1 LIMIT 1',
      [mobile]
    );
    
    if (result.rows.length > 0) {
      return {
        exists: true,
        registration: result.rows[0]
      };
    }
    
    return { exists: false };
  } catch (error) {
    console.error('Error checking duplicate mobile:', error);
    return { exists: false }; // Allow registration if check fails
  }
}

// Create new registration
async function createRegistration(data) {
  // Check for duplicate mobile number first
  const duplicateCheck = await checkDuplicateMobile(data.mobile);
  if (duplicateCheck.exists) {
    const existing = duplicateCheck.registration;
    throw new Error(
      `Mobile number ${data.mobile} is already registered. ` +
      `Registration ID: ${existing.registration_id}, Name: ${existing.name}, Type: ${existing.registration_type}`
    );
  }

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
    const result = await pool.query(
      `INSERT INTO registrations (
        registration_id, order_id, name, email, mobile, club, club_id, zone,
        registration_type, registration_amount, meal_preference, tshirt_size,
        payment_status, payment_method, transaction_id, upi_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        registrationId,
        data.orderId || `ORDER_${Date.now()}`,
        data.name,
        data.email || 'Not Provided',
        data.mobile,
        data.clubName,
        data.clubId || 0,
        data.zone || 'Unmapped',
        data.registrationType,
        data.amount,
        data.mealPreference || 'Veg',
        data.tshirtSize || 'N/A',
        data.paymentStatus || 'Pending',
        data.paymentMethod || 'Cashfree',
        data.transactionId || null,
        data.upiId || null
      ]
    );
    
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
    
    const result = await pool.query(query, params);
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

// Get registration by Order ID (for payment verification)
async function getRegistrationByOrderId(orderId) {
  if (!isDbAvailable) {
    // Mock mode
    const registration = mockRegistrations.find(r => r.transaction_id === orderId);
    return registration || null;
  }
  
  try {
    const result = await sql`
      SELECT * FROM registrations 
      WHERE transaction_id = ${orderId}
      LIMIT 1
    `;
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching registration by order ID:', error);
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

// Update payment status
async function updatePaymentStatus(orderId, updateData) {
  try {
    const result = await sql`
      UPDATE registrations 
      SET 
        payment_status = ${updateData.paymentStatus || 'completed'},
        upi_id = ${updateData.upiId || null},
        gateway_response = ${updateData.gatewayResponse || null},
        payment_date = CURRENT_TIMESTAMP,
        verification_status = 'Verified',
        updated_at = CURRENT_TIMESTAMP
      WHERE transaction_id = ${orderId}
      RETURNING *
    `;
    
    return result.rows.length > 0 ? result.rows[0] : null;
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
  checkDuplicateMobile,
  createRegistration,
  getAllRegistrations,
  getRegistrationById,
  getRegistrationByOrderId,
  updateRegistration,
  updatePaymentStatus,
  getRegistrationStats,
  
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
  
  // Utility
  isDbAvailable
};
