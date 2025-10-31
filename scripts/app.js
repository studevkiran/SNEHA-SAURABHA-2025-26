// Registration Data
let registrationData = {
    type: '',
    typeName: '',
    price: 0,
    description: '',
    fullName: '',
    mobile: '',
    email: '',
    clubName: '',
    mealPreference: '',
    transactionId: '',
    upiId: ''
};

// Embedded fallback list of clubs (used when fetching local file via file:// is blocked by browser)
const EMBEDDED_CLUBS = [
    { "id": 1, "name": "B C Road City" },
    { "id": 2, "name": "Baikampady" },
    { "id": 3, "name": "Bajpe" },
    { "id": 4, "name": "Ballalbagh" },
    { "id": 5, "name": "Bannanje" },
    { "id": 6, "name": "Belthangady" },
    { "id": 7, "name": "Bolar" },
    { "id": 8, "name": "Central Mall" },
    { "id": 9, "name": "City East" },
    { "id": 10, "name": "City North" },
    { "id": 11, "name": "City South" },
    { "id": 12, "name": "City West" },
    { "id": 13, "name": "Cotton Hill" },
    { "id": 14, "name": "Dharwad" },
    { "id": 15, "name": "Gokarn" },
    { "id": 16, "name": "Hampankatta" },
    { "id": 17, "name": "Hostel Road" },
    { "id": 18, "name": "Hubli" },
    { "id": 19, "name": "Ibrahim" },
    { "id": 20, "name": "Jayanagar" },
    { "id": 21, "name": "K.R. Market" },
    { "id": 22, "name": "Kadri" },
    { "id": 23, "name": "Kankanady" },
    { "id": 24, "name": "Kasargod" },
    { "id": 25, "name": "Kinnigoli" },
    { "id": 26, "name": "Kodialbail" },
    { "id": 27, "name": "Kotekar" },
    { "id": 28, "name": "Kundapura" },
    { "id": 29, "name": "M. G. Road" },
    { "id": 30, "name": "Mangalore" },
    { "id": 31, "name": "Marnamikatta" },
    { "id": 32, "name": "Mudipu" },
    { "id": 33, "name": "Mulki" },
    { "id": 34, "name": "N.A. Road" },
    { "id": 35, "name": "Nellur" },
    { "id": 36, "name": "Padil" },
    { "id": 37, "name": "Panambur" },
    { "id": 38, "name": "Puttur" },
    { "id": 39, "name": "Ramachandrapura" },
    { "id": 40, "name": "Sampige" },
    { "id": 41, "name": "Santhosh" },
    { "id": 42, "name": "Shakthinagar" },
    { "id": 43, "name": "Shivamogga" },
    { "id": 44, "name": "Someshwar" },
    { "id": 45, "name": "Surathkal" },
    { "id": 46, "name": "Tannirbavi" },
    { "id": 47, "name": "Town Hall" },
    { "id": 48, "name": "Ullal" },
    { "id": 49, "name": "Uppinangady" },
    { "id": 50, "name": "Vamanjoor" },
    { "id": 51, "name": "Vijayapura" },
    { "id": 52, "name": "Vittal" },
    { "id": 53, "name": "Yeshwantpur" },
    { "id": 54, "name": "Zillah" },
    { "id": 55, "name": "Alleppey" },
    { "id": 56, "name": "Belgaum" },
    { "id": 57, "name": "Chikmagalur" },
    { "id": 58, "name": "Davanagere" },
    { "id": 59, "name": "Erode" },
    { "id": 60, "name": "Gulbarga" },
    { "id": 61, "name": "Hassan" },
    { "id": 62, "name": "Ichalkaranji" },
    { "id": 63, "name": "Jalgaon" },
    { "id": 64, "name": "Kolar" },
    { "id": 65, "name": "Lonavala" },
    { "id": 66, "name": "Miraj" },
    { "id": 67, "name": "Nagpur" },
    { "id": 68, "name": "Osmanabad" },
    { "id": 69, "name": "Pondicherry" },
    { "id": 70, "name": "Quilon" },
    { "id": 71, "name": "Ratnagiri" },
    { "id": 72, "name": "Salem" },
    { "id": 73, "name": "Tirupur" },
    { "id": 74, "name": "Udupi" },
    { "id": 75, "name": "Venkatagiri" },
    { "id": 76, "name": "Wayanad" },
    { "id": 77, "name": "Xavier Town" },
    { "id": 78, "name": "Yadgir" },
    { "id": 79, "name": "Zunheboto" },
    { "id": 80, "name": "Newtown" },
    { "id": 81, "name": "Old City" },
    { "id": 82, "name": "Harbour" },
    { "id": 83, "name": "Greenfield" },
    { "id": 84, "name": "Lighthouse" },
    { "id": 85, "name": "Oakwood" },
    { "id": 86, "name": "Riverside" },
    { "id": 87, "name": "Sunset" },
    { "id": 88, "name": "Valley" },
    { "id": 89, "name": "Willow" },
    { "id": 90, "name": "Zenith" },
    { "id": 91, "name": "Aurora" }
];

// Registration type options with complete details
const registrationTypes = {
    'rotarian': {
        name: 'Rotarian',
        price: 4500,
        description: 'Admission, Food & 1 Memento',
        inclusions: ['Conference admission', 'Food for all sessions', '1 Memento']
    },
    'rotarian-spouse': {
        name: 'Rotarian with Spouse',
        price: 7500,
        description: 'Admission with spouse + 2 children below 12 years, Food & 1 Memento',
        inclusions: ['Admission for Rotarian and spouse', 'Admission for 2 children below 12 years', 'Food for all', '1 Memento']
    },
    'ann': {
        name: 'Ann',
        price: 3500,
        description: 'Admission & Food',
        inclusions: ['Conference admission', 'Food for all sessions']
    },
    'annet': {
        name: 'Annet',
        price: 2000,
        description: 'Admission & Food',
        inclusions: ['Conference admission', 'Food for all sessions']
    },
    'guest': {
        name: 'Guest',
        price: 4500,
        description: 'Admission, Food & 1 Memento',
        inclusions: ['Conference admission', 'Food for all sessions', '1 Memento']
    },
    'silver-donor': {
        name: 'Silver Donor',
        price: 20000,
        description: 'Admission with spouse + 2 children below 12 years, Food & 2 Memento',
        inclusions: ['Admission for donor and spouse', 'Admission for 2 children below 12 years', 'Food for all', '2 Mementos']
    },
    'silver-sponsor': {
        name: 'Silver Sponsor',
        price: 25000,
        description: 'Admission with spouse + 2 children below 12 years, Food & 1 Memento, Double Room at venue (no extra beds)',
        inclusions: ['Admission for sponsor and spouse', 'Admission for 2 children below 12 years', 'Food for all', '1 Memento', 'Double Room at venue (no extra beds)']
    },
    'gold-sponsor': {
        name: 'Gold Sponsor',
        price: 50000,
        description: 'Admission with spouse + 2 children below 12 years, Food & special Memento, Double Room at venue (no extra beds)',
        inclusions: ['Admission for sponsor and spouse', 'Admission for 2 children below 12 years', 'Food for all', 'Special Memento', 'Double Room at venue (no extra beds)']
    },
    'platinum-sponsor': {
        name: 'Platinum Sponsor',
        price: 75000,
        description: 'Admission with spouse + 2 children below 12 years, Food & special Memento, Premium Room at venue (no extra beds)',
        inclusions: ['Admission for sponsor and spouse', 'Admission for 2 children below 12 years', 'Food for all', 'Special Memento', 'Premium Room at venue (no extra beds)']
    },
    'patron-sponsor': {
        name: 'Patron Sponsor',
        price: 100000,
        description: 'Admission with spouse + 2 children below 12 years, Food & special Memento, Suite Room at venue (no extra beds)',
        inclusions: ['Admission for sponsor and spouse', 'Admission for 2 children below 12 years', 'Food for all', 'Special Memento', 'Suite Room at venue (no extra beds)']
    }
};

// Load clubs from JSON
let clubsList = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Check for payment callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
        // Payment successful - restore registration data and show success
        const pendingData = sessionStorage.getItem('pendingRegistration');
        if (pendingData) {
            registrationData = JSON.parse(pendingData);
            sessionStorage.removeItem('pendingRegistration');
            
            // Process successful payment
            console.log('💳 Payment callback received - Success!');
            processPayment('success');
            return; // Don't run other initialization
        }
    } else if (urlParams.get('payment') === 'cancelled') {
        // Payment cancelled
        alert('Payment was cancelled. Please try again.');
        showScreen('screen-payment');
    }
    
    // Load clubs
    loadClubs();
    
    // Setup registration type selection
    setupRegistrationSelection();
    
    // Setup meal preference selection
    setupMealPreference();
    
    // Prevent form submission on enter
    document.getElementById('personal-form').addEventListener('submit', function(e) {
        e.preventDefault();
    });
    
    // Add input validation
    setupFormValidation();
});

// Load clubs from JSON file
async function loadClubs() {
    const clubSelect = document.getElementById('club-name');
    // Reset options (keep first placeholder)
    clubSelect.innerHTML = '<option value="">Select Club</option>';

    try {
        // Try fetching the clubs JSON (works when served over http/https)
        const response = await fetch('data/clubs.json');
        if (!response.ok) throw new Error('Network response was not ok');
        clubsList = await response.json();
    } catch (error) {
        // If fetch fails (commonly when opening index.html via file://), fall back to embedded list
        console.warn('Could not load data/clubs.json (falling back to embedded list):', error);
        clubsList = EMBEDDED_CLUBS.slice();
    }

    // Populate club dropdown
    clubsList.forEach(club => {
        const option = document.createElement('option');
        option.value = club.name;
        option.textContent = `${club.id}. ${club.name}`;
        option.setAttribute('data-id', club.id);
        clubSelect.appendChild(option);
    });
}

// Setup registration type selection - simplified for compact design
function setupRegistrationSelection() {
    const cards = document.querySelectorAll('.selection-card');
    const continueBtn = document.getElementById('btn-continue-type');
    const descriptionBox = document.getElementById('selection-description-box');
    const descriptionText = document.getElementById('selected-description');
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const typeInfo = registrationTypes[type];
            
            // Remove selection from all cards
            cards.forEach(c => c.classList.remove('selected'));
            
            // Select this card
            this.classList.add('selected');
            
            // Show description box with details
            descriptionBox.classList.add('visible');
            descriptionText.textContent = typeInfo.description;
            
            // Update registration data
            registrationData.type = type;
            registrationData.typeName = typeInfo.name;
            registrationData.price = typeInfo.price;
            registrationData.description = typeInfo.description;
            
            // Enable continue button
            continueBtn.disabled = false;
        });
    });
}

// Setup meal preference toggle - updated for compact buttons
function setupMealPreference() {
    const mealBtns = document.querySelectorAll('.meal-btn-compact');
    
    mealBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove selection from all buttons
            mealBtns.forEach(b => b.classList.remove('selected'));
            
            // Add selection to clicked button
            this.classList.add('selected');
            
            // Update registration data
            registrationData.mealPreference = this.getAttribute('data-meal');
        });
    });
}

// Setup form validation
function setupFormValidation() {
    const inputs = document.querySelectorAll('#personal-form input, #personal-form select');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateInput(this);
        });
        
        input.addEventListener('blur', function() {
            validateInput(this);
        });
    });
    
    // Mobile number validation
    const mobileInput = document.getElementById('mobile');
    mobileInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}

// Validate individual input
function validateInput(input) {
    if (input.validity.valid) {
        input.style.borderColor = 'var(--primary-gold)';
        return true;
    } else {
        input.style.borderColor = 'var(--error)';
        return false;
    }
}

// Show specific screen
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    setTimeout(() => {
        document.getElementById(screenId).classList.add('active');
    }, 50);
}

// Show review screen with collected data
function showReview() {
    // Collect personal details
    const fullName = document.getElementById('full-name').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const email = document.getElementById('email').value.trim();
    const clubName = document.getElementById('club-name').value;
    const mealPreference = registrationData.mealPreference;
    
    // Validate all fields
    if (!fullName || !mobile || !email || !clubName || !mealPreference) {
        alert('Please fill in all fields');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(mobile)) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }
    
    // Update registration data
    registrationData.fullName = fullName;
    registrationData.mobile = mobile;
    registrationData.email = email;
    registrationData.clubName = clubName;
    
    // Populate review screen
    document.getElementById('review-type').textContent = registrationData.typeName;
    document.getElementById('review-price').textContent = `₹${registrationData.price.toLocaleString('en-IN')}`;
    
    document.getElementById('review-name').textContent = fullName;
    document.getElementById('review-mobile').textContent = mobile;
    document.getElementById('review-email').textContent = email;
    document.getElementById('review-club').textContent = clubName;
    document.getElementById('review-meal').textContent = mealPreference;
    
    // Show review screen
    showScreen('screen-review');
    
    // Also populate payment screen
    document.getElementById('payment-type').textContent = registrationData.typeName;
    document.getElementById('payment-amount').textContent = `₹${registrationData.price.toLocaleString('en-IN')}`;
}

// Initiate Instamojo payment
async function initiateInstamojoPayment() {
    console.log('🚀 Payment button clicked!');
    console.log('📋 Registration data:', registrationData);
    
    try {
        // Show loading state
        const payBtn = event.target;
        const originalText = payBtn.innerHTML;
        payBtn.disabled = true;
        payBtn.innerHTML = '⏳ Creating Payment Link...';
        
        console.log('💳 Starting payment process...');
        
        // Prepare registration data for payment
        const paymentData = {
            type: registrationData.typeName,
            amount: registrationData.price,
            fullName: registrationData.fullName,
            email: registrationData.email,
            mobile: registrationData.mobile
        };
        
        console.log('📦 Payment data prepared:', paymentData);
        
        // Create payment request with Instamojo
        const paymentResponse = await instamojoService.createPaymentRequest(paymentData);
        
        console.log('✅ Payment response received:', paymentResponse);
        
        if (paymentResponse.success) {
            // Store transaction ID
            registrationData.transactionId = paymentResponse.transactionId;
            registrationData.paymentRequestId = paymentResponse.paymentRequestId;
            
            console.log('💰 Payment link created:', paymentResponse.paymentUrl);
            console.log('🔢 Transaction ID:', paymentResponse.transactionId);
            
            // Store registration data in sessionStorage for payment callback
            sessionStorage.setItem('pendingRegistration', JSON.stringify(registrationData));
            
            // Redirect to mock payment gateway page
            const paymentUrl = `payment-gateway.html?` +
                `purpose=${encodeURIComponent(registrationData.typeName)}` +
                `&amount=${registrationData.price}` +
                `&name=${encodeURIComponent(registrationData.fullName)}` +
                `&email=${encodeURIComponent(registrationData.email)}` +
                `&phone=${registrationData.mobile}` +
                `&txn_id=${paymentResponse.transactionId}`;
            
            console.log('� Redirecting to payment gateway...');
            
            // In production, this would be:
            // window.location.href = paymentResponse.paymentUrl;
            
            // For testing with mock gateway:
            window.location.href = paymentUrl;
            
        } else {
            console.error('❌ Payment failed:', paymentResponse.error);
            alert('Payment initiation failed: ' + (paymentResponse.error || 'Unknown error'));
            payBtn.disabled = false;
            payBtn.innerHTML = originalText;
        }
        
    } catch (error) {
        console.error('💥 Payment error:', error);
        alert('An error occurred. Please try again.');
        event.target.disabled = false;
        event.target.innerHTML = originalText;
    }
}

// Process payment
function processPayment(status) {
    console.log('💳 Processing payment with status:', status);
    
    if (status === 'success') {
        console.log('✅ Payment successful! Generating confirmation...');
        
        // Generate transaction details (simulate payment gateway response)
        const confirmationId = 'SS' + Date.now().toString().slice(-8);
        const transactionId = 'TXN' + Date.now().toString().slice(-10);
        const upiId = 'user@upi'; // This would come from payment gateway
        
        registrationData.transactionId = transactionId;
        registrationData.upiId = upiId;
        registrationData.confirmationId = confirmationId;
        
        console.log('🎫 Confirmation ID:', confirmationId);
        console.log('🔢 Transaction ID:', transactionId);
        
        // Populate success screen
        document.getElementById('confirmation-id').textContent = confirmationId;
        document.getElementById('success-name').textContent = registrationData.fullName;
        document.getElementById('success-mobile').textContent = registrationData.mobile;
        document.getElementById('success-type').textContent = registrationData.typeName;
        document.getElementById('success-amount').textContent = `₹${registrationData.price.toLocaleString('en-IN')}`;
        document.getElementById('success-txn').textContent = transactionId;
        document.getElementById('success-upi').textContent = upiId;
        
        console.log('📝 Success screen populated');
        
        // Generate QR Code
        generateQRCode(confirmationId, registrationData.fullName, registrationData.typeName);
        
        console.log('🎉 Showing success screen...');
        
        // Show success screen
        showScreen('screen-success');
        
        // In real implementation:
        // 1. Send data to backend API
        // 2. Store in database
        // 3. Trigger WhatsApp confirmation
        // 4. Send email confirmation
        
        console.log('✨ Registration successful:', {
            confirmationId,
            ...registrationData,
            registrationDate: new Date().toISOString(),
            paymentStatus: 'Paid',
            verificationStatus: 'Pending'
        });
    } else {
        // Show failure screen
        showScreen('screen-failure');
    }
}

// Generate QR Code for venue check-in
function generateQRCode(confirmationId, name, type) {
    const qrContainer = document.getElementById('qr-code');
    qrContainer.innerHTML = ''; // Clear previous QR code
    
    // QR code data: JSON string with registration details
    const qrData = JSON.stringify({
        id: confirmationId,
        name: name,
        type: type,
        mobile: registrationData.mobile
    });
    
    new QRCode(qrContainer, {
        text: qrData,
        width: 200,
        height: 200,
        colorDark: "#2C2416",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Download acknowledgment as PDF
function downloadAsPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add header
        doc.setFillColor(212, 175, 55); // Gold color
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('Sneha Sourabha 2025-26', 105, 20, { align: 'center' });
        
        doc.setFontSize(14);
        doc.text('Registration Confirmation', 105, 32, { align: 'center' });
        
        // Reset text color
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        
        // Add confirmation details
        let y = 60;
        const lineHeight = 12;
        
        doc.setFont(undefined, 'bold');
        doc.text('Confirmation ID:', 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(document.getElementById('confirmation-id').textContent, 70, y);
        y += lineHeight;
        
        doc.setFont(undefined, 'bold');
        doc.text('Name:', 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(document.getElementById('success-name').textContent, 70, y);
        y += lineHeight;
        
        doc.setFont(undefined, 'bold');
        doc.text('Mobile:', 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(document.getElementById('success-mobile').textContent, 70, y);
        y += lineHeight;
        
        doc.setFont(undefined, 'bold');
        doc.text('Email:', 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(registrationData.email, 70, y);
        y += lineHeight;
        
        doc.setFont(undefined, 'bold');
        doc.text('Club:', 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(registrationData.clubName, 70, y);
        y += lineHeight;
        
        doc.setFont(undefined, 'bold');
        doc.text('Registration Type:', 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(document.getElementById('success-type').textContent, 70, y);
        y += lineHeight;
        
        doc.setFont(undefined, 'bold');
        doc.text('Meal Preference:', 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(registrationData.mealPreference, 70, y);
        y += lineHeight;
        
        doc.setFont(undefined, 'bold');
        doc.text('Amount Paid:', 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(document.getElementById('success-amount').textContent, 70, y);
        y += lineHeight;
        
        doc.setFont(undefined, 'bold');
        doc.text('Transaction ID:', 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(document.getElementById('success-txn').textContent, 70, y);
        y += lineHeight;
        
        doc.setFont(undefined, 'bold');
        doc.text('UPI ID:', 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(document.getElementById('success-upi').textContent, 70, y);
        y += lineHeight * 2;
        
        // Add footer note
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const footerText = 'This is an acknowledgment. Official confirmation will follow via WhatsApp/Email.';
        doc.text(footerText, 105, y, { align: 'center', maxWidth: 170 });
        
        // Add event details at bottom
        y += 20;
        doc.setTextColor(212, 175, 55);
        doc.setFont(undefined, 'bold');
        doc.text('Event: 30-31 Jan & 1 Feb 2026 | Venue: Silent Shores, Mysore', 105, y, { align: 'center' });
        
        // Save PDF
        doc.save('sneha-sourabha-registration.pdf');
    } catch (error) {
        console.error('PDF generation error:', error);
        alert('Unable to generate PDF. Please try downloading as image instead.');
    }
}

// Download acknowledgment as Image
function downloadAsImage() {
    try {
        const card = document.getElementById('confirmation-card');
        
        html2canvas(card, {
            backgroundColor: '#FFF8DC',
            scale: 2
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'sneha-sourabha-registration.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    } catch (error) {
        console.error('Image generation error:', error);
        alert('Unable to generate image. Please try downloading as PDF instead.');
    }
}

// Reset form and start over
function resetForm() {
    // Clear registration data
    registrationData = {
        type: '',
        typeName: '',
        price: 0,
        description: '',
        fullName: '',
        mobile: '',
        email: '',
        clubName: '',
        mealPreference: '',
        transactionId: '',
        upiId: ''
    };
    
    // Clear form inputs
    document.getElementById('personal-form').reset();
    
    // Clear selections
    document.querySelectorAll('.selection-card').forEach(card => {
        card.classList.remove('selected', 'expanded');
        const details = card.querySelector('.selection-details');
        if (details) details.remove();
    });
    
    // Clear meal preference
    document.querySelectorAll('.meal-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Disable continue button
    document.getElementById('btn-continue-type').disabled = true;
    
    // Reset input borders
    document.querySelectorAll('#personal-form input, #personal-form select').forEach(input => {
        input.style.borderColor = 'var(--light-gold)';
    });
    
    // Go back to home screen
    showScreen('screen-banner');
}

// Prevent pull-to-refresh on mobile
document.body.addEventListener('touchmove', function(e) {
    if (e.target.closest('.screen-content')) {
        return;
    }
    e.preventDefault();
}, { passive: false });

// Prevent double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);
