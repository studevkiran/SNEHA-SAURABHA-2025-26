// api/send-whatsapp-confirmation.js
// Universal WhatsApp confirmation - supports Gupshup & Infobip

/**
 * Supports multiple WhatsApp providers:
 * 1. Gupshup (India, ₹0.25-0.35/msg) - Recommended for production
 * 2. Infobip (Global, trial mode)
 * 
 * Set WHATSAPP_PROVIDER=gupshup or infobip in environment variables
 */

export default async function handler(req, res) {
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
      registrationType,
      amount,
      mealPreference,
      clubName,
      receiptNo // optional: allow caller to specify a receipt number
    } = req.body;

    if (!name || !mobile || !registrationId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, mobile, or registrationId'
      });
    }

    // Choose provider
    const provider = process.env.WHATSAPP_PROVIDER || 'infobip';
    
    if (provider === 'gupshup') {
      return await sendViaGupshup(res, { name, mobile, email, registrationId, registrationType, amount, mealPreference, clubName });
    } else {
      // Call Infobip with all required data
      const result = await sendViaInfobip({
        name,
        mobile,
        email: email || 'Not Provided',
        registrationId,
        type: registrationType,
        amount: amount || 0,
        meal: mealPreference || 'Veg',
        club: clubName || 'Not specified',
        receiptNo: receiptNo || null
      });
      
      return res.status(200).json({
        success: true,
        message: 'WhatsApp sent via Infobip',
        provider: 'infobip',
        to: mobile,
        registrationId,
        infobipResponse: result
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send WhatsApp confirmation',
      error: error.message
    });
  }
}

// Gupshup Implementation
async function sendViaGupshup(res, data) {
  const { name, mobile, email, registrationId, registrationType, amount, mealPreference, clubName } = data;
  
  if (!process.env.GUPSHUP_API_KEY || !process.env.GUPSHUP_APP_NAME) {
    return res.status(200).json({ success: false, message: 'Gupshup not configured', disabled: true });
  }

  let phoneNumber = mobile.toString().replace(/\D/g, '');
  if (!phoneNumber.startsWith('91')) phoneNumber = '91' + phoneNumber;

  const templateParams = [
    name,
    registrationId,
    registrationType,
    `₹${amount?.toLocaleString('en-IN') || '0'}`,
    mealPreference || 'Veg',
    clubName || 'Not specified',
    mobile,
    email || 'Not provided'
  ];

  const payload = {
    channel: 'whatsapp',
    source: process.env.GUPSHUP_APP_NAME,
    destination: phoneNumber,
    'src.name': process.env.GUPSHUP_APP_NAME,
    message: JSON.stringify({
      id: process.env.GUPSHUP_TEMPLATE_ID || 'registration_confirmation',
      params: templateParams
    })
  };

  console.log('📱 Sending via Gupshup to:', phoneNumber);

  const response = await fetch('https://api.gupshup.io/wa/api/v1/template/msg', {
    method: 'POST',
    headers: {
      'apikey': process.env.GUPSHUP_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(payload)
  });

  const result = await response.json();
  console.log('📊 Gupshup Response:', JSON.stringify(result, null, 2));

  if (!response.ok || result.status === 'error') {
    throw new Error(result.message || 'Gupshup API error');
  }

  return res.status(200).json({
    success: true,
    message: 'WhatsApp sent via Gupshup',
    messageId: result.messageId,
    to: phoneNumber,
    provider: 'gupshup',
    gupshupResponse: result
  });
}

// Infobip Implementation (Template API for trial)
async function sendViaInfobip(registrationData) {
  const { name, mobile, email, registrationId, type, amount, meal, club, receiptNo: providedReceipt } = registrationData;

  console.log('📱 Infobip: Sending WhatsApp to', mobile);
  console.log('📋 Registration Data:', { name, registrationId, type, amount, meal, club });

  // Infobip WhatsApp Template API
  const infobipUrl = `https://${process.env.INFOBIP_BASE_URL}/whatsapp/1/message/template`;

  // Confirmation page URL: use short redirect URL (sneha2026.in/r.html?id=ANN04V6567)
  const baseUrl = process.env.SITE_BASE_URL || 'https://sneha2026.in';
  const confirmationLink = `${baseUrl}/r.html?id=${registrationId}`;

  // Receipt number: prefer caller-provided receiptNo, else fall back to full registrationId
  const receiptNo = providedReceipt || registrationId;

  // Format mobile number (ensure it starts with country code)
  let phoneNumber = mobile.toString().replace(/\D/g, '');
  if (!phoneNumber.startsWith('91')) {
    phoneNumber = '91' + phoneNumber;
  }

  console.log('📞 Formatted phone:', phoneNumber);
  console.log('🔗 Confirmation link:', confirmationLink);

  const messageData = {
    messages: [
      {
        from: process.env.INFOBIP_WHATSAPP_NUMBER,
        to: phoneNumber,
        messageId: `reg-${registrationId}-${Date.now()}`,
        content: {
          templateName: 'registration_confirmation_v2', // Approved v2 template
          templateData: {
            header: {
              type: 'IMAGE',
              // NEW IMAGE: Testing v3 header with v2 template
              mediaUrl: process.env.EVENT_LOGO_URL || 'https://res.cloudinary.com/dnai1dz03/image/upload/v1763028752/WhatsApp_Image_2025-11-13_at_09.00.02_ny0cn9.jpg'
            },
            body: {
              placeholders: [
                name,                    // {{1}} Name (greeting)
                registrationId,          // {{2}} Registration No.
                receiptNo,               // {{3}} Receipt No. (Cashfree transaction ID)
                name,                    // {{4}} Name (in details)
                phoneNumber,             // {{5}} Mobile
                email || 'Not Provided', // {{6}} Email
                meal || 'Veg',           // {{7}} Food Preference
                amount.toLocaleString('en-IN'), // {{8}} Amount (formatted)
                confirmationLink         // {{9}} Short confirmation link
              ]
            }
          },
          language: 'en'
        }
      }
    ]
  };  console.log('📤 Sending to Infobip:', JSON.stringify(messageData, null, 2));

  const response = await fetch(infobipUrl, {
    method: 'POST',
    headers: {
      'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(messageData)
  });

  const result = await response.json();
  
  console.log('📥 Infobip Response Status:', response.status);
  console.log('📥 Infobip Response:', JSON.stringify(result, null, 2));

  if (!response.ok) {
    console.error('❌ Infobip API error:', result);
    throw new Error(`Infobip API error: ${JSON.stringify(result)}`);
  }

  console.log('✅ WhatsApp message sent successfully via Infobip');
  return result;
}
