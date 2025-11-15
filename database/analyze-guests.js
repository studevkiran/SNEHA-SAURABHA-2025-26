const XLSX = require('xlsx');

try {
  const workbook = XLSX.readFile('./public/New Guest.xlsx');
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  
  console.log('\n📊 ANALYSIS OF NEW GUEST.XLSX\n');
  console.log('='.repeat(60));
  
  // Count by registration type
  const typeCount = {};
  const guestEntries = [];
  const cancelledEntries = [];
  
  data.forEach(row => {
    const type = row['Registration Type'] || 'UNKNOWN';
    const name = row['Name'] || '';
    const mobile = row['Mobile'];
    const email = row['eMail'];
    const amount = row['Amount'];
    
    typeCount[type] = (typeCount[type] || 0) + 1;
    
    if (type === 'GUEST' || name.toLowerCase().includes('cancelled')) {
      const entry = {
        id: row['App No.'],
        name: name,
        type: type,
        mobile: mobile ? 'YES' : 'NO',
        email: email ? 'YES' : 'NO',
        amount: amount ? amount : 'NO'
      };
      
      if (name.toLowerCase().includes('cancelled')) {
        cancelledEntries.push(entry);
      } else if (type === 'GUEST') {
        guestEntries.push(entry);
      }
    }
  });
  
  console.log('\n📋 REGISTRATION TYPE BREAKDOWN:');
  Object.entries(typeCount).sort((a,b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} entries`);
  });
  
  console.log('\n\n🚨 CANCELLED ENTRIES:');
  console.log('='.repeat(60));
  if (cancelledEntries.length > 0) {
    cancelledEntries.forEach(entry => {
      console.log(`${entry.id}: ${entry.name}`);
      console.log(`   Type: ${entry.type}, Mobile: ${entry.mobile}, Email: ${entry.email}, Amount: ${entry.amount}`);
    });
  } else {
    console.log('   None found');
  }
  
  console.log('\n\n👥 GUEST ENTRIES (Type=GUEST):');
  console.log('='.repeat(60));
  if (guestEntries.length > 0) {
    guestEntries.forEach(entry => {
      console.log(`${entry.id}: ${entry.name}`);
      console.log(`   Mobile: ${entry.mobile}, Email: ${entry.email}, Amount: ${entry.amount}`);
    });
  } else {
    console.log('   None found');
  }
  
  console.log('\n\n💡 RECOMMENDATION:');
  console.log('='.repeat(60));
  const totalTest = cancelledEntries.length + guestEntries.length;
  console.log(`Total entries to mark as "test" payment status: ${totalTest}`);
  console.log(`   - ${cancelledEntries.length} CANCELLED entries`);
  console.log(`   - ${guestEntries.length} GUEST entries`);
  console.log(`\nThese ${totalTest} entries will be marked with payment_status = "test"`);
  console.log('Real registrations will have payment_status = "SUCCESS"\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
