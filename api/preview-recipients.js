// api/preview-recipients.js
// Preview registrations before sending WhatsApp confirmations

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const {
      mode,
      registrationIds,
      filters
    } = req.body;

    const sql = neon(process.env.DATABASE_URL);
    
    let query;
    let params = [];
    
    switch (mode) {
      case 'single':
        if (!registrationIds || registrationIds.length !== 1) {
          return res.status(400).json({ success: false, message: 'Single mode requires exactly one registration ID' });
        }
        query = `
          SELECT registration_id, name, mobile, email, registration_type, 
                 registration_amount, meal_preference, tshirt_size, club
          FROM registrations 
          WHERE registration_id = $1 AND mobile IS NOT NULL AND mobile != ''
        `;
        params = [registrationIds[0]];
        break;

      case 'selected':
        if (!registrationIds || registrationIds.length === 0) {
          return res.status(400).json({ success: false, message: 'Selected mode requires registration IDs' });
        }
        query = `
          SELECT registration_id, name, mobile, email, registration_type, 
                 registration_amount, meal_preference, tshirt_size, club
          FROM registrations 
          WHERE registration_id = ANY($1) AND mobile IS NOT NULL AND mobile != ''
        `;
        params = [registrationIds];
        break;

      case 'sponsors':
        query = `
          SELECT registration_id, name, mobile, email, registration_type, 
                 registration_amount, meal_preference, tshirt_size, club
          FROM registrations 
          WHERE registration_type LIKE '%Sponsor%' 
            AND mobile IS NOT NULL AND mobile != ''
          ORDER BY registration_amount DESC
        `;
        break;

      case 'all':
        let whereConditions = ['mobile IS NOT NULL', "mobile != ''"];
        let paramIndex = 1;

        if (filters?.type) {
          whereConditions.push(`registration_type = $${paramIndex}`);
          params.push(filters.type);
          paramIndex++;
        }

        if (filters?.club) {
          whereConditions.push(`club = $${paramIndex}`);
          params.push(filters.club);
          paramIndex++;
        }

        if (filters?.minAmount) {
          whereConditions.push(`registration_amount >= $${paramIndex}`);
          params.push(filters.minAmount);
          paramIndex++;
        }

        query = `
          SELECT registration_id, name, mobile, email, registration_type, 
                 registration_amount, meal_preference, tshirt_size, club
          FROM registrations 
          WHERE ${whereConditions.join(' AND ')}
          ORDER BY registration_date DESC
          LIMIT 100
        `;
        break;

      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid mode' 
        });
    }

    const recipients = await sql(query, params);

    return res.status(200).json({
      success: true,
      recipients,
      count: recipients.length
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to preview recipients',
      error: error.message
    });
  }
}
