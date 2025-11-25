// api/admin/send-batch-whatsapp.js
// Send WhatsApp confirmations in batches with rate limiting

const { query } = require('../../lib/db-neon');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { date, batchSize = 10, delayBetweenBatches = 30000 } = req.body;

    // Build SQL query
    let sqlQuery = `SELECT * FROM registrations WHERE payment_status IN ('SUCCESS', 'PAID', 'Manual', 'MANUAL-S', 'MANUAL-B', 'MANUAL-P', 'Imported', 'TEST')`;
    const params = [];
    
    if (date) {
      sqlQuery += ` AND DATE(created_at) = $1`;
      params.push(date);
    }
    
    sqlQuery += ` ORDER BY created_at DESC`;

    console.log('📊 Fetching registrations with query:', sqlQuery, params);

    const result = await query(sqlQuery, params);
    const registrations = result.rows;

    console.log(`📋 Found ${registrations.length} registrations to process`);

    if (registrations.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No registrations found to send WhatsApp',
        sent: 0,
        failed: 0
      });
    }

    // Process in batches
    const results = {
      total: registrations.length,
      sent: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < registrations.length; i += batchSize) {
      const batch = registrations.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(registrations.length / batchSize);

      console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} messages)`);

      // Send all messages in this batch (with internal rate limiting)
      const batchPromises = batch.map(async (registration) => {
        try {
          const registrationId = registration.registration_id;
          const mobile = registration.mobile?.toString().replace(/\D/g, '');

          if (!mobile || mobile.length < 10) {
            console.log(`⚠️ Skipping ${registrationId} - invalid mobile`);
            results.failed++;
            results.errors.push({ id: registrationId, error: 'Invalid mobile number' });
            return;
          }

          // Call WhatsApp API
          const whatsappResponse = await fetch('https://sneha2026.in/api/send-whatsapp-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: registration.name,
              mobile: mobile,
              email: registration.email || 'Not Provided',
              registrationId: registrationId,
              registrationType: registration.registration_type,
              amount: parseFloat(registration.amount || registration.registration_amount || 0),
              mealPreference: registration.meal_preference,
              tshirtSize: registration.tshirt_size,
              clubName: registration.club_name || registration.club,
              orderId: registration.order_id || registrationId
            })
          });

          const result = await whatsappResponse.json();

          if (result.success) {
            console.log(`✅ Sent to ${registrationId} (${mobile})`);
            results.sent++;
          } else {
            console.log(`❌ Failed ${registrationId}:`, result.message);
            results.failed++;
            results.errors.push({ 
              id: registrationId, 
              mobile: mobile,
              error: result.message 
            });
          }

          // Small delay between individual messages (additional to internal rate limiting)
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2s between each

        } catch (error) {
          console.error(`❌ Error sending to ${registration.registration_id}:`, error.message);
          results.failed++;
          results.errors.push({ 
            id: registration.registration_id, 
            error: error.message 
          });
        }
      });

      // Wait for current batch to complete
      await Promise.all(batchPromises);

      // Wait between batches (except for last batch)
      if (i + batchSize < registrations.length) {
        const waitTime = Math.floor(delayBetweenBatches / 1000);
        console.log(`\n⏳ Waiting ${waitTime}s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    console.log('\n✅ Batch processing complete');
    console.log(`📊 Results: ${results.sent} sent, ${results.failed} failed out of ${results.total} total`);

    return res.status(200).json({
      success: true,
      message: 'Batch WhatsApp sending complete',
      ...results
    });

  } catch (error) {
    console.error('❌ Batch sending error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send batch WhatsApp',
      error: error.message
    });
  }
}
