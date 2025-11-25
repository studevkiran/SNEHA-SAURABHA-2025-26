// API to resend WhatsApp confirmation
import Airtable from 'airtable';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { registration_id, order_id } = req.body;

    if (!registration_id && !order_id) {
      return res.status(400).json({
        success: false,
        error: 'Either registration_id or order_id is required'
      });
    }

    console.log('📲 Resending WhatsApp for:', { registration_id, order_id });

    // Connect to Airtable
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const table = base(process.env.AIRTABLE_TABLE_NAME || 'registrations');

    // Fetch registration details
    let registrationRecord;
    let filterFormula;

    if (registration_id) {
      filterFormula = `{Registration ID} = '${registration_id}'`;
    } else {
      filterFormula = `{Order ID} = '${order_id}'`;
    }

    const records = await table.select({
      filterByFormula: filterFormula,
      maxRecords: 1
    }).firstPage();

    if (!records || records.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    registrationRecord = records[0];
    const fields = registrationRecord.fields;

    // Check if payment is completed (handle various statuses - case insensitive)
    const paymentStatus = (fields['Payment Status'] || '').toUpperCase();
    const validStatuses = [
      'SUCCESS',      // Webhook/API created
      'PAID',         // Alternative success status
      'MANUAL',       // Generic manual
      'MANUAL-S',     // Manual - Sneha (mallige2830)
      'MANUAL-B',     // Manual - Bangalore (asha1990)
      'MANUAL-P',     // Manual - Prahlad (prahlad1966)
      'IMPORTED',     // Imported from Excel
      'TEST'          // Test entries
    ];
    
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        error: `Cannot resend WhatsApp for payment status: ${fields['Payment Status']}. Only completed payments can receive WhatsApp confirmation.`
      });
    }
    
    console.log('✅ Payment status check passed:', fields['Payment Status']);

    // Call the send-whatsapp-confirmation API internally
    const whatsappPayload = {
      name: fields['Name'],
      mobile: fields['Mobile']?.toString().replace(/\D/g, ''),
      email: fields['Email'] || 'Not Provided',
      registrationId: fields['Registration ID'],
      registrationType: fields['Registration Type'],
      amount: parseFloat(fields['Amount']?.toString().replace(/[₹,]/g, '') || 0),
      mealPreference: fields['Meal Preference'],
      tshirtSize: fields['T-Shirt Size'],
      clubName: fields['Club Name'],
      orderId: fields['Order ID']
    };

    console.log('📤 Calling WhatsApp API with payload:', whatsappPayload);

    // Call WhatsApp API using fetch
    const whatsappResponse = await fetch('https://sneha2026.in/api/send-whatsapp-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(whatsappPayload)
    });

    const whatsappResult = await whatsappResponse.json();

    if (whatsappResponse.ok && whatsappResult.success) {
      console.log('✅ WhatsApp sent successfully to:', whatsappPayload.mobile);
      
      return res.status(200).json({
        success: true,
        message: 'WhatsApp confirmation sent successfully',
        registration_id: fields['Registration ID'],
        mobile: whatsappPayload.mobile
      });
    } else {
      console.error('❌ WhatsApp sending failed:', whatsappResult);
      return res.status(500).json({
        success: false,
        error: whatsappResult.message || 'Failed to send WhatsApp'
      });
    }

  } catch (error) {
    console.error('❌ Error resending WhatsApp:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to resend WhatsApp'
    });
  }
}
