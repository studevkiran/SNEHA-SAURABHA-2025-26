// ADD THIS TO scripts/app.js - Replace the initiateInstamojoPayment function

//======================================================================
// CASHFREE PAYMENT INTEGRATION
//======================================================================

// Generate unique order ID
function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORDER_${timestamp}_${random}`;
}

// Initiate Cashfree payment
async function initiateCashfreePayment() {
    console.log('🚀 Payment button clicked!');
    console.log('📋 Registration data:', registrationData);
    
    try {
        // Show loading state
        const payBtn = event.target;
        const originalText = payBtn.innerHTML;
        payBtn.disabled = true;
        payBtn.innerHTML = '⏳ Creating Payment Order...';
        
        console.log('💳 Starting Cashfree payment process...');
        
        // Generate unique order ID
        const orderId = generateOrderId();
        
        // Store order ID in registration data
        registrationData.orderId = orderId;
        
        // Prepare registration data for Cashfree
        const paymentData = {
            confirmationId: registrationData.confirmationId,
            orderId: orderId,
            amount: registrationData.price,
            fullName: registrationData.fullName,
            mobile: registrationData.mobile,
            email: registrationData.email,
            registrationType: registrationData.typeName,
            clubName: registrationData.clubName || '',
            mealPreference: registrationData.mealPreference,
            qrData: registrationData.qrCode
        };
        
        console.log('📦 Payment data prepared:', paymentData);
        console.log('🆔 Order ID:', orderId);
        
        // Check if running on localhost
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        
        if (isLocalhost) {
            console.log('🧪 Running in localhost - using mock payment gateway');
            
            // Store data for mock gateway
            sessionStorage.setItem('pendingRegistration', JSON.stringify(registrationData));
            sessionStorage.setItem('cashfreeOrderId', orderId);
            
            // Redirect to mock payment gateway
            const mockPaymentUrl = `payment-gateway.html?` +
                `purpose=${encodeURIComponent(registrationData.typeName)}` +
                `&amount=${registrationData.price}` +
                `&name=${encodeURIComponent(registrationData.fullName)}` +
                `&email=${encodeURIComponent(registrationData.email)}` +
                `&phone=${registrationData.mobile}` +
                `&order_id=${orderId}`;
            
            console.log('🔄 Redirecting to mock payment gateway...');
            console.log('🔗 Payment URL:', mockPaymentUrl);
            
            window.location.href = mockPaymentUrl;
            return;
        }
        
        // For production - use real Cashfree API
        console.log('🌐 Calling Cashfree API...');
        
        // Call backend API to create Cashfree order
        const response = await fetch('/api/cashfree/initiate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });
        
        const result = await response.json();
        
        console.log('✅ Cashfree response:', result);
        
        if (result.success && result.paymentUrl) {
            // Store order info
            registrationData.orderId = result.orderId;
            registrationData.paymentSessionId = result.paymentSessionId;
            
            console.log('💰 Payment URL created:', result.paymentUrl);
            console.log('🔢 Order ID:', result.orderId);
            
            // Store registration data for callback
            sessionStorage.setItem('pendingRegistration', JSON.stringify(registrationData));
            sessionStorage.setItem('cashfreeOrderId', result.orderId);
            
            console.log('🔄 Redirecting to Cashfree payment page...');
            
            // Redirect to Cashfree
            window.location.href = result.paymentUrl;
            
        } else {
            console.error('❌ Payment failed:', result.error);
            alert('Payment initiation failed: ' + (result.error || 'Unknown error'));
            payBtn.disabled = false;
            payBtn.innerHTML = originalText;
        }
        
    } catch (error) {
        console.error('💥 Payment error:', error);
        alert('An error occurred. Please try again.');
        const payBtn = document.querySelector('#screen-payment .btn-primary');
        if (payBtn) {
            payBtn.disabled = false;
            payBtn.innerHTML = 'Proceed to Payment';
        }
    }
}

// Legacy alias for compatibility (keep existing button working)
async function initiateInstamojoPayment() {
    return await initiateCashfreePayment();
}

//======================================================================
// END CASHFREE INTEGRATION
//======================================================================
