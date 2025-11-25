// api/send-whatsapp-confirmation.js
// Universal WhatsApp confirmation - supports Gupshup & Infobip

/**
 * Supports multiple WhatsApp providers:
 * 1. Gupshup (India, ₹0.25-0.35/msg) - Recommended for production
 * 2. Infobip (Global, trial mode)
 * 
 * Set WHATSAPP_PROVIDER=gupshup or infobip in environment variables
 */

module.exports = async function handler(req, res) {
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
      tshirtSize,
      clubName,
      orderId, // The actual order_id (Cashfree order OR UTR number)
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
      return await sendViaGupshup(res, { name, mobile, email, registrationId, registrationType, amount, mealPreference, tshirtSize, clubName });
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
        tshirtSize: tshirtSize || 'N/A',
        club: clubName || 'Not specified',
        orderId: orderId || registrationId, // Use orderId (UTR/Cashfree), fallback to registrationId
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
  const { name, mobile, email, registrationId, registrationType, amount, mealPreference, tshirtSize, clubName } = data;
  
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

// Rate limiter to prevent frequency capping
const rateLimiter = {
  lastSentTime: 0,
  minDelay: 2000, // 2 seconds between messages (30 msgs/min max)
  
  async wait() {
    const now = Date.now();
    const timeSinceLastSent = now - this.lastSentTime;
    
    if (timeSinceLastSent < this.minDelay) {
      const waitTime = this.minDelay - timeSinceLastSent;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms before sending...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastSentTime = Date.now();
  }
};

// Infobip Implementation (Template API for trial)
async function sendViaInfobip(registrationData) {
  const { name, mobile, email, registrationId, type, amount, meal, tshirtSize, club, orderId, receiptNo: providedReceipt } = registrationData;

  console.log('📱 Infobip: Sending WhatsApp to', mobile);
  console.log('📋 Registration Data:', { name, registrationId, type, amount, meal, tshirtSize, club, orderId });
  
  // Apply rate limiting
  await rateLimiter.wait();

  // Infobip WhatsApp Template API
  const infobipUrl = `https://${process.env.INFOBIP_BASE_URL}/whatsapp/1/message/template`;

  // Use custom domain instead of Vercel URL for accessibility
  const baseUrl = 'https://sneha2026.in';
  // Use orderId (UTR or Cashfree order_id) for receipt page link
  const confirmationLink = `${baseUrl}/index.html?payment=success&order_id=${orderId || registrationId}`;

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
          templateName: 'registration_confirmation_v4',
          templateData: {
            header: {
              type: 'IMAGE',
              mediaUrl: process.env.EVENT_LOGO_URL || 'https://res.cloudinary.com/dnai1dz03/image/upload/v1763028752/WhatsApp_Image_2025-11-13_at_09.00.02_ny0cn9.jpg'
            },
            body: {
              placeholders: [
                name,                             // {{1}} Name (Hi {{1}})
                name,                             // {{2}} Name (👤 Name: {{2}})
                mobile,                           // {{3}} Mobile
                email || 'Not Provided',          // {{4}} Email
                type || 'Participant',            // {{5}} Registration Category
                meal || 'Veg',                    // {{6}} Food Preference
                tshirtSize || 'N/A',              // {{7}} T-Shirt Size
                `${amount.toLocaleString('en-IN')}`, // {{8}} Amount (template has ₹ symbol)
                confirmationLink                  // {{9}} View complete details link
              ]
            }
          },
          language: 'en'
        }
      }
    ]
  };  console.log('📤 Sending to Infobip:', JSON.stringify(messageData, null, 2));

  // Retry logic with exponential backoff
  let lastError;
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
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

      // Check for rate limit error (429 or error code 7032)
      if (response.status === 429 || 
          (result.messages && result.messages[0]?.status?.groupName === 'UNDELIVERABLE' && 
           result.messages[0]?.status?.description?.includes('7032'))) {
        
        const retryAfter = response.headers.get('Retry-After') || (attempt * 5); // exponential backoff
        console.log(`⚠️ Rate limit hit (attempt ${attempt}/${maxRetries}). Waiting ${retryAfter}s...`);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue; // Retry
        } else {
          throw new Error(`Rate limit exceeded after ${maxRetries} attempts. Please try again later.`);
        }
      }

      if (!response.ok) {
        console.error('❌ Infobip API error:', result);
        throw new Error(`Infobip API error: ${JSON.stringify(result)}`);
      }

      console.log('✅ WhatsApp message sent successfully via Infobip');
      return result;
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const backoffTime = attempt * 3; // 3s, 6s, 9s
        console.log(`⏳ Retrying in ${backoffTime}s...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime * 1000));
      }
    }
  }
  
  // All retries failed
  throw lastError || new Error('Failed to send WhatsApp after all retries');
}
