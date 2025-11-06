// api/send-whatsapp-confirmation.js
// WhatsApp Confirmation Message Sender for SNEHA SAURABHA 2025-26

const twilio = require('twilio');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { 
      mobile, 
      name,
      email,
      registrationId,     // e.g., SS0001
      receiptNumber,      // e.g., 0001
      foodPreference,     // Veg/Non-veg
      amount 
    } = req.body;

    // Validate required fields
    if (!mobile || !name || !registrationId || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: mobile, name, registrationId, amount' 
      });
    }

    // Format mobile number for WhatsApp (must include country code)
    const formattedMobile = mobile.startsWith('+91') 
      ? `whatsapp:${mobile}` 
      : `whatsapp:+91${mobile}`;

    // Initialize Twilio client
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Get first name for personalized greeting
    const firstName = name.split(' ')[0];

    // Send WhatsApp message using client-approved template
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: formattedMobile,
      body: `Hi ${firstName},

🎯 Thank you for registering to SNEHA SAURABHA 2025-26, District Conference
happening at Silent Shores, Mysore on 30th & 31st January & 01st February 2026

We're thrilled to have you on board for this district event that celebrates knowledge, friendship and fellowship.

📋 Registration Details:

✒️ Registration No.: ${registrationId}
📄 Receipt No.: ${receiptNumber || registrationId.replace('SS', '')}
👤 Name: ${name}
📞 Mobile: ${mobile}
📧 Email: ${email || 'Not provided'}
🍽️ Food Preference: ${foodPreference}

✅ Amount Paid: ₹ ${amount.toLocaleString('en-IN')}

Looking forward to an inspiring experience together!

Warm regards,
Team Sneha Saurabha 2025-26 – Rotary District Conference 3181`
    });

    console.log('✅ WhatsApp message sent:', message.sid);
    console.log('📱 Sent to:', formattedMobile);
    console.log('👤 Name:', name);
    console.log('📋 Registration ID:', registrationId);

    return res.status(200).json({
      success: true,
      messageSid: message.sid,
      message: 'WhatsApp confirmation sent successfully',
      sentTo: mobile
    });

  } catch (error) {
    console.error('❌ WhatsApp send error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status
    });
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send WhatsApp message',
      errorCode: error.code
    });
  }
}
