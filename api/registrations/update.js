// API: Update registration details with remarks
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      registration_id,
      name,
      email,
      mobile,
      club,
      order_id,
      registration_type,
      meal_preference,
      tshirt_size,
      edit_remarks
    } = req.body;

    // Validation
    if (!registration_id) {
      return res.status(400).json({
        success: false,
        error: 'Registration ID is required'
      });
    }

    if (!edit_remarks || edit_remarks.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Edit remarks are mandatory (minimum 5 characters)'
      });
    }

    console.log('📝 Updating registration:', registration_id);

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (email) {
      updates.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (mobile) {
      updates.push(`mobile = $${paramCount}`);
      values.push(mobile);
      paramCount++;
    }

    if (club) {
      updates.push(`club = $${paramCount}`);
      values.push(club);
      paramCount++;
    }

    if (order_id) {
      updates.push(`order_id = $${paramCount}`);
      values.push(order_id);
      paramCount++;
    }

    if (registration_type) {
      updates.push(`registration_type = $${paramCount}`);
      values.push(registration_type);
      paramCount++;
    }

    if (meal_preference) {
      updates.push(`meal_preference = $${paramCount}`);
      values.push(meal_preference);
      paramCount++;
    }

    if (tshirt_size) {
      updates.push(`tshirt_size = $${paramCount}`);
      values.push(tshirt_size);
      paramCount++;
    }

    // Always update edit_remarks and updated_at
    updates.push(`edit_remarks = $${paramCount}`);
    values.push(edit_remarks);
    paramCount++;

    updates.push(`updated_at = NOW()`);

    // Add registration_id as last parameter
    values.push(registration_id);

    const query = `
      UPDATE registrations 
      SET ${updates.join(', ')}
      WHERE registration_id = $${paramCount}
      RETURNING *
    `;

    console.log('🔄 Executing update query:', { registration_id, updates: updates.length });

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    console.log('✅ Registration updated successfully');

    return res.status(200).json({
      success: true,
      message: 'Registration updated successfully',
      registration: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error updating registration:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update registration'
    });
  }
};
