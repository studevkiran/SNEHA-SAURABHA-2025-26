// lib/whatsapp.js
// Shared WhatsApp logic for Infobip (and potentially Gupshup)

const axios = require('axios');
// Use shared DB connection to avoid connection limits and circular deps
// We use lazy requiring or try-catch to avoid issues if db-neon is not available
let dbQuery;
try {
    const db = require('./db-neon');
    dbQuery = db.query;
} catch (e) {
    console.warn('⚠️ db-neon not found, logging will be disabled in whatsapp.js');
}

async function logToDb(source, level, message, data = {}) {
    if (!dbQuery) return;
    try {
        await dbQuery(
            'INSERT INTO system_logs (source, level, message, data) VALUES ($1, $2, $3, $4)',
            [source, level, message, JSON.stringify(data)]
        );
    } catch (err) {
        console.error('❌ Failed to write to system_logs:', err.message);
    }
}

// Rate limiter to prevent frequency capping
const rateLimiter = {
    lastSent: 0,
    minInterval: 1000, // 1 second between messages
    async wait() {
        const now = Date.now();
        const timeSinceLast = now - this.lastSent;
        if (timeSinceLast < this.minInterval) {
            const waitTime = this.minInterval - timeSinceLast;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        this.lastSent = Date.now();
    }
};

const INFOBIP_BASE_URL = process.env.INFOBIP_BASE_URL;
const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY;
const SENDER_NUMBER = '917892045223'; // Fixed sender number

if (!INFOBIP_BASE_URL || !INFOBIP_API_KEY) {
    const msg = '❌ CRITICAL: Missing Infobip environment variables!';
    console.error(msg);
    logToDb('whatsapp-lib', 'CRITICAL', msg, { env: process.env.NODE_ENV });
}

async function sendWhatsApp(data) {
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
        orderId,
        receiptNo
    } = data;

    console.log('📱 Lib: Sending WhatsApp to', mobile);
    await logToDb('whatsapp-lib', 'INFO', `Attempting to send to ${mobile}`, { registrationId, orderId });

    await rateLimiter.wait();

    // Format mobile number (ensure 91 prefix)
    let phoneNumber = mobile.toString().replace(/\D/g, '');
    if (phoneNumber.length === 10) {
        phoneNumber = '91' + phoneNumber;
    }

    // Construct confirmation link
    const baseUrl = 'https://sneha2026.in';
    const linkId = orderId || registrationId;
    const confirmationLink = `${baseUrl}/index.html?payment=success&order_id=${linkId}`;

    // Prepare payload
    const payload = {
        messages: [
            {
                from: SENDER_NUMBER,
                to: phoneNumber,
                messageId: `reg-${registrationId}-${Date.now()}`,
                content: {
                    templateName: "registration_confirmation_v4",
                    templateData: {
                        header: {
                            type: "IMAGE",
                            mediaUrl: "https://res.cloudinary.com/dnai1dz03/image/upload/v1763028752/WhatsApp_Image_2025-11-13_at_09.00.02_ny0cn9.jpg"
                        },
                        body: {
                            placeholders: [
                                name || 'Rotarian',
                                name || 'Rotarian',
                                phoneNumber,
                                email || 'Not Provided',
                                registrationType || 'Delegate',
                                mealPreference || 'Veg',
                                tshirtSize || 'L',
                                amount ? amount.toString() : '0',
                                confirmationLink
                            ]
                        }
                    },
                    language: "en"
                }
            }
        ]
    };

    console.log(`📤 Sending to Infobip:`, JSON.stringify(payload, null, 2));

    // Retry logic
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios.post(
                `https://${INFOBIP_BASE_URL}/whatsapp/1/message/template`,
                payload,
                {
                    headers: {
                        'Authorization': `App ${INFOBIP_API_KEY}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 10000 // 10s timeout
                }
            );

            console.log(`📥 Infobip Response (Attempt ${attempt}):`, response.status);

            if (response.status === 200 || response.status === 201) {
                console.log('✅ WhatsApp sent successfully via Infobip');
                await logToDb('whatsapp-lib', 'SUCCESS', `Sent to ${phoneNumber}`, { status: response.status, data: response.data });
                return { success: true, result: response.data };
            } else {
                throw new Error(`Infobip status: ${response.status}`);
            }

        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed:`, error.message);
            await logToDb('whatsapp-lib', 'ERROR', `Attempt ${attempt} failed`, { error: error.message, stack: error.stack });

            if (error.response) {
                console.error('   Response data:', error.response.data);
            }

            if (attempt === maxRetries) {
                console.error('❌ All attempts failed.');
                await logToDb('whatsapp-lib', 'ERROR', 'All attempts failed', { mobile: phoneNumber });
                return { success: false, error: error.message };
            }

            // Exponential backoff
            await new Promise(r => setTimeout(r, attempt * 1000));
        }
    }
}

module.exports = { sendWhatsApp };
