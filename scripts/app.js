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
    try {
        const response = await fetch('data/clubs.json');
        clubsList = await response.json();
        
        // Populate club dropdown
        const clubSelect = document.getElementById('club-name');
        clubsList.forEach(club => {
            const option = document.createElement('option');
            option.value = club.name;
            option.textContent = club.name;
            option.setAttribute('data-id', club.id);
            clubSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading clubs:', error);
    }
}

// Setup registration type selection with expand/collapse
function setupRegistrationSelection() {
    const cards = document.querySelectorAll('.selection-card');
    const continueBtn = document.getElementById('btn-continue-type');
    const detailsContainer = document.getElementById('selection-details-container');
    const priceEl = document.getElementById('details-price');
    const descriptionEl = document.getElementById('details-description');
    const inclusionsEl = document.getElementById('details-inclusions');
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const typeInfo = registrationTypes[type];
            
            // Remove selection from all cards
            cards.forEach(c => c.classList.remove('selected'));
            
            // Select this card
            this.classList.add('selected');
            
            // Show details container below grid
            detailsContainer.style.display = 'block';
            
            // Populate details
            priceEl.textContent = `₹${typeInfo.price.toLocaleString('en-IN')}`;
            descriptionEl.textContent = typeInfo.description;
            inclusionsEl.innerHTML = typeInfo.inclusions.map(item => `<li>${item}</li>`).join('');
            
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

// Setup meal preference toggle
function setupMealPreference() {
    const mealBtns = document.querySelectorAll('.meal-btn');
    
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
    
    // Add description with inclusions
    const typeInfo = registrationTypes[registrationData.type];
    const descriptionHTML = `
        <p>${typeInfo.description}</p>
        <ul>
            ${typeInfo.inclusions.map(item => `<li>${item}</li>`).join('')}
        </ul>
    `;
    document.getElementById('review-description').innerHTML = descriptionHTML;
    
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

// Process payment
function processPayment(status) {
    if (status === 'success') {
        // Generate transaction details (simulate payment gateway response)
        const confirmationId = 'SS' + Date.now().toString().slice(-8);
        const transactionId = 'TXN' + Date.now().toString().slice(-10);
        const upiId = 'user@upi'; // This would come from payment gateway
        
        registrationData.transactionId = transactionId;
        registrationData.upiId = upiId;
        
        // Populate success screen
        document.getElementById('confirmation-id').textContent = confirmationId;
        document.getElementById('success-name').textContent = registrationData.fullName;
        document.getElementById('success-mobile').textContent = registrationData.mobile;
        document.getElementById('success-type').textContent = registrationData.typeName;
        document.getElementById('success-amount').textContent = `₹${registrationData.price.toLocaleString('en-IN')}`;
        document.getElementById('success-txn').textContent = transactionId;
        document.getElementById('success-upi').textContent = upiId;
        
        // Show success screen
        showScreen('screen-success');
        
        // In real implementation:
        // 1. Send data to backend API
        // 2. Store in database
        // 3. Trigger WhatsApp confirmation
        // 4. Send email confirmation
        
        console.log('Registration successful:', {
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

// Download acknowledgment as PDF
function downloadAsPDF() {
    // This requires jsPDF library - placeholder for now
    alert('PDF download functionality will be implemented with jsPDF library.\n\nFor production, include jsPDF and generate PDF with all confirmation details.');
    
    // Production implementation would be:
    // const { jsPDF } = window.jspdf;
    // const doc = new jsPDF();
    // Add all confirmation details to PDF
    // doc.save('sneha-sourabha-registration.pdf');
}

// Download acknowledgment as Image
function downloadAsImage() {
    // This requires html2canvas library - placeholder for now
    alert('Image download functionality will be implemented with html2canvas library.\n\nFor production, include html2canvas and capture the confirmation card as image.');
    
    // Production implementation would be:
    // const card = document.getElementById('confirmation-card');
    // html2canvas(card).then(canvas => {
    //     const link = document.createElement('a');
    //     link.download = 'sneha-sourabha-registration.png';
    //     link.href = canvas.toDataURL();
    //     link.click();
    // });
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
