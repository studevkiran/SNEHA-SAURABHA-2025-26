// Test WhatsApp sending directly
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { adminPassword, mobile, name } = req.body;
    
    if (adminPassword !== 'admin123') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('📱 Testing WhatsApp send to:', mobile);
    
    // Format phone number
    let phoneNumber = mobile.toString().replace(/\D/g, '');
    if (!phoneNumber.startsWith('91')) {
      phoneNumber = '91' + phoneNumber;
    }

    const messageData = {
      messages: [{
        from: process.env.INFOBIP_WHATSAPP_NUMBER || '917892045223',
        to: phoneNumber,
        messageId: `test-${Date.now()}`,
        content: {
          templateName: 'registration_confirmation_v4',
          templateData: {
            header: {
              type: 'IMAGE',
              mediaUrl: 'https://res.cloudinary.com/dnai1dz03/image/upload/v1763028752/WhatsApp_Image_2025-11-13_at_09.00.02_ny0cn9.jpg'
            },
            body: {
              placeholders: [
                name || 'Test User',
                name || 'Test User',
                phoneNumber,
                'test@example.com',
                'Test Registration',
                'Veg',
                'XL',
                '5,000',
                'https://sneha2026.in'
              ]
            }
          },
          language: 'en'
        }
      }]
    };

    console.log('📤 Sending test WhatsApp...');
    console.log('📋 Template: registration_confirmation_v4');
    console.log('📋 To:', phoneNumber);
    console.log('📋 API Key:', process.env.INFOBIP_API_KEY ? 'SET' : 'NOT SET');
    console.log('📋 Base URL:', process.env.INFOBIP_BASE_URL || 'NOT SET');

    const whatsappResponse = await fetch(`https://${process.env.INFOBIP_BASE_URL}/whatsapp/1/message/template`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(messageData)
    });

    const whatsappResult = await whatsappResponse.json();

    console.log('📥 Infobip Response Status:', whatsappResponse.status);
    console.log('📥 Infobip Response:', JSON.stringify(whatsappResult, null, 2));

    return res.status(200).json({
      success: whatsappResponse.ok,
      status: whatsappResponse.status,
      response: whatsappResult,
      debug: {
        apiKeySet: !!process.env.INFOBIP_API_KEY,
        baseUrl: process.env.INFOBIP_BASE_URL,
        whatsappNumber: process.env.INFOBIP_WHATSAPP_NUMBER,
        phoneNumber: phoneNumber,
        templateName: 'registration_confirmation_v4'
      }
    });

  } catch (error) {
    console.error('❌ Test WhatsApp error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};
