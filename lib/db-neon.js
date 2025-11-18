// Neon Database Connection Utility
// Simple PostgreSQL connection for payment flow

const { Pool } = require('pg');
const { getZoneForClub } = require('./zone-mapping');

let pool;
let isDbAvailable = false;

// Initialize connection pool
try {
  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    isDbAvailable = true;
    console.log('📦 Neon Database: Connected');
  } else {
    console.log('📦 DATABASE_URL not set - mock mode');
    isDbAvailable = false;
  }
} catch (error) {
  console.log('📦 Database error:', error.message);
  isDbAvailable = false;
}

// Get next registration ID
async function getNextRegistrationId() {
  if (!isDbAvailable) {
    return 'SS' + Date.now().toString().slice(-5);
  }

  try {
    console.log('🔍 Querying for last registration ID...');
    const result = await pool.query(
      'SELECT registration_id FROM registrations ORDER BY id DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      console.log('📋 No existing registrations, starting with SS00001');
      return 'SS00001';
    }
    
    const lastId = result.rows[0].registration_id;
    const numPart = parseInt(lastId.substring(2)) + 1;
    const newId = 'SS' + numPart.toString().padStart(5, '0');
    console.log('📋 Last ID:', lastId, '→ New ID:', newId);
    return newId;
  } catch (error) {
    console.error('❌ Error getting next registration ID:', error.message);
    // Fallback to timestamp-based ID
    return 'SS' + Date.now().toString().slice(-5);
  }
}

// Create new registration
async function createRegistration(data) {
  console.log('📥 createRegistration called with data:', {
    name: data.name,
    email: data.email,
    mobile: data.mobile,
    amount: data.amount,
    registrationType: data.registrationType,
    confirmationId: data.confirmationId
  });
  
  // Use provided confirmation ID or generate new one
  const registrationId = data.confirmationId || await getNextRegistrationId();
  console.log('🆔 Using registration ID:', registrationId);
  
  if (!isDbAvailable) {
    console.log('✅ Mock registration created:', registrationId);
    return { success: true, registration: { registration_id: registrationId } };
  }
  
  try {
    console.log('💾 Attempting to insert into database...');
    console.log('💾 Transaction ID to save:', data.transactionId);

    const clubName = data.clubName || 'Not Specified';
    const zone = getZoneForClub(clubName);
    console.log('🗺️ Resolved zone for club:', clubName, '→', zone);

    const result = await pool.query(
      `INSERT INTO registrations (
        registration_id, name, email, mobile, club, club_id, zone,
        registration_type, registration_amount, meal_preference, tshirt_size,
        payment_status, payment_method, transaction_id, upi_id,
        registration_status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      RETURNING *`,
      [
        registrationId,
        data.name,
        data.email,
        data.mobile,
        clubName,
        data.clubId || 0,
        zone,
        data.registrationType,
        data.amount,
        data.mealPreference || 'Veg',
        data.tshirtSize || null,
        data.paymentStatus || 'Pending',
        data.paymentMethod || 'Cashfree',
        data.transactionId || null,
        data.upiId || null,
        'Pending'
      ]
    );

    console.log('✅ Registration saved to Neon:', registrationId);
    console.log('✅ Saved with transaction_id:', data.transactionId);
    return { success: true, registration: result.rows[0] };
  } catch (error) {
    console.error('❌ Error creating registration:', error.message);
    console.error('❌ Error details:', error);
    throw error;
  }
}

// Update payment status
async function updatePaymentStatus(orderId, paymentStatus, transactionId = null) {
  if (!isDbAvailable) {
    console.log('✅ Mock payment status updated:', orderId, paymentStatus);
    return { success: true };
  }
  
  try {
    console.log('💾 Updating payment status:', { orderId, paymentStatus, transactionId });
    
    const result = await pool.query(
      `UPDATE registrations 
       SET payment_status = $1,
           updated_at = NOW()
       WHERE transaction_id = $2
       RETURNING *`,
      [paymentStatus, orderId]
    );
    
    if (result.rows.length === 0) {
      console.log('⚠️ No registration found with transaction_id:', orderId);
      return { success: false, error: 'Registration not found' };
    }
    
    console.log('✅ Payment status updated:', orderId, paymentStatus);
    return { success: true, registration: result.rows[0] };
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    throw error;
  }
}

// Get all registrations (for admin)
async function getAllRegistrations(filters = {}) {
  if (!isDbAvailable) {
    return [];
  }
  
  try {
    let query = 'SELECT * FROM registrations ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('❌ Error getting registrations:', error);
    return [];
  }
}

// Get statistics (for admin dashboard)
async function getStatistics() {
  if (!isDbAvailable) {
    return {
      totalRegistrations: 0,
      totalRevenue: 0,
      successfulPayments: 0,
      pendingPayments: 0
    };
  }
  
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_registrations,
        COALESCE(SUM(amount), 0) as total_revenue,
        COUNT(CASE WHEN payment_status = 'SUCCESS' THEN 1 END) as successful_payments,
        COUNT(CASE WHEN payment_status = 'Pending' THEN 1 END) as pending_payments
      FROM registrations
    `);
    
    return {
      totalRegistrations: parseInt(result.rows[0].total_registrations),
      totalRevenue: parseFloat(result.rows[0].total_revenue),
      successfulPayments: parseInt(result.rows[0].successful_payments),
      pendingPayments: parseInt(result.rows[0].pending_payments)
    };
  } catch (error) {
    console.error('❌ Error getting statistics:', error);
    return {
      totalRegistrations: 0,
      totalRevenue: 0,
      successfulPayments: 0,
      pendingPayments: 0
    };
  }
}

// Get registration by order/transaction ID
async function getRegistrationByOrderId(orderId) {
  if (!isDbAvailable) {
    console.log('🔧 Database not available - returning mock data');
    return null;
  }
  
  try {
    console.log('🔍 Searching for registration with order ID:', orderId);
    const result = await pool.query(
      `SELECT * FROM registrations WHERE transaction_id = $1 LIMIT 1`,
      [orderId]
    );
    
    console.log('🔍 Query result rows:', result.rows.length);
    
    if (result.rows.length > 0) {
      console.log('✅ Registration found for order:', orderId);
      console.log('✅ Registration ID:', result.rows[0].registration_id);
      return result.rows[0];
    } else {
      console.log('⚠️ No registration found for order:', orderId);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting registration:', error);
    return null;
  }
}

// === NEW TWO-TABLE APPROACH ===

// Create payment attempt (before payment confirmation)
async function createPaymentAttempt(data) {
  if (!isDbAvailable) {
    console.log('✅ Mock payment attempt created:', data.orderId);
    return { success: true, orderId: data.orderId };
  }
  
  try {
    console.log('💾 Creating payment attempt:', data.orderId);
    
    // Check if order already exists
    const existing = await pool.query(
      'SELECT * FROM payment_attempts WHERE order_id = $1',
      [data.orderId]
    );
    
    if (existing.rows.length > 0) {
      const existingStatus = existing.rows[0].payment_status;
      console.log('⚠️ Order already exists with status:', existingStatus);
      
      if (existingStatus === 'SUCCESS') {
        return { 
          success: false, 
          error: 'ALREADY_PAID',
          message: 'This registration has already been paid for.' 
        };
      }
      
      // Allow retry for FAILED or Pending
      console.log('✅ Allowing retry for:', data.orderId);
      return { success: true, orderId: data.orderId, retry: true };
    }
    
    // Insert new payment attempt
    const result = await pool.query(
      `INSERT INTO payment_attempts (
        order_id, name, mobile, email, club, club_id, zone,
        registration_type, registration_amount, meal_preference, tshirt_size,
        payment_status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Pending', NOW())
      RETURNING *`,
      [
        data.orderId,
        data.name,
        data.mobile,
        data.email || 'Not Provided',
        data.clubName || 'Not Specified',
        data.clubId || 0,
        data.zone || 'Unmapped',
        data.registrationType,
        data.amount,
        data.mealPreference || 'Veg',
        data.tshirtSize || 'N/A'
      ]
    );
    
    console.log('✅ Payment attempt created:', data.orderId);
    return { success: true, orderId: data.orderId, attempt: result.rows[0] };
  } catch (error) {
    console.error('❌ Error creating payment attempt:', error);
    throw error;
  }
}

// Get payment attempt by order ID
async function getPaymentAttempt(orderId) {
  if (!isDbAvailable) {
    return null;
  }
  
  try {
    const result = await pool.query(
      'SELECT * FROM payment_attempts WHERE order_id = $1',
      [orderId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('❌ Error getting payment attempt:', error);
    return null;
  }
}

// Create confirmed registration (after payment SUCCESS)
async function createConfirmedRegistration(orderId, transactionId, upiId = null) {
  if (!isDbAvailable) {
    console.log('✅ Mock confirmed registration created');
    return { success: true, registrationId: 'ROT01V1234' };
  }
  
  try {
    console.log('🎫 Creating confirmed registration for order:', orderId);
    console.log('💳 Transaction ID:', transactionId);
    console.log('💰 UPI ID:', upiId || 'N/A');
    
    // Get payment attempt details
    const attemptResult = await pool.query(
      'SELECT * FROM payment_attempts WHERE order_id = $1',
      [orderId]
    );
    
    if (attemptResult.rows.length === 0) {
      throw new Error('Payment attempt not found for order: ' + orderId);
    }
    
    const data = attemptResult.rows[0];
    
    console.log(`🗺️ Payment attempt zone: ${data.zone} for club: ${data.club}`);
    
    // Generate Registration ID with UNIFIED format: 2026RTY#### (continues from 0689)
    // Single format for all registration types
    const prefix = '2026RTY';
    
    // Query for HIGHEST number from ALL registration IDs
    const sequenceResult = await pool.query(`
      SELECT registration_id,
             CAST(SUBSTRING(registration_id FROM '.{4}$') AS INTEGER) as num_part
      FROM registrations 
      WHERE LENGTH(registration_id) >= 4
        AND SUBSTRING(registration_id FROM '.{4}$') ~ '^[0-9]{4}$'
      ORDER BY num_part DESC 
      LIMIT 1
    `);
    
    let nextNumber = 689; // Start from 0689 if no records exist
    if (sequenceResult.rows.length > 0) {
      const lastNumber = sequenceResult.rows[0].num_part;
      nextNumber = lastNumber + 1;
      console.log(`🔢 Last sequence: ${lastNumber} → Next: ${nextNumber}`);
    }
    
    const registrationId = prefix + nextNumber.toString().padStart(4, '0');
    
    console.log('🎫 Generated Registration ID:', registrationId);
    
    // Insert into registrations table (with zone, tshirt_size, and upi_id columns)
    const result = await pool.query(
      `INSERT INTO registrations (
        registration_id, order_id, name, mobile, email,
        club, club_id, zone, registration_type, registration_amount,
        meal_preference, tshirt_size, payment_status, payment_method,
        transaction_id, upi_id, registration_source, payment_date, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'SUCCESS', 'Cashfree', $13, $14, 'Website', NOW(), NOW())
      RETURNING *`,
      [
        registrationId,
        orderId,
        data.name,
        data.mobile,
        data.email,
        data.club,
        data.club_id,
        data.zone || 'Unmapped',
        data.registration_type,
        data.registration_amount,
        data.meal_preference,
        data.tshirt_size || 'N/A',
        transactionId,
        upiId
      ]
    );
    
    console.log('✅ Confirmed registration created:', registrationId);
    
    // Update payment_attempts to SUCCESS
    await pool.query(
      `UPDATE payment_attempts 
       SET payment_status = 'SUCCESS', 
           transaction_id = $1,
           upi_id = $2,
           completed_at = NOW()
       WHERE order_id = $3`,
      [transactionId, upiId, orderId]
    );
    
    console.log('✅ Payment attempt marked as SUCCESS');
    
    return { 
      success: true, 
      registrationId,
      registration: result.rows[0] 
    };
  } catch (error) {
    console.error('❌ Error creating confirmed registration:', error);
    throw error;
  }
}

// Update payment attempt status (for FAILED/CANCELLED)
async function updatePaymentAttemptStatus(orderId, status, errorMessage = null) {
  if (!isDbAvailable) {
    return { success: true };
  }
  
  try {
    console.log('💾 Updating payment attempt status:', orderId, status);
    
    await pool.query(
      `UPDATE payment_attempts 
       SET payment_status = $1,
           error_message = $2,
           completed_at = NOW()
       WHERE order_id = $3`,
      [status, errorMessage, orderId]
    );
    
    console.log('✅ Payment attempt status updated');
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating payment attempt status:', error);
    throw error;
  }
}

// Get pool for direct queries
function getPool() {
  return pool;
}

// Direct query function for raw SQL queries
async function query(sql, params = []) {
  if (!isDbAvailable) {
    throw new Error('Database not available');
  }
  return await pool.query(sql, params);
}

module.exports = {
  // Old functions (keep for compatibility)
  createRegistration,
  updatePaymentStatus,
  getAllRegistrations,
  getStatistics,
  getRegistrationByOrderId,
  
  // New two-table approach functions
  createPaymentAttempt,
  getPaymentAttempt,
  createConfirmedRegistration,
  updatePaymentAttemptStatus,
  
  // Direct access
  getPool,
  query
};
