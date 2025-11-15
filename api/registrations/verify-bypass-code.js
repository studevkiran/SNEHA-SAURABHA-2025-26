const { neon } = require('@neondatabase/serverless');

const BYPASS_CODES = {
    'mallige2830': 'manual-S',
    'asha1990': 'manual-B',
    'prahlad1966': 'manual-P'
};

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { code, utr, registrationData } = req.body;

        // Validate code
        if (!code || !BYPASS_CODES[code]) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid bypass code' 
            });
        }

        // Validate UTR
        if (!utr || utr.length < 4) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid UTR number' 
            });
        }

        // Validate registration data
        if (!registrationData || !registrationData.fullName || !registrationData.mobile) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid registration data' 
            });
        }

        // Get payment status from code
        const paymentStatus = BYPASS_CODES[code];

        // Connect to database
        const sql = neon(process.env.DATABASE_URL);

        // Generate registration ID
        const countResult = await sql`SELECT COUNT(*) as count FROM registrations`;
        const nextNumber = parseInt(countResult[0].count) + 1;
        const registrationId = `2026RTY${String(nextNumber).padStart(4, '0')}`;

        // Prepare registration data
        const regData = {
            registration_id: registrationId,
            name: registrationData.fullName,
            mobile: registrationData.mobile,
            email: registrationData.email || null,
            club: registrationData.clubName || null,
            registration_type: registrationData.typeName,
            registration_amount: registrationData.price,
            meal_preference: registrationData.mealPreference || 'Veg',
            tshirt_size: registrationData.tshirtSize || null,
            payment_status: paymentStatus, // manual-S, manual-B, or manual-P
            order_id: utr, // Store UTR in order_id field
            cashfree_order_id: null,
            transaction_id: null,
            payment_method: 'Manual Registration',
            payment_time: new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        // Insert registration
        const insertResult = await sql`
            INSERT INTO registrations (
                registration_id, name, mobile, email, club, 
                registration_type, registration_amount, meal_preference, tshirt_size,
                payment_status, order_id, cashfree_order_id, transaction_id,
                payment_method, payment_time, created_at
            ) VALUES (
                ${regData.registration_id}, ${regData.name}, ${regData.mobile}, 
                ${regData.email}, ${regData.club}, ${regData.registration_type}, 
                ${regData.registration_amount}, ${regData.meal_preference}, ${regData.tshirt_size},
                ${regData.payment_status}, ${regData.order_id}, ${regData.cashfree_order_id}, 
                ${regData.transaction_id}, ${regData.payment_method}, ${regData.payment_time}, 
                ${regData.created_at}
            )
            RETURNING *
        `;

        const registration = insertResult[0];

        // Send WhatsApp confirmation (async, don't wait)
        try {
            await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/send-whatsapp-confirmation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registrationId: registration.registration_id })
            });
        } catch (whatsappError) {
            console.error('WhatsApp error:', whatsappError);
            // Don't fail registration if WhatsApp fails
        }

        return res.status(200).json({
            success: true,
            paymentStatus: paymentStatus,
            message: 'Manual registration completed successfully',
            registration: {
                registration_id: registration.registration_id,
                name: registration.name,
                mobile: registration.mobile,
                email: registration.email,
                club: registration.club,
                registration_type: registration.registration_type,
                registration_amount: registration.registration_amount,
                meal_preference: registration.meal_preference,
                payment_status: registration.payment_status,
                utr_number: utr
            }
        });

    } catch (error) {
        console.error('Bypass code error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error processing request',
            error: error.message 
        });
    }
};
