// Neon Database Connection Utility
// Simple PostgreSQL connection for payment flow

const { Pool } = require('pg');

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
    registrationType: data.registrationType
  });
  
  const registrationId = await getNextRegistrationId();
  console.log('🆔 Generated registration ID:', registrationId);
  
  if (!isDbAvailable) {
    console.log('✅ Mock registration created:', registrationId);
    return { success: true, registration: { registration_id: registrationId } };
  }
  
  try {
    console.log('💾 Attempting to insert into database...');
    const result = await pool.query(
      `INSERT INTO registrations (
        registration_id, name, email, mobile, club, club_id,
        registration_type, registration_amount, meal_preference,
        payment_status, payment_method, transaction_id, upi_id,
        registration_status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      RETURNING *`,
      [
        registrationId,
        data.name,
        data.email,
        data.mobile,
        data.clubName || 'Not Specified',
        data.clubId || 0,
        data.registrationType,
        data.amount,
        data.mealPreference || 'Veg',
        data.paymentStatus || 'Pending',
        data.paymentMethod || 'Cashfree',
        data.transactionId || null,
        data.upiId || null,
        'Pending'
      ]
    );
    
    console.log('✅ Registration saved to Neon:', registrationId);
    return { success: true, registration: result.rows[0] };
  } catch (error) {
    console.error('❌ Error creating registration:', error.message);
    console.error('❌ Error details:', error);
    throw error;
  }
}

// Update payment status
async function updatePaymentStatus(orderId, paymentDetails = {}) {
  if (!isDbAvailable) {
    console.log('✅ Mock payment status updated:', orderId, paymentDetails.paymentStatus);
    return { success: true };
  }
  
  try {
    const { paymentStatus, upiId, gatewayResponse } = paymentDetails;
    
    const result = await pool.query(
      `UPDATE registrations 
       SET payment_status = $1, 
           upi_id = COALESCE($2, upi_id),
           verification_status = $3,
           updated_at = NOW()
       WHERE transaction_id = $4
       RETURNING *`,
      [
        paymentStatus || 'completed',
        upiId,
        paymentStatus === 'completed' ? 'Verified' : 'Pending',
        orderId
      ]
    );
    
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
    const result = await pool.query(
      `SELECT * FROM registrations WHERE transaction_id = $1 LIMIT 1`,
      [orderId]
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Registration found for order:', orderId);
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

module.exports = {
  createRegistration,
  updatePaymentStatus,
  getAllRegistrations,
  getStatistics,
  getRegistrationByOrderId
};
