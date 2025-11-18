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
        price: 5000,
        description: 'Admission, Food & 1 Memento',
        inclusions: ['Conference admission', 'Food for all sessions', '1 Memento']
    },
    'rotarian-spouse': {
        name: 'Rotarian with Spouse',
        price: 8000,
        description: 'Admission with spouse, Food & 1 Memento',
        inclusions: ['Admission for Rotarian and spouse', 'Food for all', '1 Memento']
    },
    'ann': {
        name: 'Ann',
        price: 4000,
        description: 'Admission & Food',
        inclusions: ['Conference admission', 'Food for all sessions']
    },
    'annet': {
        name: 'Annet',
        price: 2000,
        description: 'Admission & Food',
        inclusions: ['Conference admission', 'Food for all sessions']
    },
    'innerwheel': {
        name: 'Innerwheel Member',
        price: 3500,
        description: 'Admission, Food & 1 Memento',
        inclusions: ['Conference admission', 'Food for all sessions', '1 Memento']
    },
    'guest': {
        name: 'Guest',
        price: 5000,
        description: 'Admission, Food & 1 Memento',
        inclusions: ['Conference admission', 'Food for all sessions', '1 Memento']
    },
    'rotaractor': {
        name: 'Rotaractor',
        price: 2500,
        description: 'Admission & Food',
        inclusions: ['Conference admission', 'Food for all sessions']
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

// Registration Type Prefixes for unique IDs
const registrationPrefixes = {
    'rotarian': 'ROT',
    'rotarian-spouse': 'RS',
    'ann': 'ANN',
    'annet': 'ANT',
    'guest': 'GST',
    'rotaractor': 'RAC',
    'silver-donor': 'SD',
    'silver-sponsor': 'SS',
    'gold-sponsor': 'GS',
    'platinum-sponsor': 'PS',
    'patron-sponsor': 'PAT'
};

// Setup clear button visibility
function setupClearButtons() {
    // Club search in manual mode
    const clubSearch = document.getElementById('club-search');
    const clearClub = document.getElementById('clear-club');
    if (clubSearch && clearClub) {
        clubSearch.addEventListener('input', function() {
            clearClub.style.display = this.value ? 'block' : 'none';
        });
    }
    
    // Club search in quick mode
    const clubSearchQuick = document.getElementById('club-search-quick');
    const clearClubQuick = document.getElementById('clear-club-quick');
    if (clubSearchQuick && clearClubQuick) {
        clubSearchQuick.addEventListener('input', function() {
            clearClubQuick.style.display = this.value ? 'block' : 'none';
        });
    }
    
    // Member search in quick mode
    const memberSearch = document.getElementById('member-search');
    const clearMember = document.getElementById('clear-member');
    if (memberSearch && clearMember) {
        memberSearch.addEventListener('input', function() {
            clearMember.style.display = this.value ? 'block' : 'none';
        });
    }
}

// Load clubs from JSON
let clubsList = [];

// Fetch and display registration by order_id (for WhatsApp links and direct access)
async function fetchAndShowRegistration(orderId) {
    try {
        console.log('🔍 Fetching registration for order_id:', orderId);
        
        const response = await fetch(`/api/registrations/by-order?order_id=${orderId}`);
        const result = await response.json();
        
        // Handle pending registration (payment received but webhook still processing)
        if (response.status === 202 && result.pending) {
            console.log('⏳ Registration pending, will retry in 3 seconds...');
            alert('✅ Payment received! Processing your registration... Please wait.');
            
            // Retry after 3 seconds
            setTimeout(() => {
                fetchAndShowRegistration(orderId);
            }, 3000);
            return;
        }
        
        if (result.success && result.registration) {
            const reg = result.registration;
            
            // Populate success screen with registration details (using public/index.html element IDs)
            document.getElementById('confirmation-id-display').textContent = reg.registration_id;
            document.getElementById('ack-name').textContent = reg.name;
            document.getElementById('ack-type').textContent = reg.registration_type;
            document.getElementById('ack-amount').textContent = `₹${reg.registration_amount.toLocaleString('en-IN')}`;
            document.getElementById('ack-club').textContent = reg.club;
            document.getElementById('ack-meal').textContent = reg.meal_preference;
            document.getElementById('ack-mobile').textContent = reg.mobile;
            document.getElementById('ack-txn').textContent = reg.order_id;
            
            // Format date
            const createdDate = new Date(reg.created_at);
            const dateStr = createdDate.toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            });
            const timeStr = createdDate.toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            document.getElementById('ack-date').textContent = `${dateStr} ${timeStr}`;
            
            // Store for PDF generation
            registrationData = {
                registrationId: reg.registration_id,
                fullName: reg.name,
                mobile: reg.mobile,
                email: reg.email,
                typeName: reg.registration_type,
                price: reg.registration_amount,
                clubName: reg.club,
                zone: reg.zone,
                mealPreference: reg.meal_preference,
                tshirtSize: reg.tshirt_size,
                orderID: reg.order_id,
                paymentStatus: reg.payment_status,
                transactionId: reg.transaction_id,
                upiId: reg.upi_id,
                createdAt: reg.created_at
            };
            
            // Show success screen
            showScreen('screen-success');
            
            console.log('✅ Registration details loaded and displayed');
        } else {
            console.error('❌ Registration not found for order_id:', orderId);
            alert('Registration not found. Please contact support.');
            showScreen('screen-home');
        }
    } catch (error) {
        console.error('❌ Error fetching registration:', error);
        alert('Error loading registration details. Please try again.');
        showScreen('screen-home');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Check for payment callback from Cashfree
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const orderId = urlParams.get('order_id');
    
    console.log('🔍 Page loaded with params:', { paymentStatus, orderId });
    
    if ((paymentStatus === 'success' || paymentStatus === 'pending') && orderId) {
        // Payment completed - fetch registration by order_id
        console.log('💳 Payment callback received:', { 
            paymentStatus, 
            orderId
        });
        
        // Fetch registration details by order_id (works for Cashfree order_id AND UTR)
        fetchAndShowRegistration(orderId);
        return; // Don't run other initialization
        
    } else if (paymentStatus === 'cancelled' || paymentStatus === 'failed') {
        // Payment cancelled or failed
        alert('Payment was ' + paymentStatus + '. Please try again.');
        showScreen('screen-payment');
    }
    
    // Load clubs
    loadClubs();
    
    // Setup club search
    setupClubSearch();
    
    // Setup registration type selection
    setupRegistrationSelection();
    
    // Setup meal preference selection
    setupMealPreference();
    
    // Prevent form submission on enter
    document.getElementById('personal-form').addEventListener('submit', function(e) {
        e.preventDefault();
    });
    
    // Setup "name not found" link to switch to manual mode
    const nameNotFoundLink = document.getElementById('name-not-found-link');
    if (nameNotFoundLink) {
        nameNotFoundLink.addEventListener('click', function(e) {
            e.preventDefault();
            switchToManualMode();
        });
    }
    
    // Add input validation
    setupFormValidation();
    
    // Setup clear button visibility for all search inputs
    setupClearButtons();
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

    // Sort clubs alphabetically by name
    clubsList.sort((a, b) => a.name.localeCompare(b.name));

    // Populate club dropdown (sorted alphabetically, no numbering)
    clubsList.forEach(club => {
        const option = document.createElement('option');
        option.value = club.name;
        option.textContent = club.name; // Just the name, no ID prefix
        option.setAttribute('data-id', club.id); // Keep original ID for database
        clubSelect.appendChild(option);
    });
}

// Add club search functionality
function setupClubSearch() {
    const searchInput = document.getElementById('club-search');
    const clubSelect = document.getElementById('club-name');
    const optionsList = document.getElementById('club-options');
    const clearBtn = document.getElementById('clear-club');
    
    if (!searchInput || !clubSelect || !optionsList) return;
    
    let allClubs = [];
    
    // Populate options list from select
    function populateOptions(filter = '') {
        const options = Array.from(clubSelect.options);
        allClubs = options.filter(opt => opt.value !== '');
        
        optionsList.innerHTML = '';
        
        const filtered = allClubs.filter(opt => {
            const text = opt.textContent.toLowerCase();
            return text.includes(filter.toLowerCase());
        });
        
        if (filtered.length === 0) {
            const noResultDiv = document.createElement('div');
            noResultDiv.className = 'club-option';
            noResultDiv.style.color = '#999';
            noResultDiv.style.cursor = 'default';
            noResultDiv.textContent = 'No clubs found. Clear search to see all.';
            optionsList.appendChild(noResultDiv);
        } else {
            filtered.forEach(opt => {
                const div = document.createElement('div');
                div.className = 'club-option';
                div.textContent = opt.textContent;
                div.setAttribute('data-value', opt.value);
                div.setAttribute('data-id', opt.getAttribute('data-id')); // Preserve club ID
                div.addEventListener('click', () => selectClub(opt.value, opt.textContent, opt.getAttribute('data-id')));
                optionsList.appendChild(div);
            });
        }
    }
    
    function selectClub(value, text, clubId) {
        clubSelect.value = value;
        searchInput.value = text;
        
        // Store club ID in a data attribute on the select element for easy retrieval
        if (clubId) {
            clubSelect.setAttribute('data-selected-club-id', clubId);
        }
        
        optionsList.classList.remove('show');
        optionsList.style.display = 'none'; // Completely hide dropdown
        if (clearBtn) clearBtn.style.display = 'block'; // Show X button
    }
    
    // Toggle clear button visibility
    function toggleClearButton() {
        if (clearBtn) {
            clearBtn.style.display = searchInput.value ? 'block' : 'none';
        }
    }
    
    // Show dropdown on focus
    searchInput.addEventListener('focus', () => {
        populateOptions(searchInput.value);
        optionsList.classList.add('show');
        optionsList.style.display = 'block';
    });
    
    // Show dropdown on click
    searchInput.addEventListener('click', () => {
        populateOptions(searchInput.value);
        optionsList.classList.add('show');
        optionsList.style.display = 'block';
    });
    
    // Filter on input
    searchInput.addEventListener('input', () => {
        populateOptions(searchInput.value);
        optionsList.classList.add('show');
        optionsList.style.display = 'block';
        toggleClearButton();
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !optionsList.contains(e.target)) {
            optionsList.classList.remove('show');
        }
    });
    
    // Initial population after clubs are loaded
    setTimeout(() => {
        populateOptions();
        toggleClearButton();
    }, 100);
}

// Clear club selection
function clearClubSelection() {
    const searchInput = document.getElementById('club-search');
    const clubSelect = document.getElementById('club-name');
    const clearBtn = document.getElementById('clear-club');
    const optionsList = document.getElementById('club-options');
    
    if (searchInput) searchInput.value = '';
    if (clubSelect) {
        clubSelect.value = '';
        clubSelect.removeAttribute('data-selected-club-id'); // Clear stored club ID
    }
    if (clearBtn) clearBtn.style.display = 'none';
    
    // Show all clubs again
    if (optionsList) {
        setupClubSearch(); // Reinitialize to show all options
        optionsList.classList.add('show');
        optionsList.style.display = 'block';
    }
    
    // Refocus on input
    if (searchInput) searchInput.focus();
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
    // Scroll to top on desktop
    if (window.innerWidth >= 768) {
        window.scrollTo(0, 0);
    }
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    setTimeout(() => {
        document.getElementById(screenId).classList.add('active');
        
        // If showing personal details, update selected type and price display
        if (screenId === 'screen-personal-details') {
            const typeDisplay = document.getElementById('selected-type-display');
            const priceDisplay = document.getElementById('selected-price-display');
            if (typeDisplay && priceDisplay && registrationData.typeName) {
                typeDisplay.textContent = registrationData.typeName;
                priceDisplay.textContent = registrationData.price.toLocaleString('en-IN');
            }
            
            // Initialize registration mode (quick vs manual)
            initializeRegistrationMode();
        }
    }, 50);
}

// Initialize registration mode based on type
function initializeRegistrationMode() {
    const quickMode = document.getElementById('quick-reg-mode');
    const manualMode = document.getElementById('manual-reg-mode');
    const guestMode = document.getElementById('guest-reg-mode');
    const autofilledDetails = document.getElementById('autofilled-details');
    
    // Guest uses simple input mode (no club dropdown)
    if (registrationData.typeName === 'Guest') {
        quickMode.style.display = 'none';
        manualMode.style.display = 'none';
        guestMode.style.display = 'block';
        autofilledDetails.style.display = 'none';
    }
    // Rotaractor uses manual mode (with club dropdown)
    else if (registrationData.typeName === 'Rotaractor') {
        quickMode.style.display = 'none';
        manualMode.style.display = 'block';
        guestMode.style.display = 'none';
        autofilledDetails.style.display = 'none';
    } else {
        // All other types start with quick mode
        quickMode.style.display = 'block';
        manualMode.style.display = 'none';
        guestMode.style.display = 'none';
        autofilledDetails.style.display = 'none';
        
        // Initialize club search
        initializeClubSearch();
    }
}

// Initialize club search functionality
function initializeClubSearch() {
    const clubSearch = document.getElementById('club-search-quick');
    const clubDropdown = document.getElementById('club-dropdown-quick');
    
    // Load clubs from the existing clubs data
    fetch('data/clubs.json')
        .then(response => response.json())
        .then(clubs => {
            // Store clubs globally for filtering
            window.clubsList = clubs;
            
            // Filter on input
            clubSearch.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filtered = clubs.filter(club => 
                    club.name.toLowerCase().includes(searchTerm)
                );
                renderClubDropdown(filtered);
            });
            
            // Show all clubs on focus
            clubSearch.addEventListener('focus', () => {
                renderClubDropdown(clubs);
            });
        });
    
    // Handle club selection
    clubDropdown.addEventListener('click', (e) => {
        const item = e.target.closest('.dropdown-item');
        if (item) {
            const clubName = item.textContent.trim();
            clubSearch.value = clubName;
            clubDropdown.style.display = 'none';
            
            // Fetch members for selected club
            fetchMembersByClub(clubName);
        }
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!clubSearch.contains(e.target) && !clubDropdown.contains(e.target)) {
            clubDropdown.style.display = 'none';
        }
    });
}

// Render club dropdown
function renderClubDropdown(clubs) {
    const clubDropdown = document.getElementById('club-dropdown-quick');
    
    if (clubs.length === 0) {
        clubDropdown.style.display = 'none';
        return;
    }
    
    clubDropdown.innerHTML = clubs
        .map(club => `<div class="dropdown-item" data-club-id="${club.id}">${club.name}</div>`)
        .join('');
    clubDropdown.style.display = 'block';
}

// Fetch members by club name
async function fetchMembersByClub(clubName) {
    const memberSearch = document.getElementById('member-search');
    const memberDropdown = document.getElementById('member-dropdown');
    const memberWrapper = document.getElementById('member-selection-wrapper');
    
    // Show the member selection section
    if (memberWrapper) {
        memberWrapper.style.display = 'block';
    }
    
    try {
        memberSearch.value = '';
        memberSearch.placeholder = 'Loading members...';
        memberSearch.disabled = true;
        
        const response = await fetch(`/api/club-members?clubName=${encodeURIComponent(clubName)}`);
        const data = await response.json();
        
        if (data.success && data.members.length > 0) {
            // Store members globally for filtering
            window.currentMembers = data.members;
            
            memberSearch.placeholder = 'Search member name...';
            memberSearch.disabled = false;
            memberSearch.focus();
            
            // Initialize member search
            initializeMemberSearch();
            
            // Show all members initially
            renderMemberDropdown(data.members);
        } else {
            memberSearch.placeholder = 'No members found';
            memberSearch.disabled = true;
            window.currentMembers = [];
        }
    } catch (error) {
        console.error('Error fetching members:', error);
        memberSearch.placeholder = 'Error loading members';
        memberSearch.disabled = false;
    }
}

// Initialize member search functionality
function initializeMemberSearch() {
    const memberSearch = document.getElementById('member-search');
    const memberDropdown = document.getElementById('member-dropdown');
    
    // Remove any existing listeners by cloning
    const newMemberSearch = memberSearch.cloneNode(true);
    memberSearch.parentNode.replaceChild(newMemberSearch, memberSearch);
    
    const newMemberDropdown = memberDropdown.cloneNode(true);
    memberDropdown.parentNode.replaceChild(newMemberDropdown, memberDropdown);
    
    // Re-get elements after cloning
    const memberSearchEl = document.getElementById('member-search');
    const memberDropdownEl = document.getElementById('member-dropdown');
    
    // Filter on input
    memberSearchEl.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = window.currentMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm)
        );
        renderMemberDropdown(filtered);
    });
    
    // Show all members on focus
    memberSearchEl.addEventListener('focus', () => {
        if (window.currentMembers && window.currentMembers.length > 0) {
            renderMemberDropdown(window.currentMembers);
        }
    });
    
    // Handle member selection
    memberDropdownEl.addEventListener('click', (e) => {
        const item = e.target.closest('.dropdown-item');
        if (item) {
            // Check if manual entry option clicked
            if (item.getAttribute('data-manual-entry') === 'true') {
                switchToManualMode();
                memberDropdownEl.style.display = 'none';
                return;
            }
            
            // Normal member selection
            const memberId = item.getAttribute('data-member-id');
            const member = window.currentMembers.find(m => m.id == memberId);
            if (member) {
                handleMemberSelection(member);
            }
        }
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!memberSearchEl.contains(e.target) && !memberDropdownEl.contains(e.target)) {
            memberDropdownEl.style.display = 'none';
        }
    });
}

// Render member dropdown
function renderMemberDropdown(members) {
    const memberDropdown = document.getElementById('member-dropdown');
    
    let dropdownHTML = '';
    
    // Add member options
    if (members.length > 0) {
        dropdownHTML = members
            .map(member => `<div class="dropdown-item" data-member-id="${member.id}">${member.name}</div>`)
            .join('');
    }
    
    // Always add "No Member Found" option at the bottom
    dropdownHTML += `
        <div class="dropdown-item" data-manual-entry="true" style="border-top: 1px solid #e5e7eb; margin-top: 8px; padding-top: 12px; color: #D4A024; font-weight: 600;">
            🔍 No Member Found? Click here to enter manually
        </div>
    `;
    
    memberDropdown.innerHTML = dropdownHTML;
    memberDropdown.style.display = 'block';
}

// Handle member selection - auto fill
function handleMemberSelection(member) {
    const quickMode = document.getElementById('quick-reg-mode');
    const autofilledDetails = document.getElementById('autofilled-details');
    const memberDropdown = document.getElementById('member-dropdown');
    
    // Hide dropdowns and quick mode
    memberDropdown.style.display = 'none';
    quickMode.style.display = 'none';
    
    // Show autofilled details
    autofilledDetails.style.display = 'block';
    
    // Populate autofilled fields - use correct IDs
    const nameElement = document.getElementById('autofilled-name');
    const emailElement = document.getElementById('email-quick');
    const mobileElement = document.getElementById('mobile-quick');
    
    if (nameElement) nameElement.textContent = member.name;
    if (emailElement) emailElement.value = member.email || '';
    if (mobileElement) mobileElement.value = member.mobile || '';
    
    // Store in registration data
    registrationData.autofilledMember = member;
    registrationData.clubName = document.getElementById('club-search-quick').value;
}

// Switch to manual mode
function switchToManualMode() {
    const quickMode = document.getElementById('quick-reg-mode');
    const manualMode = document.getElementById('manual-reg-mode');
    const autofilledDetails = document.getElementById('autofilled-details');
    
    quickMode.style.display = 'none';
    manualMode.style.display = 'block';
    autofilledDetails.style.display = 'none';
    
    // Pre-fill club if selected
    const selectedClub = document.getElementById('club-search-quick').value;
    if (selectedClub) {
        const clubSelect = document.getElementById('club-name');
        for (let i = 0; i < clubSelect.options.length; i++) {
            if (clubSelect.options[i].text === selectedClub) {
                clubSelect.selectedIndex = i;
                break;
            }
        }
    }
    
    // Clear autofilled data
    delete registrationData.autofilledMember;
}

// Show review screen with collected data
function showReview() {
    let fullName, mobile, email, clubName, clubId;
    
    // Check which mode is active
    const guestMode = document.getElementById('guest-reg-mode');
    const autofilledDetails = document.getElementById('autofilled-details');
    const manualMode = document.getElementById('manual-reg-mode');
    
    if (guestMode && guestMode.style.display !== 'none') {
        // Guest mode - club is optional
        fullName = document.getElementById('guest-name').value.trim();
        mobile = document.getElementById('guest-mobile').value.trim();
        email = document.getElementById('guest-email').value.trim();
        const guestClubInput = document.getElementById('guest-club').value.trim();
        
        clubName = guestClubInput || 'Guest'; // Use input or default to 'Guest'
        clubId = 0;
        
    } else if (autofilledDetails && autofilledDetails.style.display !== 'none') {
        // Quick mode - autofilled from member selection - use correct IDs
        if (!registrationData.autofilledMember) {
            alert('Please select a member or switch to manual entry');
            return;
        }
        
        fullName = registrationData.autofilledMember.name;
        const emailInput = document.getElementById('email-quick');
        const mobileInput = document.getElementById('mobile-quick');
        email = emailInput ? emailInput.value.trim() : '';
        mobile = mobileInput ? mobileInput.value.trim() : '';
        clubName = registrationData.clubName;
        
        // Get club ID from stored clubs list
        const club = window.clubsList?.find(c => c.name === clubName);
        clubId = club ? club.id : 0;
        
    } else if (manualMode && manualMode.style.display !== 'none') {
        // Manual mode - user typed everything
        fullName = document.getElementById('full-name').value.trim();
        mobile = document.getElementById('mobile').value.trim();
        email = document.getElementById('email').value.trim();
        clubName = document.getElementById('club-name').value;
        
        // Get club ID from selected option
        const clubSelect = document.getElementById('club-name');
        const selectedOption = clubSelect.options[clubSelect.selectedIndex];
        clubId = selectedOption ? selectedOption.getAttribute('data-id') : null;
        if (!clubId) {
            clubId = clubSelect.getAttribute('data-selected-club-id');
        }
        
    } else {
        alert('Please complete the registration form');
        return;
    }
    
    const mealPreference = registrationData.mealPreference;
    const tshirtSize = document.getElementById('tshirt-size').value;
    
    console.log('🏢 Selected club:', clubName);
    console.log('🏢 Club ID:', clubId);
    
    // For guest mode, club is not required
    const isGuestMode = guestMode && guestMode.style.display !== 'none';
    
    // Validate all required fields with specific error messages
    if (!fullName) {
        alert('❌ Please enter your full name');
        return;
    }
    
    if (!mobile) {
        alert('❌ Please enter your mobile number');
        return;
    }
    
    if (!mealPreference) {
        alert('❌ Please select your meal preference');
        return;
    }
    
    if (!tshirtSize) {
        alert('❌ Please select your T-Shirt size');
        return;
    }
    
    if (!isGuestMode && !clubName) {
        alert('❌ Please select your club');
        return;
    }
    
    // Email validation (only if provided)
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('❌ Please enter a valid email address');
            return;
        }
    }
    
    // Phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(mobile)) {
        alert('❌ Please enter a valid 10-digit mobile number');
        return;
    }
    
    // Update registration data
    registrationData.fullName = fullName;
    registrationData.mobile = mobile;
    registrationData.tshirtSize = tshirtSize;
    registrationData.email = email || 'Not Provided';
    registrationData.clubName = clubName;
    registrationData.clubId = clubId ? parseInt(clubId) : 0;
    
    // Populate review screen
    document.getElementById('review-type').textContent = registrationData.typeName;
    // review-price removed - amount shown in pay button only
    
    document.getElementById('review-name').textContent = fullName;
    document.getElementById('review-mobile').textContent = mobile;
    document.getElementById('review-email').textContent = email;
    document.getElementById('review-club').textContent = clubName;
    document.getElementById('review-meal').textContent = mealPreference;
    document.getElementById('review-tshirt').textContent = tshirtSize;
    
    // Show review screen
    showScreen('screen-review');
    
    // Also populate payment screen
    document.getElementById('payment-type').textContent = registrationData.typeName;
    document.getElementById('payment-amount').textContent = `₹${registrationData.price.toLocaleString('en-IN')}`;

    // Preserve original price for coupon/reset logic
    if (!registrationData.originalPrice) registrationData.originalPrice = registrationData.price;

    // Reset coupon UI
    const couponMsgEl = document.getElementById('coupon-message');
    if (couponMsgEl) {
        couponMsgEl.style.display = 'none';
        couponMsgEl.textContent = '';
    }
}

// Generate unique order ID for Cashfree
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
        registrationData.orderId = orderId;
        
        console.log('📦 Order ID:', orderId);
        
        // Check if running on localhost
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        
        if (isLocalhost) {
            console.log('🧪 LOCALHOST MODE - Using mock payment gateway');
            
            // Use final_amount (after discount) if available, otherwise original price
            const paymentAmount = registrationData.final_amount || registrationData.price;
            
            // Store data for mock gateway and callback
            sessionStorage.setItem('pendingRegistration', JSON.stringify(registrationData));
            sessionStorage.setItem('cashfreeOrderId', orderId);
            
            // Redirect to mock payment gateway
            const mockPaymentUrl = `payment-gateway.html?` +
                `purpose=${encodeURIComponent(registrationData.typeName)}` +
                `&amount=${paymentAmount}` +
                `&name=${encodeURIComponent(registrationData.fullName)}` +
                `&email=${encodeURIComponent(registrationData.email)}` +
                `&phone=${registrationData.mobile}` +
                `&order_id=${orderId}`;
            
            console.log('🔄 Redirecting to mock payment gateway...');
            console.log('🔗 Payment URL:', mockPaymentUrl);
            
            window.location.href = mockPaymentUrl;
            return;
        }
        
        // PRODUCTION MODE - Use real Cashfree API
        console.log('🌐 PRODUCTION MODE - Calling Cashfree API...');
        
        // Use final_amount (after discount) if available, otherwise original price
        const paymentAmount = registrationData.final_amount || registrationData.price;
        
        const paymentData = {
            confirmationId: registrationData.confirmationId,
            orderId: orderId,
            amount: paymentAmount,
            fullName: registrationData.fullName,
            mobile: registrationData.mobile,
            email: registrationData.email,
            registrationType: registrationData.typeName,
            clubName: registrationData.clubName || '',
            clubId: registrationData.clubId || 0,
            mealPreference: registrationData.mealPreference,
            tshirtSize: registrationData.tshirtSize,
            qrData: registrationData.qrCode
        };
        
        console.log('📦 Payment data:', paymentData);
        console.log('🏢 Club ID being sent:', registrationData.clubId);
        
        // Call Cashfree API
        const response = await fetch('/api/cashfree/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
        });
        
        // Check if response is OK before parsing JSON
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:', errorText);
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Cashfree response:', result);
        
        if (result.success && result.paymentSessionId) {
            registrationData.paymentSessionId = result.paymentSessionId;
            
            sessionStorage.setItem('pendingRegistration', JSON.stringify(registrationData));
            sessionStorage.setItem('cashfreeOrderId', result.orderId);
            
            console.log('� Opening Cashfree checkout with payment session ID...');
            
            // Initialize Cashfree SDK
            const cashfree = Cashfree({
                mode: "production" // Production mode for live payments
            });
            
            // Open Cashfree checkout
            let checkoutOptions = {
                paymentSessionId: result.paymentSessionId,
                redirectTarget: "_self" // Opens in same tab
            };
            
            console.log('🔄 Opening Cashfree checkout...');
            cashfree.checkout(checkoutOptions);
            
        } else {
            console.error('❌ Payment failed:', result.error);
            alert('Payment initiation failed: ' + (result.error || 'Unknown error'));
            payBtn.disabled = false;
            payBtn.innerHTML = originalText;
        }
        
    } catch (error) {
        console.error('💥 Payment error:', error);
        alert('Payment initiation failed. Please try again.\n\nError: ' + error.message);
        const payBtn = document.querySelector('#screen-payment .btn-primary');
        if (payBtn) {
            payBtn.disabled = false;
            payBtn.textContent = 'PAY NOW';
        }
    }
}

// Verify payment with backend and show success
async function verifyPaymentAndShowSuccess(orderId, pendingData) {
    try {
        console.log('🔄 Verifying payment with backend...', orderId);
        
        // Show loading state
        showScreen('screen-banner');
        const bannerContent = document.querySelector('.banner-content');
        if (bannerContent) {
            bannerContent.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="border: 4px solid #f3f3f3; border-top: 4px solid #D4AF37; 
                                border-radius: 50%; width: 60px; height: 60px; 
                                animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <h2 style="color: #2C2416; margin-bottom: 10px;">Verifying Payment...</h2>
                    <p style="color: #666;">Please wait while we confirm your payment</p>
                </div>
            `;
        }
        
        // Call backend to verify payment
        const response = await fetch(`/api/cashfree/verify?orderId=${orderId}`);
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response OK:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Server responded with error:', errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        
        console.log('✅ Payment verification result:', result);
        
        if (result.success && result.paymentSuccess) {
            // Payment successful - update registrationData with backend response
            const parsedData = pendingData ? JSON.parse(pendingData) : {};
            
            // Use data from backend if available, fallback to session storage
            if (result.registration) {
                console.log('✅ Using registration data from backend:', result.registration);
                const backendAmount = result.registration.amount || result.amount || 0;
                registrationData = {
                    fullName: result.registration.name,
                    mobile: result.registration.mobile,
                    email: result.registration.email || 'Not Provided',
                    clubName: result.registration.clubName || 'Not specified',
                    clubId: result.registration.clubId,
                    typeName: result.registration.registrationType,
                    price: backendAmount,
                    amount: backendAmount, // Alias for consistency
                    mealPreference: result.registration.mealPreference,
                    confirmationId: result.registration.confirmationId,
                    paymentStatus: 'Paid',
                    transactionId: result.transactionId || orderId,
                    orderId: orderId,
                    type: parsedData.type // Keep original type key for prefix lookup
                };
            } else {
                console.log('⚠️ No registration data from backend, using session data');
                registrationData = parsedData;
                registrationData.paymentStatus = 'Paid';
                registrationData.transactionId = result.transactionId || orderId;
                registrationData.orderId = orderId;
                
                // Safeguard: If session data is also empty/invalid, show error
                if (!registrationData.fullName || !registrationData.price) {
                    console.error('❌ No valid registration data available');
                    alert(`Payment successful but registration data not found.\n\nOrder ID: ${orderId}\n\nPlease contact support with this Order ID to complete your registration.`);
                    window.location.href = 'contact.html';
                    return;
                }
            }
            
            // Store updated data
            sessionStorage.setItem('registrationData', JSON.stringify(registrationData));
            sessionStorage.removeItem('pendingRegistration');
            sessionStorage.removeItem('cashfreeOrderId');
            
            console.log('🎉 Updated registration data:', registrationData);
            console.log('🎉 Payment verified! Showing success screen...');
            processPayment('success');
            
        } else if (result.success && !result.paymentSuccess) {
            // Payment still pending or failed
            console.log('⏳ Payment status:', result.status);
            
            if (result.status === 'ACTIVE' || result.status === 'PENDING') {
                // Payment is still processing
                const processingMsg = '⏳ PAYMENT PROCESSING\n\n' +
                    'Your payment is being verified by the payment gateway.\n\n' +
                    'Order ID: ' + orderId + '\n\n' +
                    '✅ Once payment is confirmed, you will:\n' +
                    '• Receive your Registration ID\n' +
                    '• Get WhatsApp/Email confirmation\n\n' +
                    '⏱️ This usually takes a few seconds.\n\n' +
                    'Would you like to check again?';
                    
                if (confirm(processingMsg)) {
                    // Retry verification after a delay
                    setTimeout(() => {
                        verifyPaymentAndShowSuccess(orderId, pendingData);
                    }, 3000);
                } else {
                    alert('No worries! Your registration will be confirmed once payment is verified.\n\n' +
                          'Order ID: ' + orderId + '\n\n' +
                          'You will receive confirmation via WhatsApp: +91 99805 57785');
                    window.location.href = 'index.html';
                }
            } else {
                // Payment failed
                const failureMsg = '❌ PAYMENT NOT SUCCESSFUL\n\n' +
                    '⚠️ Your payment could not be completed.\n\n' +
                    'Order ID: ' + orderId + '\n\n' +
                    '✅ WHAT TO DO:\n' +
                    '1. If money was deducted from your account:\n' +
                    '   • Take screenshot of payment confirmation\n' +
                    '   • WhatsApp to: +91 99805 57785\n' +
                    '   • Include Order ID: ' + orderId + '\n' +
                    '   • We will verify and confirm manually\n\n' +
                    '2. If no money was deducted:\n' +
                    '   • You can try registering again\n' +
                    '   • Use the same details\n\n' +
                    '💡 Note: Registration ID will be generated only after successful payment verification.';
                
                alert(failureMsg);
                window.location.href = 'index.html';
            }
            
        } else {
            // Verification failed
            console.error('❌ Payment verification failed:', result.error);
            
            const retryMsg = '⚠️ VERIFICATION ISSUE\n\n' +
                'We could not verify your payment status automatically.\n\n' +
                'Order ID: ' + orderId + '\n\n' +
                '✅ WHAT TO DO:\n' +
                '1. Try verifying again (click OK below)\n\n' +
                '2. If retry fails, WhatsApp to: +91 99805 57785\n' +
                '   • Order ID: ' + orderId + '\n' +
                '   • Screenshot of payment\n' +
                '   • UPI Transaction ID (if available)\n\n' +
                '💡 Your registration will be confirmed once payment is verified.\n' +
                'Registration ID will be generated after confirmation.\n\n' +
                'Would you like to retry verification now?';
            
            if (confirm(retryMsg)) {
                setTimeout(() => {
                    verifyPaymentAndShowSuccess(orderId, pendingData);
                }, 2000);
            } else {
                alert('No problem! WhatsApp your payment details to +91 99805 57785\n\n' +
                      'Include Order ID: ' + orderId);
                window.location.href = 'index.html';
            }
        }
        
    } catch (error) {
        console.error('💥 Payment verification error:', error);
        console.error('💥 Error stack:', error.stack);
        console.error('💥 Error message:', error.message);
        
        const errorMsg = '⚠️ VERIFICATION ERROR\n\n' +
            'Technical error while verifying payment.\n\n' +
            'Order ID: ' + orderId + '\n' +
            'Error: ' + error.message + '\n\n' +
            '✅ WHAT TO DO:\n' +
            'WhatsApp to: +91 99805 57785\n\n' +
            'Send:\n' +
            '• Order ID: ' + orderId + '\n' +
            '• Payment screenshot\n' +
            '• Mention: "Verification error"\n\n' +
            '💡 If payment was successful, we will:\n' +
            '• Verify your payment manually\n' +
            '• Generate your Registration ID\n' +
            '• Send confirmation within 24 hours';
        
        alert(errorMsg);
        window.location.href = 'index.html';
    }
}

// Legacy alias for compatibility
async function initiateInstamojoPayment() {
    return await initiateCashfreePayment();
}

// Process payment
function processPayment(status) {
    console.log('💳 Processing payment with status:', status);
    
    if (status === 'success') {
        console.log('✅ Payment successful! Generating confirmation...');
        
        // Use confirmation ID from backend if available, otherwise generate
        let confirmationId = registrationData.confirmationId;
        
        if (!confirmationId) {
            console.log('⚠️ No confirmation ID from backend, generating new one');
            // Get registration type prefix
            const typeKey = Object.keys(registrationTypes).find(
                key => registrationTypes[key].name === registrationData.typeName
            );
            const prefix = registrationPrefixes[typeKey] || 'SS';
            
            // Get club number (2 digits, padded)
            const clubNumber = registrationData.clubId ? registrationData.clubId.toString().padStart(2, '0') : '00';
            
            // Get meal specifier (V=Veg, N=Non-Veg)
            const mealCode = registrationData.mealPreference === 'Veg' ? 'V' : 'N';
            
            // Generate 4-digit series number
            const seriesNumber = Date.now().toString().slice(-4);
            
            // Format: XXCCM#### (e.g., RN15V1234)
            confirmationId = `${prefix}${clubNumber}${mealCode}${seriesNumber}`;
            registrationData.confirmationId = confirmationId;
        }
        
        // Use actual Cashfree Order ID
        const transactionId = registrationData.orderId || registrationData.transactionId || 'ORDER_' + Date.now();
        const paymentDate = new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        registrationData.transactionId = transactionId;
        registrationData.paymentDate = paymentDate;
        
        console.log('🎫 Confirmation ID:', confirmationId);
        console.log('🔢 Cashfree Order ID:', transactionId);
        console.log('📋 Final registration data:', registrationData);
        
        // Populate refined acknowledgment page (with null checks)
        const setElementText = (id, text) => {
            const element = document.getElementById(id);
            if (element) element.textContent = text || 'Not Provided';
        };
        
        setElementText('confirmation-id-display', confirmationId);
        setElementText('ack-name', registrationData.fullName);
        setElementText('ack-type', registrationData.typeName);
        setElementText('ack-mobile', registrationData.mobile);
        setElementText('ack-club', registrationData.clubName || 'Not specified');
        setElementText('ack-meal', registrationData.mealPreference);
        
        // Safe amount display with null check
        const amount = registrationData.price || registrationData.amount || 0;
        setElementText('ack-amount', `₹${amount.toLocaleString('en-IN')}`);
        
        setElementText('ack-txn', transactionId);
        setElementText('ack-date', paymentDate); // Optional field
        
        console.log('📝 Acknowledgment page populated with all details');
        console.log('🎉 Showing success screen...');
        
        // Show success screen
        showScreen('screen-success');
        
        // Auto-download PDF after 2 seconds
        setTimeout(() => {
            console.log('🤖 Auto-downloading PDF...');
            downloadReceiptPDF();
        }, 2000);
        
        // In real implementation:
        // 1. Send data to backend API
        // 2. Store in database
        // 3. Trigger WhatsApp confirmation (NEXT TO IMPLEMENT)
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

// Download acknowledgment as PDF (using ticket design)
function downloadAsPDF() {
    try {
        const ticket = document.getElementById('registration-ticket');
        
        // Capture the ticket as canvas
        html2canvas(ticket, {
            backgroundColor: '#FFFFFF',
            scale: 2,
            logging: false,
            useCORS: true,
            windowWidth: 794,  // A4 width in pixels at 96 DPI (210mm)
            windowHeight: 1123 // A4 height in pixels at 96 DPI (297mm)
        }).then(canvas => {
            const { jsPDF } = window.jspdf;
            
            // Create PDF in A4 size
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Get canvas dimensions
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Add image to PDF
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            
            // Save PDF
            const filename = `SNEHA-SAURABHA-Ticket-${document.getElementById('confirmation-id').textContent}.pdf`;
            pdf.save(filename);
            
            console.log('✅ PDF downloaded:', filename);
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        alert('Unable to generate PDF. Please ensure you have internet connection for the required libraries.');
    }
}

// Download acknowledgment as Image (A4 size)
function downloadAsImage() {
    try {
        const ticket = document.getElementById('registration-ticket');
        
        html2canvas(ticket, {
            backgroundColor: '#FFFFFF',
            scale: 3, // Higher resolution for better quality
            logging: false,
            useCORS: true,
            windowWidth: 794,  // A4 width in pixels at 96 DPI (210mm)
            windowHeight: 1123 // A4 height in pixels at 96 DPI (297mm)
        }).then(canvas => {
            const link = document.createElement('a');
            const filename = `SNEHA-SAURABHA-Ticket-${document.getElementById('confirmation-id').textContent}.png`;
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
            console.log('✅ Image downloaded:', filename);
        });
    } catch (error) {
        console.error('Image generation error:', error);
        alert('Unable to generate image. Please ensure you have internet connection for html2canvas library.');
    }
}

// Download Registration Receipt as PDF using screenshot
async function downloadReceiptPDF() {
    console.log('📄 Download PDF clicked');
    console.log('📋 Registration Data:', registrationData);
    
    if (!registrationData.confirmationId && !registrationData.registrationId) {
        alert('⚠️ Receipt not ready. Please complete payment first.');
        return;
    }
    
    let button = null;
    let originalText = '';
    
    try {
        // Show loading message
        button = event ? event.target.closest('button') : null;
        originalText = button ? button.innerHTML : '';
        if (button) {
            button.innerHTML = '⏳ Generating PDF...';
            button.disabled = true;
        }
        
        // Get the acknowledgment screen element - try multiple IDs
        let receiptElement = document.getElementById('receipt-container');
        if (!receiptElement) {
            receiptElement = document.getElementById('screen-success');
        }
        if (!receiptElement) {
            receiptElement = document.querySelector('.acknowledgment-container');
        }
        
        if (!receiptElement) {
            throw new Error('Receipt element not found. Please ensure you are on the success page.');
        }
        
        console.log('📸 Capturing screenshot of:', receiptElement.id || receiptElement.className);
        
        // Use html2canvas to capture the screen
        const canvas = await html2canvas(receiptElement, {
            scale: 2, // Higher quality
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: receiptElement.scrollWidth,
            windowHeight: receiptElement.scrollHeight
        });
        
        console.log('✅ Screenshot captured, converting to PDF...');
        
        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png');
        
        // Create PDF with jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Calculate dimensions to fit A4
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add additional pages if content is longer than one page
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Save PDF
        pdf.save(`SNEHA-SAURABHA-Receipt-${registrationData.confirmationId}.pdf`);
        
        console.log('✅ PDF downloaded successfully!');
        console.log('📄 PDF pages:', pdf.internal.getNumberOfPages());
        
        // Restore button
        if (button) {
            button.innerHTML = originalText;
            button.disabled = false;
        }
        
    } catch (error) {
        console.error('❌ PDF generation error:', error);
        alert('⚠️ Failed to generate PDF: ' + error.message);
        
        // Restore button
        if (button && originalText) {
            button.innerHTML = originalText;
            button.disabled = false;
        }
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

// Clear club selection in manual mode
function clearClubSelection() {
    const clubSearchInput = document.getElementById('club-search');
    const clearButton = document.getElementById('clear-club');
    const clubOptions = document.getElementById('club-options');
    
    if (clubSearchInput) {
        clubSearchInput.value = '';
        clearButton.style.display = 'none';
        if (clubOptions) clubOptions.style.display = 'none';
    }
}

// Clear club selection in quick mode
function clearClubSelectionQuick() {
    const clubSearchInput = document.getElementById('club-search-quick');
    const clearButton = document.getElementById('clear-club-quick');
    const clubDropdown = document.getElementById('club-dropdown-quick');
    const memberWrapper = document.getElementById('member-selection-wrapper');
    
    if (clubSearchInput) {
        clubSearchInput.value = '';
        clearButton.style.display = 'none';
        if (clubDropdown) clubDropdown.style.display = 'none';
        if (memberWrapper) memberWrapper.style.display = 'none';
    }
}

// Clear member selection in quick mode
function clearMemberSelection() {
    const memberSearchInput = document.getElementById('member-search');
    const clearButton = document.getElementById('clear-member');
    const memberDropdown = document.getElementById('member-dropdown');
    const autofilledDetails = document.getElementById('autofilled-details');
    
    if (memberSearchInput) {
        memberSearchInput.value = '';
        clearButton.style.display = 'none';
        if (memberDropdown) memberDropdown.style.display = 'none';
        if (autofilledDetails) autofilledDetails.style.display = 'none';
    }
}

// Expose clear functions globally
window.clearClubSelection = clearClubSelection;
window.clearClubSelectionQuick = clearClubSelectionQuick;
window.clearMemberSelection = clearMemberSelection;

// Clear autofilled details and go back to member selection
function clearAutofilledDetails() {
    const quickMode = document.getElementById('quick-reg-mode');
    const autofilledDetails = document.getElementById('autofilled-details');
    const memberSearch = document.getElementById('member-search');
    const clubSearchQuick = document.getElementById('club-search-quick');
    
    // Hide autofilled, show quick mode back
    if (autofilledDetails) autofilledDetails.style.display = 'none';
    if (quickMode) quickMode.style.display = 'block';
    
    // Clear the member search input
    if (memberSearch) memberSearch.value = '';
    
    // Show member selection wrapper again
    const memberWrapper = document.getElementById('member-selection-wrapper');
    if (memberWrapper) memberWrapper.style.display = 'block';
    
    // Clear registration data
    delete registrationData.autofilledMember;
    
    // Focus back on member search
    if (memberSearch) memberSearch.focus();
}

window.clearAutofilledDetails = clearAutofilledDetails;

// ====================================
// BYPASS CODE FUNCTIONS
// ====================================

// Bypass code validation constants
const BYPASS_CODES = {
    'mallige2830': 'manual-S',
    'asha1990': 'manual-B',
    'prahlad1966': 'manual-P'
};

let verifiedBypassCode = null; // Store verified code for step 2

function openBypassCodeModal(event) {
    if (event) event.preventDefault();
    
    const modal = document.getElementById('bypassCodeModal');
    const step1 = document.getElementById('bypassStep1');
    const step2 = document.getElementById('bypassStep2');
    const input = document.getElementById('bypassCodeInput');
    const utrInput = document.getElementById('utrInput');
    const codeError = document.getElementById('bypassCodeError');
    const utrError = document.getElementById('utrError');
    
    // Reset to step 1
    if (step1) step1.style.display = 'block';
    if (step2) step2.style.display = 'none';
    if (input) input.value = '';
    if (utrInput) utrInput.value = '';
    if (codeError) codeError.style.display = 'none';
    if (utrError) utrError.style.display = 'none';
    verifiedBypassCode = null;
    
    // Show modal
    if (modal) modal.style.display = 'flex';
    
    // Focus on input
    setTimeout(() => { if (input) input.focus(); }, 100);
}

function closeBypassModal() {
    const modal = document.getElementById('bypassCodeModal');
    if (modal) modal.style.display = 'none';
    verifiedBypassCode = null;
}

// Alias for backward compatibility
const closeBypassCodeModal = closeBypassModal;

function verifyBypassCode() {
    const input = document.getElementById('bypassCodeInput');
    const error = document.getElementById('bypassCodeError');
    const step1 = document.getElementById('bypassStep1');
    const step2 = document.getElementById('bypassStep2');
    
    if (!input || !error) return;
    
    const code = input.value.trim();
    
    if (!code) {
        error.textContent = '⚠️ Please enter a bypass code';
        error.style.display = 'block';
        return;
    }
    
    // Validate bypass code
    if (!BYPASS_CODES[code]) {
        error.textContent = '❌ Invalid bypass code. Please try again.';
        error.style.display = 'block';
        input.value = '';
        input.focus();
        return;
    }
    
    // Code is valid - move to step 2
    verifiedBypassCode = code;
    error.style.display = 'none';
    
    if (step1) step1.style.display = 'none';
    if (step2) {
        step2.style.display = 'block';
        const utrInput = document.getElementById('utrInput');
        if (utrInput) {
            setTimeout(() => utrInput.focus(), 100);
        }
    }
}

async function submitBypassRegistration() {
    const utrInput = document.getElementById('utrInput');
    const utrError = document.getElementById('utrError');
    
    if (!utrInput || !utrError) return;
    
    const utr = utrInput.value.trim();
    
    if (!utr) {
        utrError.textContent = '⚠️ Please enter UTR/Transaction ID';
        utrError.style.display = 'block';
        return;
    }
    
    if (!verifiedBypassCode || !BYPASS_CODES[verifiedBypassCode]) {
        utrError.textContent = '❌ Invalid session. Please start over.';
        utrError.style.display = 'block';
        return;
    }
    
    const paymentStatus = BYPASS_CODES[verifiedBypassCode];
    
    try {
        // Close modal
        closeBypassModal();
        
        // Show loading
        alert('Processing manual registration...');
        
        // Create registration with manual payment status
        const response = await fetch('/api/registrations/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: registrationData.fullName,
                email: registrationData.email || 'Not Provided',
                mobile: registrationData.mobile,
                clubName: registrationData.clubName,
                clubId: registrationData.clubId || 0,
                registrationType: registrationData.typeName,
                amount: registrationData.price,
                mealPreference: registrationData.mealPreference,
                tshirtSize: registrationData.tshirtSize,
                orderId: utr, // Store UTR as order ID
                transactionId: `MANUAL-${verifiedBypassCode}-${Date.now()}`,
                paymentStatus: paymentStatus, // manual-S, manual-B, or manual-P
                paymentMethod: 'Manual Registration'
            })
        });
        
        const result = await response.json();
        
        if (result.success && result.registration) {
            // Store registration ID and confirmation data
            registrationData.registrationId = result.registration.registration_id;
            registrationData.confirmationId = result.registration.registration_id; // For PDF generation
            registrationData.paymentStatus = paymentStatus;
            registrationData.utrNumber = utr;
            registrationData.transactionId = `MANUAL-${verifiedBypassCode}-${Date.now()}`;
            
            // Populate success screen using same format as Cashfree payment
            const setElementText = (id, text) => {
                const element = document.getElementById(id);
                if (element) element.textContent = text || 'Not Provided';
            };
            
            const currentDate = new Date().toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            
            setElementText('confirmation-id-display', result.registration.registration_id);
            setElementText('ack-name', registrationData.fullName);
            setElementText('ack-type', registrationData.typeName);
            setElementText('ack-mobile', registrationData.mobile);
            setElementText('ack-club', registrationData.clubName);
            setElementText('ack-meal', registrationData.mealPreference);
            setElementText('ack-amount', `₹${registrationData.price.toLocaleString('en-IN')}`);
            setElementText('ack-txn', utr); // Show UTR as transaction ID
            setElementText('ack-date', currentDate);
            
            console.log('📝 Manual registration acknowledgment page populated');
            console.log('📋 Registration data ready for PDF:', registrationData);
            
            // Show success screen
            showScreen('screen-success');
            
            // Auto-trigger PDF download after 1 second (gives time for screen to render)
            console.log('📄 Auto-downloading receipt PDF...');
            setTimeout(() => {
                try {
                    downloadReceiptPDF();
                } catch (pdfError) {
                    console.error('❌ PDF download failed:', pdfError);
                }
            }, 1000);
            
            alert('✅ Registration successful! ID: ' + result.registration.registration_id + '\n\n📥 Receipt will download automatically.');
            console.log('✅ Manual registration completed:', result.registration.registration_id);
        } else {
            alert('❌ Registration failed: ' + (result.error || 'Unknown error'));
            // Reopen modal with error
            openBypassCodeModal();
            const utrError = document.getElementById('utrError');
            if (utrError) {
                utrError.textContent = result.error || 'Registration failed';
                utrError.style.display = 'block';
            }
        }
    } catch (err) {
        console.error('Bypass code error:', err);
        alert('Error processing manual registration. Please try again.');
    }
}

async function processManualRegistration(result) {
    try {
        // Show success screen with registration details
        document.getElementById('success-name').textContent = result.registration.name;
        document.getElementById('success-reg-id').textContent = result.registration.registration_id;
        document.getElementById('success-type').textContent = result.registration.registration_type;
        document.getElementById('success-amount').textContent = `₹${result.registration.registration_amount.toLocaleString('en-IN')}`;
        document.getElementById('success-club').textContent = result.registration.club;
        document.getElementById('success-meal').textContent = result.registration.meal_preference;
        document.getElementById('success-mobile').textContent = result.registration.mobile;
        document.getElementById('success-email').textContent = result.registration.email || 'N/A';
        
        // Show success screen
        showScreen('screen-success');
        
        // Trigger WhatsApp confirmation (handled by backend)
        console.log('Manual registration completed:', result.registration.registration_id);
    } catch (err) {
        console.error('Error processing manual registration:', err);
        alert('Registration saved but there was an error displaying the confirmation. Please contact support.');
    }
}

// ===================================================================================
// GLOBAL SCOPE EXPOSURE - All onclick handlers must be on window object
// ===================================================================================

// Existing bypass code functions
window.openBypassCodeModal = openBypassCodeModal;
window.closeBypassModal = closeBypassCodeModal;
window.verifyBypassCode = verifyBypassCode;
window.submitBypassRegistration = submitBypassRegistration;

// PDF download function
window.downloadReceiptPDF = downloadReceiptPDF;

// ===================================================================================
// COUPON CODE SYSTEM - Simplified with Remove Button
// ===================================================================================

const VALID_COUPONS = {
    'TESTER9919': { discount: 'FULL-1', name: 'TEST MODE - ₹1 ONLY' }
};

let appliedDiscount = 0;
let appliedCouponCode = '';

// Apply coupon code with validation
window.applyCoupon = function() {
    const couponInput = document.getElementById('couponCode');
    const couponMessage = document.getElementById('couponMessage');
    const applyBtn = document.getElementById('couponApplyBtn');
    const removeBtn = document.getElementById('couponRemoveBtn');
    
    if (!couponInput || !couponMessage || !applyBtn || !removeBtn) return;
    
    const code = couponInput.value.trim().toUpperCase();
    
    // Clear previous messages
    couponMessage.textContent = '';
    couponMessage.className = 'coupon-simple-message';
    
    if (!code) {
        couponMessage.textContent = '⚠️ Please enter a coupon code';
        couponMessage.classList.add('error');
        return;
    }
    
    // Check if valid coupon
    if (VALID_COUPONS[code]) {
        appliedDiscount = VALID_COUPONS[code].discount;
        appliedCouponCode = code;
        
        // Special message for tester coupon
        let successMessage;
        if (appliedDiscount === 'FULL-1') {
            successMessage = `✅ ${VALID_COUPONS[code].name} applied! Price reduced to ₹1 for testing`;
        } else {
            successMessage = `✅ ${VALID_COUPONS[code].name} applied! You saved ₹${appliedDiscount}`;
        }
        
        couponMessage.textContent = successMessage;
        couponMessage.classList.add('success');
        
        // Update buttons
        applyBtn.style.display = 'none';
        removeBtn.style.display = 'block';
        couponInput.disabled = true;
        couponInput.style.opacity = '0.7';
        
        // Update final amount
        updateFinalAmount();
        
        // Store in registration data
        registrationData.discount = appliedDiscount === 'FULL-1' ? registrationData.price - 1 : appliedDiscount;
        registrationData.applied_coupon = appliedCouponCode;
        
    } else {
        // Invalid coupon
        couponMessage.textContent = '❌ Invalid coupon code. Please try again.';
        couponMessage.classList.add('error');
        couponInput.value = '';
        couponInput.focus();
    }
};

// Remove applied coupon
window.removeCoupon = function() {
    const couponInput = document.getElementById('couponCode');
    const couponMessage = document.getElementById('couponMessage');
    const applyBtn = document.getElementById('couponApplyBtn');
    const removeBtn = document.getElementById('couponRemoveBtn');
    
    // Reset discount
    appliedDiscount = 0;
    appliedCouponCode = '';
    
    // Reset UI
    if (couponInput) {
        couponInput.value = '';
        couponInput.disabled = false;
        couponInput.style.opacity = '1';
    }
    if (applyBtn) applyBtn.style.display = 'block';
    if (removeBtn) removeBtn.style.display = 'none';
    if (couponMessage) {
        couponMessage.textContent = '';
        couponMessage.className = 'coupon-simple-message';
    }
    
    // Update amounts
    updateFinalAmount();
    
    // Clear from registration data
    delete registrationData.discount;
    delete registrationData.applied_coupon;
};

// Update final amount with discount
window.updateFinalAmount = function() {
    const paymentAmountSpan = document.getElementById('paymentAmount');
    
    // Get original amount from registration data (use 'price' not 'registration_amount')
    const originalAmount = registrationData.price || 0;
    
    // Handle special "FULL-1" discount (for tester9919 coupon)
    let finalAmount;
    if (appliedDiscount === 'FULL-1') {
        finalAmount = 1; // Set to ₹1 for testing
    } else {
        finalAmount = Math.max(0, originalAmount - appliedDiscount);
    }
    
    // Update payment button
    if (paymentAmountSpan) {
        paymentAmountSpan.textContent = `₹${finalAmount.toLocaleString('en-IN')}`;
    }
    
    // Update registration data with final amount
    registrationData.final_amount = finalAmount;
    
    console.log('💰 Amount updated:', {
        original: originalAmount,
        discount: appliedDiscount === 'FULL-1' ? `Full discount to ₹1` : appliedDiscount,
        final: finalAmount
    });
};

// Initialize coupon section when review screen loads
function initializeCouponSection() {
    // Reset coupon state
    appliedDiscount = 0;
    appliedCouponCode = '';
    
    const couponInput = document.getElementById('couponCode');
    const applyBtn = document.getElementById('couponApplyBtn');
    const removeBtn = document.getElementById('couponRemoveBtn');
    const couponMessage = document.getElementById('couponMessage');
    
    if (couponInput) {
        couponInput.value = '';
        couponInput.disabled = false;
        couponInput.style.opacity = '1';
    }
    if (applyBtn) {
        applyBtn.style.display = 'block';
    }
    if (removeBtn) {
        removeBtn.style.display = 'none';
    }
    if (couponMessage) {
        couponMessage.textContent = '';
        couponMessage.className = 'coupon-simple-message';
    }
    
    // Update amounts
    updateFinalAmount();
}

// Hook into existing showScreen function to initialize coupon section
const originalShowScreen = window.showScreen;
window.showScreen = function(screenId) {
    originalShowScreen(screenId);
    
    if (screenId === 'screen-review') {
        // Small delay to ensure DOM is ready
        setTimeout(initializeCouponSection, 100);
    }
};

console.log('✅ Simplified coupon system initialized with codes:', Object.keys(VALID_COUPONS));
console.log('✅ All global functions exposed to window object');
