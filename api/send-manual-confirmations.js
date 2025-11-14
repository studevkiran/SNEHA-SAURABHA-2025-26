// api/send-manual-confirmations.js
// Combined API: Preview + Send WhatsApp confirmations
// POST /api/send-manual-confirmations?action=preview (default: send)
// Use this for 680 imported records or bulk resends

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { action = 'send' } = req.query;
    const {
      mode,           // 'single', 'selected', 'all', 'sponsors'
      registrationIds, // array of registration IDs (for 'selected' mode)
      filters         // optional filters { type, club, minAmount }
    } = req.body;

    if (!mode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: mode (single, selected, all, sponsors)'
      });
    }

    const sql = neon(process.env.DATABASE_URL);
    
    // Build query based on mode
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
        // Send to all sponsors (Silver, Gold, Platinum, Patron)
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
        // Send to all with filters (if provided)
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
        `;
        break;

      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid mode. Use: single, selected, all, or sponsors' 
        });
    }

    console.log('📊 Query:', query);
    console.log('📊 Params:', params);

    // Fetch registrations
    const registrations = await sql(query, params);

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No registrations found matching criteria (or all missing mobile numbers)'
      });
    }

    console.log(`📱 Found ${registrations.length} registrations to send WhatsApp`);

    // Send WhatsApp to each registration
    const results = {
      total: registrations.length,
      sent: 0,
      failed: 0,
      errors: []
    };

    // Get base URL for API calls
    const baseUrl = process.env.SITE_BASE_URL || 'https://sneha2026.in';

    for (const reg of registrations) {
      try {
        // Call the existing send-whatsapp-confirmation API
        const response = await fetch(`${baseUrl}/api/send-whatsapp-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: reg.name,
            mobile: reg.mobile,
            email: reg.email || 'Not Provided',
            registrationId: reg.registration_id,
            registrationType: reg.registration_type,
            amount: reg.registration_amount,
            mealPreference: reg.meal_preference || 'Veg',
            clubName: reg.club,
            receiptNo: reg.registration_id // Use registration ID as receipt for manual entries
          })
        });

        const result = await response.json();

        if (result.success) {
          results.sent++;
          console.log(`✅ Sent to ${reg.name} (${reg.mobile})`);
        } else {
          results.failed++;
          results.errors.push({
            registrationId: reg.registration_id,
            name: reg.name,
            mobile: reg.mobile,
            error: result.message || 'Unknown error'
          });
          console.log(`❌ Failed to send to ${reg.name}: ${result.message}`);
        }

        // Rate limiting: Wait 100ms between messages
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        results.failed++;
        results.errors.push({
          registrationId: reg.registration_id,
          name: reg.name,
          mobile: reg.mobile,
          error: error.message
        });
        console.error(`❌ Error sending to ${reg.name}:`, error);
      }
    }

    // Save send log to database (optional)
    try {
      await sql`
        INSERT INTO whatsapp_send_log (
          mode, total_count, sent_count, failed_count, 
          filters, errors, sent_at
        ) VALUES (
          ${mode}, ${results.total}, ${results.sent}, ${results.failed},
          ${JSON.stringify(filters || {})}, ${JSON.stringify(results.errors)},
          NOW()
        )
      `;
    } catch (logError) {
      console.error('Failed to save send log:', logError);
      // Don't fail the whole operation if logging fails
    }

    return res.status(200).json({
      success: true,
      message: `WhatsApp confirmations sent: ${results.sent}/${results.total}`,
      results
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send WhatsApp confirmations',
      error: error.message
    });
  }
}
