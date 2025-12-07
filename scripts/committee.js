// Load and display committee members with logo images

document.addEventListener('DOMContentLoaded', async () => {
    await loadCommitteeMembers();
});

async function loadCommitteeMembers() {
    try {
        const response = await fetch('../data/committee.json');
        const data = await response.json();
        
        const grid = document.getElementById('committeeGrid');
        
        // Sort by order
        const sortedMembers = data.committee.sort((a, b) => a.order - b.order);
        
        sortedMembers.forEach(member => {
            const card = createCommitteeCard(member);
            grid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading committee members:', error);
        showError();
    }
}

function createCommitteeCard(member) {
    const card = document.createElement('div');
    card.className = 'committee-card';
    
    // Get initials for placeholder
    const initials = getInitials(member.name);
    
    card.innerHTML = `
        <div class="logo-container">
            <img src="${member.logo}" 
                 alt="${member.name}" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="logo-placeholder" style="display:none;">${initials}</div>
        </div>
        <div class="member-info">
            <div class="member-name">${member.name}</div>
            <div class="member-role">${member.role}</div>
            <div class="member-club">${member.club}</div>
            <div class="member-contact">
                ${member.phone ? `<a href="tel:${member.phone}">📞 ${member.phone}</a>` : ''}
                ${member.email ? `<a href="mailto:${member.email}">📧 ${member.email}</a>` : ''}
            </div>
        </div>
    `;
    
    return card;
}

function getInitials(name) {
    if (!name) return '?';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

function showError() {
    const grid = document.getElementById('committeeGrid');
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
            <h3>Unable to load committee members</h3>
            <p>Please check your connection and try again.</p>
        </div>
    `;
}
