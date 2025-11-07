// Admin Dashboard JavaScript
// Note: This is a frontend placeholder. In production, connect to backend API.

let isAuthenticated = false;
let registrations = [];

// Registration Types (synced from app.js)
const registrationTypes = {
    'rotarian': { name: 'Rotarian', price: 4500 },
    'rotarian-spouse': { name: 'Rotarian with Spouse', price: 7500 },
    'ann': { name: 'Ann', price: 3500 },
    'annet': { name: 'Annet', price: 2000 },
    'guest': { name: 'Guest', price: 4500 },
    'silver-donor': { name: 'Silver Donor', price: 20000 },
    'silver-sponsor': { name: 'Silver Sponsor', price: 25000 },
    'gold-sponsor': { name: 'Gold Sponsor', price: 50000 },
    'platinum-sponsor': { name: 'Platinum Sponsor', price: 75000 },
    'patron-sponsor': { name: 'Patron Sponsor', price: 100000 }
};

// Format amount in Indian lakhs system
function formatIndianCurrency(amount) {
    // Convert to string and reverse for easier processing
    const numStr = amount.toString();
    const len = numStr.length;
    
    if (len <= 3) {
        return '₹' + numStr;
    }
    
    let result = numStr.slice(-3); // Last 3 digits
    let remaining = numStr.slice(0, -3);
    
    // Add commas every 2 digits for Indian system
    while (remaining.length > 0) {
        if (remaining.length <= 2) {
            result = remaining + ',' + result;
            break;
        } else {
            result = remaining.slice(-2) + ',' + result;
            remaining = remaining.slice(0, -2);
        }
    }
    
    return '₹' + result;
}

// Populate registration type filter
function populateRegistrationTypeFilter() {
    const filterSelect = document.getElementById('filter-type');
    
    // Keep "All Types" option
    filterSelect.innerHTML = '<option value="">All Types</option>';
    
    // Add all registration types from registrationTypes object
    for (const [key, value] of Object.entries(registrationTypes)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = value.name;
        filterSelect.appendChild(option);
    }
    
    console.log('✅ Populated registration type filter with', Object.keys(registrationTypes).length, 'types');
}

// Handle login
async function handleLogin(event) {
    console.log('🔐 Login function called');
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('⚠️ Please enter both username and password');
        return false;
    }
    
    try {
        // Call the login API
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username.trim(),
                password: password.trim()
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Login successful!');
            // Store login state in session
            sessionStorage.setItem('adminLoggedIn', 'true');
            isAuthenticated = true;
            showDashboard();
            loadRegistrations();
        } else {
            console.log('❌ Login failed - invalid credentials');
            alert('❌ ' + (data.error || 'Invalid username or password'));
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('❌ Login failed. Please try again.');
    }
    
    return false;
}

// Show dashboard
function showDashboard() {
    console.log('📊 Showing dashboard...');
    
    const loginScreen = document.getElementById('admin-login');
    const dashboardScreen = document.getElementById('admin-dashboard');
    
    console.log('🔍 Login screen element:', loginScreen);
    console.log('🔍 Dashboard screen element:', dashboardScreen);
    
    if (loginScreen && dashboardScreen) {
        // Remove active class from login
        loginScreen.classList.remove('active');
        // Add active class to dashboard
        dashboardScreen.classList.add('active');
        
        // FORCE with inline styles (override any CSS)
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'block';
        
        console.log('✅ Dashboard visible, login hidden');
    } else {
        console.error('❌ Could not find screen elements!');
        console.error('Login screen:', loginScreen);
        console.error('Dashboard screen:', dashboardScreen);
    }
}

// Logout
function logout() {
    isAuthenticated = false;
    document.getElementById('admin-dashboard').classList.remove('active');
    document.getElementById('admin-login').classList.add('active');
    document.getElementById('login-form').reset();
}

// Load registrations (fetch from API)
async function loadRegistrations() {
    try {
        console.log('📡 Fetching registrations from API...');
        
        // Show loading state
        const tableBody = document.querySelector('#registrations-table tbody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 20px;">Loading registrations...</td></tr>';
        }
        
        // Fetch from API
        const response = await fetch('/api/registrations/list');
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.registrations) {
            registrations = data.registrations.map(reg => ({
                id: reg.registration_id,
                name: reg.name,
                mobile: reg.mobile,
                email: reg.email,
                clubName: reg.club || 'N/A',
                type: reg.registration_type,
                price: reg.registration_amount,
                mealPreference: reg.meal_preference,
                paymentStatus: reg.payment_status,
                verificationStatus: reg.registration_status || 'Pending',
                transactionId: reg.transaction_id || 'N/A',
                registrationDate: new Date(reg.created_at).toLocaleDateString('en-IN')
            }));
            
            console.log(`✅ Loaded ${registrations.length} registrations from database`);
        } else {
            console.warn('⚠️ No registrations found');
            registrations = [];
        }
    } catch (error) {
        console.error('❌ Error loading registrations:', error);
        alert('Failed to load registrations. Using demo data for now.');
        
        // Fallback to minimal demo data if API fails
        registrations = [
            { id: 'DEMO001', name: 'Demo User', mobile: '9876543210', email: 'demo@example.com', clubName: 'Mysore', type: 'rotarian', price: 4500, mealPreference: 'Veg', paymentStatus: 'Paid', verificationStatus: 'Verified', transactionId: 'TXN_DEMO', registrationDate: new Date().toLocaleDateString('en-IN') }
        ];
    }
    
    updateDashboardStats();
    renderRegistrationsTable();
}

// Update dashboard statistics
function updateDashboardStats() {
    const totalRegistrations = registrations.length;
    const totalRevenue = registrations.reduce((sum, reg) => sum + reg.price, 0);
    const paidCount = registrations.filter(r => r.paymentStatus === 'Paid').length;
    const pendingCount = registrations.filter(r => r.paymentStatus === 'Pending').length;
    
    const vegCount = registrations.filter(r => r.mealPreference === 'Veg').length;
    const nonVegCount = registrations.filter(r => r.mealPreference === 'Non-Veg').length;
    const jainCount = registrations.filter(r => r.mealPreference === 'Jain').length;
    
    document.getElementById('total-registrations').textContent = totalRegistrations;
    document.getElementById('total-revenue').textContent = formatIndianCurrency(totalRevenue); // Use lakhs formatting
    document.getElementById('paid-count').textContent = paidCount;
    document.getElementById('pending-count').textContent = pendingCount;
    
    document.getElementById('veg-count').textContent = vegCount;
    document.getElementById('non-veg-count').textContent = nonVegCount;
    document.getElementById('jain-count').textContent = jainCount;
}

// Render registrations table (simplified - desktop compatible)
function renderRegistrationsTable() {
    const tbody = document.getElementById('registrations-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (registrations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #999;">No registrations found</td></tr>';
        return;
    }
    
    registrations.forEach(reg => {
        const row = document.createElement('tr');
        const typeName = registrationTypes[reg.type] ? registrationTypes[reg.type].name : reg.type;
        const paymentStatus = reg.paymentStatus || 'pending';
        const statusClass = paymentStatus === 'completed' ? 'status-paid' : 'status-pending';
        const statusText = paymentStatus === 'completed' ? 'Paid' : 'Pending';
        
        row.innerHTML = `
            <td><strong>${reg.id}</strong></td>
            <td>${reg.name}</td>
            <td>${reg.mobile}</td>
            <td>${reg.email || 'Not Provided'}</td>
            <td>${typeName}</td>
            <td style="font-weight: 600;">${formatIndianCurrency(reg.price)}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${new Date(reg.registrationDate).toLocaleDateString('en-IN')}</td>
        `;
        tbody.appendChild(row);
    });
}

// Sort table by column
let sortDirection = {};
function sortTable(column) {
    if (!sortDirection[column]) sortDirection[column] = 'asc';
    else sortDirection[column] = sortDirection[column] === 'asc' ? 'desc' : 'asc';
    
    registrations.sort((a, b) => {
        let aVal, bVal;
        
        switch(column) {
            case 'id': aVal = a.id; bVal = b.id; break;
            case 'name': aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase(); break;
            case 'mobile': aVal = a.mobile; bVal = b.mobile; break;
            case 'type': aVal = a.type; bVal = b.type; break;
            case 'price': aVal = a.price; bVal = b.price; break;
            case 'date': aVal = new Date(a.registrationDate); bVal = new Date(b.registrationDate); break;
            default: return 0;
        }
        
        if (aVal < bVal) return sortDirection[column] === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection[column] === 'asc' ? 1 : -1;
        return 0;
    });
    
    renderRegistrationsTable();
}

// Filter registrations
function filterRegistrations() {
    const typeFilter = document.getElementById('filter-type').value;
    const paymentFilter = document.getElementById('filter-payment').value;
    const mealFilter = document.getElementById('filter-meal').value;
    
    // In production, filter data or fetch from API with filters
    console.log('Filtering by:', { typeFilter, paymentFilter, mealFilter });
}

// Search registrations
function searchRegistrations() {
    const searchTerm = document.getElementById('search-box').value.toLowerCase();
    
    // In production, search through data or API
    console.log('Searching for:', searchTerm);
}

// Show manual entry modal
function showManualEntry() {
    const modal = document.getElementById('manual-entry-modal');
    modal.classList.add('active');
}

// Close manual entry modal
function closeManualEntry() {
    const modal = document.getElementById('manual-entry-modal');
    modal.classList.remove('active');
}

// Export data
function exportData(format) {
    alert(`Exporting data as ${format.toUpperCase()}...\n\nIn production, this will generate and download the file with all registration data.`);
    
    // Production implementation:
    // - CSV: Convert data to CSV format and download
    // - Excel: Use libraries like xlsx or exceljs
    // - PDF: Use jsPDF with table plugin
}

// View details
function viewDetails(id) {
    const reg = registrations.find(r => r.id === id);
    if (reg) {
        alert(`Registration Details:\n\nID: ${reg.id}\nName: ${reg.name}\nMobile: ${reg.mobile}\nEmail: ${reg.email}\nClub: ${reg.clubName}\nType: ${reg.type}\nAmount: ₹${reg.price}\nPayment: ${reg.paymentStatus}\n\nIn production, this will open a detailed view modal.`);
    }
}

// Edit registration
function editRegistration(id) {
    alert(`Edit registration ${id}\n\nIn production, this will open an edit form with the registration data.`);
}

// Resend confirmation
function resendConfirmation(id) {
    // Implement resend logic
    console.log('Resending confirmation for:', id);
    alert('Confirmation resent to registration: ' + id);
}

// Make functions globally available
window.handleLogin = handleLogin;
window.showDashboard = showDashboard;
window.logout = logout;
window.filterRegistrations = filterRegistrations;
window.searchRegistrations = searchRegistrations;
window.showManualEntry = showManualEntry;
window.closeManualEntry = closeManualEntry;
window.exportData = exportData;
window.viewDetails = viewDetails;
window.editRegistration = editRegistration;
window.resendConfirmation = resendConfirmation;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Admin Dashboard loaded');
    console.log('📝 Login with: admin / admin123');
    
    // Populate registration type filter with all types
    populateRegistrationTypeFilter();
});
