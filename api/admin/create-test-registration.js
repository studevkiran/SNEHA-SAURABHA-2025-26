/**
 * Create test registration to verify zone assignment
 */

const { Pool } = require('pg');
const { getZoneForClub } = require('../../lib/zone-mapping');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { clubName, clubId } = req.body;
    
    if (!clubName) {
      return res.status(400).json({ error: 'clubName required' });
    }

    // Compute zone
    const zone = getZoneForClub(clubName);
    
    console.log(`Creating test registration: ${clubName} → ${zone}`);

    // Generate test order ID
    const orderId = `TEST_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Create payment attempt
    await pool.query(
      `INSERT INTO payment_attempts (
        order_id, name, mobile, email, club, club_id, zone,
        registration_type, registration_amount, meal_preference, 
        tshirt_size, payment_status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'test', NOW())`,
      [
        orderId,
        'Test User',
        '9999999999',
        'test@test.com',
        clubName,
        clubId || 0,
        zone,
        'Rotarian',
        7500,
        'Veg',
        'L'
      ]
    );

    // Generate registration ID
    const sequenceResult = await pool.query(`
      SELECT CAST(SUBSTRING(registration_id FROM '.{4}$') AS INTEGER) as num_part
      FROM registrations 
      WHERE LENGTH(registration_id) >= 4
        AND SUBSTRING(registration_id FROM '.{4}$') ~ '^[0-9]{4}$'
      ORDER BY num_part DESC 
      LIMIT 1
    `);
    
    let nextNumber = 689;
    if (sequenceResult.rows.length > 0) {
      nextNumber = sequenceResult.rows[0].num_part + 1;
    }
    
    const registrationId = '2026RTY' + nextNumber.toString().padStart(4, '0');

    // Create registration with re-computed zone (same as production logic)
    const { getZoneForClub: getZoneFresh } = require('../../lib/zone-mapping');
    const computedZone = clubName && clubName !== 'Guest/No Club' 
      ? getZoneFresh(clubName) 
      : null;
    
    const finalZone = computedZone || zone || null;

    const result = await pool.query(
      `INSERT INTO registrations (
        registration_id, order_id, name, mobile, email,
        club, club_id, zone, registration_type, registration_amount,
        meal_preference, tshirt_size, payment_status, payment_method,
        transaction_id, upi_id, registration_source, payment_date, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'test', 'Test', $13, NULL, 'Test', NOW(), NOW())
      RETURNING *`,
      [
        registrationId,
        orderId,
        'Test User',
        '9999999999',
        'test@test.com',
        clubName,
        clubId || 0,
        finalZone,
        'Rotarian',
        7500,
        'Veg',
        'L',
        'TEST_' + Date.now()
      ]
    );

    const registration = result.rows[0];

    res.status(200).json({
      success: true,
      registration: {
        id: registration.id,
        registration_id: registration.registration_id,
        order_id: registration.order_id,
        club: registration.club,
        zone: registration.zone,
        payment_attempts_zone: zone,
        recomputed_zone: computedZone,
        final_zone: finalZone
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
