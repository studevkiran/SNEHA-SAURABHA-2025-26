// Show zone-wise club details from ZONE WISE.xlsx
// Usage: node database/show-zone-details.js

const XLSX = require('xlsx');

try {
    // Read the Excel file
    const workbook = XLSX.readFile('./public/ZONE WISE.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log('\n📍 ZONE-WISE CLUB DETAILS FROM EXCEL\n');
    console.log('='.repeat(100));
    console.log(`Total rows in Excel: ${data.length}\n`);

    // Group clubs by zone
    const zones = {};
    
    data.forEach(row => {
        const zoneId = row['Zone ID'];
        const clubName = row['Club Name'];
        const agName = row['AG Name'] || 'Not Assigned';
        const agMobile = row['AG Mobile'] || 'N/A';
        
        if (!zones[zoneId]) {
            zones[zoneId] = {
                agName: agName,
                agMobile: agMobile,
                clubs: []
            };
        }
        zones[zoneId].clubs.push(clubName);
    });

    // Sort and display zones
    const sortedZones = Object.keys(zones).sort((a, b) => parseInt(a) - parseInt(b));

    sortedZones.forEach(zoneId => {
        const zone = zones[zoneId];
        console.log(`\n🏆 ZONE ${zoneId}`);
        console.log(`   Assistant Governor: ${zone.agName}`);
        console.log(`   Mobile: ${zone.agMobile}`);
        console.log(`   Total Clubs: ${zone.clubs.length}`);
        console.log('   ' + '-'.repeat(90));
        
        zone.clubs.sort().forEach((club, idx) => {
            console.log(`   ${String(idx + 1).padStart(2, ' ')}. ${club}`);
        });
        console.log('');
    });

    console.log('='.repeat(100));
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total Zones: ${sortedZones.length}`);
    console.log(`   Total Clubs Mapped: ${data.length}`);
    console.log('='.repeat(100) + '\n');

} catch (error) {
    console.error('❌ Error reading zone mapping:', error.message);
}
