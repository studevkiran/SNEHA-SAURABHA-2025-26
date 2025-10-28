// Registration Data
let registrationData = {
    type: '',
    typeName: '',
    price: 0,
    fullName: '',
    email: '',
    phone: '',
    city: ''
};

// Registration type options with pricing
const registrationTypes = {
    individual: { name: 'Individual', price: 500 },
    couple: { name: 'Couple', price: 900 },
    group: { name: 'Group', price: 1500 }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Setup registration type selection
    setupRegistrationSelection();
    
    // Prevent form submission on enter
    document.getElementById('personal-form').addEventListener('submit', function(e) {
        e.preventDefault();
    });
    
    // Add input validation
    setupFormValidation();
});

// Setup registration type selection
function setupRegistrationSelection() {
    const cards = document.querySelectorAll('.selection-card');
    const detailsDiv = document.getElementById('selection-details');
    const continueBtn = document.getElementById('btn-continue-type');
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove previous selection
            cards.forEach(c => c.classList.remove('selected'));
            
            // Add selection to clicked card
            this.classList.add('selected');
            
            // Get selected type
            const type = this.getAttribute('data-type');
            const typeInfo = registrationTypes[type];
            
            // Update registration data
            registrationData.type = type;
            registrationData.typeName = typeInfo.name;
            registrationData.price = typeInfo.price;
            
            // Update details display
            detailsDiv.innerHTML = `
                <p><strong>${typeInfo.name} Registration</strong></p>
                <p>Amount: ₹${typeInfo.price}</p>
            `;
            
            // Enable continue button
            continueBtn.disabled = false;
        });
    });
}

// Setup form validation
function setupFormValidation() {
    const inputs = document.querySelectorAll('#personal-form input');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateInput(this);
        });
        
        input.addEventListener('blur', function() {
            validateInput(this);
        });
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
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const city = document.getElementById('city').value.trim();
    
    // Validate all fields
    if (!fullName || !email || !phone || !city) {
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
    if (!phoneRegex.test(phone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    // Update registration data
    registrationData.fullName = fullName;
    registrationData.email = email;
    registrationData.phone = phone;
    registrationData.city = city;
    
    // Populate review screen
    document.getElementById('review-type').textContent = registrationData.typeName;
    document.getElementById('review-price').textContent = `₹${registrationData.price}`;
    document.getElementById('review-name').textContent = fullName;
    document.getElementById('review-email').textContent = email;
    document.getElementById('review-phone').textContent = phone;
    document.getElementById('review-city').textContent = city;
    
    // Show review screen
    showScreen('screen-review');
    
    // Also populate payment screen
    document.getElementById('payment-type').textContent = registrationData.typeName;
    document.getElementById('payment-amount').textContent = `₹${registrationData.price}`;
}

// Process payment
function processPayment(status) {
    if (status === 'success') {
        // Generate confirmation ID
        const confirmationId = 'REG' + Date.now().toString().slice(-8);
        
        // Populate success screen
        document.getElementById('confirmation-id').textContent = confirmationId;
        document.getElementById('success-amount').textContent = `₹${registrationData.price}`;
        
        // Show success screen
        showScreen('screen-success');
        
        // In real implementation, send data to server here
        console.log('Registration successful:', {
            confirmationId,
            ...registrationData
        });
    } else {
        // Show failure screen
        showScreen('screen-failure');
    }
}

// Reset form and start over
function resetForm() {
    // Clear registration data
    registrationData = {
        type: '',
        typeName: '',
        price: 0,
        fullName: '',
        email: '',
        phone: '',
        city: ''
    };
    
    // Clear form inputs
    document.getElementById('personal-form').reset();
    
    // Clear selections
    document.querySelectorAll('.selection-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Reset selection details
    document.getElementById('selection-details').innerHTML = '<p>Select a registration type to continue</p>';
    
    // Disable continue button
    document.getElementById('btn-continue-type').disabled = true;
    
    // Reset input borders
    document.querySelectorAll('#personal-form input').forEach(input => {
        input.style.borderColor = 'var(--light-gold)';
    });
    
    // Go back to banner screen
    showScreen('screen-banner');
}

// Prevent pull-to-refresh on mobile
document.body.addEventListener('touchmove', function(e) {
    if (e.target.closest('.screen-content')) {
        // Allow scrolling within screen-content
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
