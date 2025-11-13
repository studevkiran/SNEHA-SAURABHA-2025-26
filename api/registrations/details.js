/**
 * API: Get Registration Details by Registration ID
 * Endpoint: /api/registrations/details?id=ROT01V1234
 */

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Registration ID is required' });
  }

  try {
    // Fetch registration from database
    const result = await sql`
      SELECT 
        registration_id,
        name,
        mobile,
        email,
        club,
        registration_type,
        meal_preference,
        amount,
        transaction_id,
        payment_status,
        created_at
      FROM registrations 
      WHERE registration_id = ${id}
      AND payment_status = 'SUCCESS'
    `;

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const registration = result.rows[0];

    // Return registration details
    res.status(200).json({
      registration_id: registration.registration_id,
      name: registration.name,
      mobile: registration.mobile,
      email: registration.email,
      club: registration.club,
      registration_type: registration.registration_type,
      meal_preference: registration.meal_preference,
      amount: parseFloat(registration.amount),
      transaction_id: registration.transaction_id,
      payment_status: registration.payment_status,
      created_at: registration.created_at
    });

  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ 
      error: 'Failed to fetch registration details',
      details: error.message 
    });
  }
}
