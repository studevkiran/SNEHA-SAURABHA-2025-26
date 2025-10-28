// Admin Dashboard JavaScript
// Note: This is a frontend placeholder. In production, connect to backend API.

let isAuthenticated = false;
let registrations = [];

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // In production, verify credentials via API
    // For now, simple check
    if (username === 'admin' && password === 'admin123') {
        isAuthenticated = true;
        showDashboard();
        loadRegistrations();
    } else {
        alert('Invalid credentials');
    }
    
    return false;
}

// Show dashboard
function showDashboard() {
    document.getElementById('admin-login').classList.remove('active');
    document.getElementById('admin-dashboard').classList.add('active');
}

// Logout
function logout() {
    isAuthenticated = false;
    document.getElementById('admin-dashboard').classList.remove('active');
    document.getElementById('admin-login').classList.add('active');
    document.getElementById('login-form').reset();
}

// Load registrations (in production, fetch from API)
async function loadRegistrations() {
    // Sample data - replace with API call
    registrations = [
        {
            id: 'SS12345678',
            name: 'John Doe',
            mobile: '9876543210',
            email: 'john@example.com',
            clubName: 'Mysore',
            type: 'Rotarian',
            price: 7500,
            mealPreference: 'Veg',
            paymentStatus: 'Paid',
            verificationStatus: 'Verified',
            transactionId: 'TXN1234567890',
            registrationDate: '2025-10-28'
        }
    ];
    
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
    document.getElementById('total-revenue').textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
    document.getElementById('paid-count').textContent = paidCount;
    document.getElementById('pending-count').textContent = pendingCount;
    
    document.getElementById('veg-count').textContent = vegCount;
    document.getElementById('non-veg-count').textContent = nonVegCount;
    document.getElementById('jain-count').textContent = jainCount;
}

// Render registrations table
function renderRegistrationsTable() {
    const tbody = document.getElementById('registrations-tbody');
    tbody.innerHTML = '';
    
    registrations.forEach(reg => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${reg.id}</td>
            <td>${reg.name}</td>
            <td>${reg.mobile}</td>
            <td>${reg.email}</td>
            <td>${reg.clubName}</td>
            <td>${reg.type}</td>
            <td>₹${reg.price.toLocaleString('en-IN')}</td>
            <td>${reg.mealPreference}</td>
            <td><span class="status-badge status-${reg.paymentStatus.toLowerCase()}">${reg.paymentStatus}</span></td>
            <td><span class="status-badge ${reg.verificationStatus === 'Verified' ? 'status-paid' : 'status-pending'}">${reg.verificationStatus}</span></td>
            <td>${new Date(reg.registrationDate).toLocaleDateString('en-IN')}</td>
            <td>
                <button class="action-btn" onclick="viewDetails('${reg.id}')">View</button>
                <button class="action-btn" onclick="editRegistration('${reg.id}')">Edit</button>
                <button class="action-btn" onclick="resendConfirmation('${reg.id}')">Resend</button>
            </td>
        `;
        tbody.appendChild(row);
    });
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
    if (confirm(`Resend WhatsApp and email confirmation for registration ${id}?`)) {
        alert('Confirmation sent!\n\nIn production, this will trigger the WhatsApp and email APIs.');
    }
}
