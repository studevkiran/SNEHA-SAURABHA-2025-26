// Admin Modal Functions for Delete Entry and WhatsApp Resend

// ============= DELETE ENTRY MODAL =============
function openDeleteEntryModal() {
    const modal = document.createElement('div');
    modal.id = 'deleteEntryModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px;';
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 20px; border-radius: 12px 12px 0 0;">
                <h2 style="margin: 0; font-size: 24px; display: flex; align-items: center; gap: 10px;">
                    <span>🗑️</span> Delete Registration Entry
                </h2>
            </div>
            <div style="padding: 25px;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #374151;">Enter Registration ID:</label>
                    <input type="text" id="deleteRegId" placeholder="e.g., REG-1731234567890-ABC123" style="width: 100%; padding: 12px; border: 2px solid #E5E7EB; border-radius: 8px; font-size: 14px;" onkeyup="if(event.key==='Enter') fetchRegistrationForDelete()">
                    <button onclick="fetchRegistrationForDelete()" style="width: 100%; margin-top: 10px; background: #3B82F6; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer;" onmouseover="this.style.background='#2563EB'" onmouseout="this.style.background='#3B82F6'">
                        🔍 Load Registration
                    </button>
                </div>
                <div id="deleteRegistrationDetails" style="display: none; background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #E5E7EB;">
                    <!-- Details will be loaded here -->
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="closeDeleteEntryModal()" style="flex: 1; background: #6B7280; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer;" onmouseover="this.style.background='#4B5563'" onmouseout="this.style.background='#6B7280'">
                        ✖ Cancel
                    </button>
                    <button id="confirmDeleteBtn" onclick="confirmDeleteEntry()" style="flex: 1; background: #EF4444; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; display: none;" onmouseover="this.style.background='#DC2626'" onmouseout="this.style.background='#EF4444'">
                        🗑️ Delete Entry
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeDeleteEntryModal() {
    const modal = document.getElementById('deleteEntryModal');
    if (modal) modal.remove();
}

async function fetchRegistrationForDelete() {
    const regId = document.getElementById('deleteRegId').value.trim();
    if (!regId) {
        alert('⚠️ Please enter a Registration ID');
        return;
    }

    try {
        const response = await fetch(`/api/registrations?registration_id=${regId}`);
        const data = await response.json();

        if (data.success && data.registrations && data.registrations.length > 0) {
            const reg = data.registrations[0];
            displayDeleteRegistrationDetails(reg);
        } else {
            alert('❌ Registration not found with ID: ' + regId);
        }
    } catch (error) {
        console.error('Error fetching registration:', error);
        alert('❌ Error loading registration. Please try again.');
    }
}

function displayDeleteRegistrationDetails(reg) {
    const detailsDiv = document.getElementById('deleteRegistrationDetails');
    detailsDiv.style.display = 'block';
    document.getElementById('confirmDeleteBtn').style.display = 'block';
    
    detailsDiv.innerHTML = `
        <h3 style="color: #DC2626; margin: 0 0 15px 0; font-size: 18px;">⚠️ Review Before Deletion</h3>
        <div style="display: grid; gap: 10px;">
            <div><strong>Registration ID:</strong> ${reg.registration_id}</div>
            <div><strong>Name:</strong> ${reg.name_prefix || ''} ${reg.name}</div>
            <div><strong>Mobile:</strong> ${reg.mobile}</div>
            <div><strong>Email:</strong> ${reg.email}</div>
            <div><strong>Type:</strong> ${reg.registration_type}</div>
            <div><strong>Club:</strong> ${reg.club_name}</div>
            <div><strong>Amount:</strong> ₹${reg.amount}</div>
            <div><strong>Payment Status:</strong> <span style="color: ${reg.payment_status === 'SUCCESS' ? '#10B981' : '#EF4444'};">${reg.payment_status}</span></div>
            <div><strong>Order ID:</strong> ${reg.order_id}</div>
            <div><strong>Date:</strong> ${new Date(reg.created_at).toLocaleString()}</div>
        </div>
        <div style="background: #FEE2E2; border: 2px solid #DC2626; padding: 15px; border-radius: 8px; margin-top: 15px;">
            <strong style="color: #DC2626;">⚠️ WARNING:</strong> This action cannot be undone. The registration will be permanently deleted from the database.
        </div>
    `;
    
    // Store registration ID for deletion
    document.getElementById('confirmDeleteBtn').dataset.regId = reg.registration_id;
}

async function confirmDeleteEntry() {
    const regId = document.getElementById('confirmDeleteBtn').dataset.regId;
    
    if (!confirm(`⚠️ FINAL CONFIRMATION\n\nAre you absolutely sure you want to DELETE registration ${regId}?\n\nThis action is PERMANENT and cannot be undone!`)) {
        return;
    }

    try {
        const response = await fetch(`/api/registrations/${regId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Registration deleted successfully!');
            closeDeleteEntryModal();
            fetchRegistrations(); // Reload the table
        } else {
            alert('❌ Error: ' + (result.error || 'Failed to delete'));
        }
    } catch (error) {
        console.error('Error deleting registration:', error);
        alert('❌ Error deleting registration. Please try again.');
    }
}

// ============= WHATSAPP RESEND MODAL =============
function openWhatsAppResendModal() {
    const modal = document.createElement('div');
    modal.id = 'whatsappResendModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px;';
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 12px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 20px; border-radius: 12px 12px 0 0;">
                <h2 style="margin: 0; font-size: 24px; display: flex; align-items: center; gap: 10px;">
                    <span>📲</span> Resend WhatsApp Confirmation
                </h2>
            </div>
            <div style="padding: 25px;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #374151;">Enter Registration ID:</label>
                    <input type="text" id="whatsappRegId" placeholder="e.g., REG-1731234567890-ABC123" style="width: 100%; padding: 12px; border: 2px solid #E5E7EB; border-radius: 8px; font-size: 14px;" onkeyup="if(event.key==='Enter') fetchRegistrationForWhatsApp()">
                    <button onclick="fetchRegistrationForWhatsApp()" style="width: 100%; margin-top: 10px; background: #3B82F6; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer;" onmouseover="this.style.background='#2563EB'" onmouseout="this.style.background='#3B82F6'">
                        🔍 Load Registration
                    </button>
                </div>
                <div id="whatsappRegistrationDetails" style="display: none; background: #F0FDF4; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #10B981;">
                    <!-- Details will be loaded here -->
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="closeWhatsAppResendModal()" style="flex: 1; background: #6B7280; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer;" onmouseover="this.style.background='#4B5563'" onmouseout="this.style.background='#6B7280'">
                        ✖ Cancel
                    </button>
                    <button id="confirmWhatsAppBtn" onclick="confirmResendWhatsApp()" style="flex: 1; background: #10B981; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; display: none;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10B981'">
                        📲 Send WhatsApp
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeWhatsAppResendModal() {
    const modal = document.getElementById('whatsappResendModal');
    if (modal) modal.remove();
}

async function fetchRegistrationForWhatsApp() {
    const regId = document.getElementById('whatsappRegId').value.trim();
    if (!regId) {
        alert('⚠️ Please enter a Registration ID');
        return;
    }

    try {
        const response = await fetch(`/api/registrations?registration_id=${regId}`);
        const data = await response.json();

        if (data.success && data.registrations && data.registrations.length > 0) {
            const reg = data.registrations[0];
            displayWhatsAppRegistrationDetails(reg);
        } else {
            alert('❌ Registration not found with ID: ' + regId);
        }
    } catch (error) {
        console.error('Error fetching registration:', error);
        alert('❌ Error loading registration. Please try again.');
    }
}

function displayWhatsAppRegistrationDetails(reg) {
    const detailsDiv = document.getElementById('whatsappRegistrationDetails');
    detailsDiv.style.display = 'block';
    document.getElementById('confirmWhatsAppBtn').style.display = 'block';
    
    detailsDiv.innerHTML = `
        <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">📋 Registration Details</h3>
        <div style="display: grid; gap: 10px;">
            <div><strong>Registration ID:</strong> ${reg.registration_id}</div>
            <div><strong>Name:</strong> ${reg.name_prefix || ''} ${reg.name}</div>
            <div><strong>Mobile:</strong> <span style="color: #10B981; font-weight: 600;">${reg.mobile}</span></div>
            <div><strong>Email:</strong> ${reg.email}</div>
            <div><strong>Type:</strong> ${reg.registration_type}</div>
            <div><strong>Club:</strong> ${reg.club_name}</div>
            <div><strong>Amount:</strong> ₹${reg.amount}</div>
            <div><strong>Payment Status:</strong> <span style="color: ${reg.payment_status === 'SUCCESS' ? '#10B981' : '#EF4444'};">${reg.payment_status}</span></div>
            <div><strong>Transaction ID:</strong> ${reg.transaction_id || 'N/A'}</div>
            <div><strong>Date:</strong> ${new Date(reg.created_at).toLocaleString()}</div>
        </div>
        <div style="background: #DBEAFE; border: 2px solid #3B82F6; padding: 15px; border-radius: 8px; margin-top: 15px;">
            <strong style="color: #1E40AF;">ℹ️ Note:</strong> WhatsApp confirmation will be sent to <strong>${reg.mobile}</strong> with the latest registration details.
        </div>
    `;
    
    // Store registration data for WhatsApp sending
    document.getElementById('confirmWhatsAppBtn').dataset.regId = reg.registration_id;
    document.getElementById('confirmWhatsAppBtn').dataset.mobile = reg.mobile;
    document.getElementById('confirmWhatsAppBtn').dataset.orderId = reg.order_id;
}

async function confirmResendWhatsApp() {
    const btn = document.getElementById('confirmWhatsAppBtn');
    const regId = btn.dataset.regId;
    const mobile = btn.dataset.mobile;
    const orderId = btn.dataset.orderId;
    
    if (!confirm(`📲 Send WhatsApp confirmation to ${mobile}?`)) {
        return;
    }

    // Disable button and show loading
    btn.disabled = true;
    btn.innerHTML = '⏳ Sending...';

    try {
        const response = await fetch('/api/resend-whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                registration_id: regId,
                order_id: orderId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ WhatsApp confirmation sent successfully!');
            closeWhatsAppResendModal();
        } else {
            alert('❌ Error: ' + (result.error || 'Failed to send WhatsApp'));
            btn.disabled = false;
            btn.innerHTML = '📲 Send WhatsApp';
        }
    } catch (error) {
        console.error('Error sending WhatsApp:', error);
        alert('❌ Error sending WhatsApp. Please try again.');
        btn.disabled = false;
        btn.innerHTML = '📲 Send WhatsApp';
    }
}
