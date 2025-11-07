// api/send-whatsapp-confirmation.js
// Serverless function to send WhatsApp confirmation after successful payment

/**
 * This function sends a WhatsApp confirmation message using Twilio
 * Call this after payment verification is successful
 * 
 * Required Environment Variables:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_WHATSAPP_NUMBER (format: whatsapp:+14155238886)
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const {
      name,
      mobile,
      email,
      registrationId,
      receiptNo,
      registrationType,
      amount,
      mealPreference
    } = req.body;

    // Validate required fields
    if (!name || !mobile || !registrationId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, mobile, or registrationId'
      });
    }

    // Initialize Twilio client
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Format phone number (ensure it has country code)
    const toNumber = mobile.startsWith('+') ? mobile : `+91${mobile}`;

    // Construct WhatsApp message
    const messageBody = `Hi ${name},

🎯 Thank you for registering to SNEHA SAURABHA 2025-26, District Conference
happening at Silent Shores, Mysore on 30th & 31st January & 01st February 2026

We're thrilled to have you on board for this district event that celebrates knowledge, friendship and fellowship.

📋 Registration Details:

✒️Registration No.: ${registrationId}
📄Receipt No.: ${receiptNo || registrationId}
👤 Name: ${name}
📞 Mobile: ${mobile}
📧 Email: ${email}
🍽️ Food Preference: ${mealPreference}

✅ Amount Paid: ₹${amount.toLocaleString('en-IN')}

Looking forward to an inspiring experience together!

Warm regards,
Team Sneha Saurabha 2025-26 – Rotary District Conference 3181`;

    // Send WhatsApp message
    const message = await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${toNumber}`
    });

    console.log('✅ WhatsApp message sent successfully:', message.sid);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'WhatsApp confirmation sent successfully',
      messageSid: message.sid,
      status: message.status
    });

  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to send WhatsApp confirmation',
      error: error.message
    });
  }
}
