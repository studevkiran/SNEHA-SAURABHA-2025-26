// api/admin/send-batch-whatsapp.js
// Send WhatsApp confirmations in batches with rate limiting

const Airtable = require('airtable');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { date, batchSize = 10, delayBetweenBatches = 30000 } = req.body; // 30s between batches

    // Connect to Airtable
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const table = base(process.env.AIRTABLE_TABLE_NAME || 'registrations');

    // Build filter formula
    let filterFormula = `{Payment Status} = 'SUCCESS'`;
    if (date) {
      // Filter by specific date
      filterFormula = `AND(${filterFormula}, IS_SAME({Registration Date}, '${date}', 'day'))`;
    }

    console.log('📊 Fetching registrations with filter:', filterFormula);

    // Fetch all successful registrations
    const records = await table.select({
      filterByFormula: filterFormula,
      sort: [{ field: 'Registration Date', direction: 'desc' }]
    }).all();

    console.log(`📋 Found ${records.length} registrations to process`);

    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No registrations found to send WhatsApp',
        sent: 0,
        failed: 0
      });
    }

    // Process in batches
    const results = {
      total: records.length,
      sent: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(records.length / batchSize);

      console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} messages)`);

      // Send all messages in this batch (with internal rate limiting)
      const batchPromises = batch.map(async (record) => {
        try {
          const fields = record.fields;
          const registrationId = fields['Registration ID'];
          const mobile = fields['Mobile']?.toString().replace(/\D/g, '');

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
              name: fields['Name'],
              mobile: mobile,
              email: fields['Email'] || 'Not Provided',
              registrationId: registrationId,
              registrationType: fields['Registration Type'],
              amount: parseFloat(fields['Amount']?.toString().replace(/[₹,]/g, '') || 0),
              mealPreference: fields['Meal Preference'],
              tshirtSize: fields['T-Shirt Size'],
              clubName: fields['Club Name'],
              orderId: fields['Order ID'] || registrationId
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
          console.error(`❌ Error sending to ${record.fields['Registration ID']}:`, error.message);
          results.failed++;
          results.errors.push({ 
            id: record.fields['Registration ID'], 
            error: error.message 
          });
        }
      });

      // Wait for current batch to complete
      await Promise.all(batchPromises);

      // Wait between batches (except for last batch)
      if (i + batchSize < records.length) {
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
