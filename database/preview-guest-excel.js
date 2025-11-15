// Preview Guest.xlsx columns and first few rows
const XLSX = require('xlsx');

try {
  const workbook = XLSX.readFile('./public/Guest.xlsx');
  const sheetName = workbook.SheetNames[0];
  console.log(`\n📊 Sheet Name: ${sheetName}\n`);
  
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`📋 Total Rows: ${data.length}\n`);
  
  if (data.length > 0) {
    console.log('🔑 Column Names:');
    console.log(Object.keys(data[0]).join(', '));
    console.log('\n');
    
    console.log('👀 First 5 Rows:\n');
    data.slice(0, 5).forEach((row, idx) => {
      console.log(`Row ${idx + 1}:`);
      console.log(JSON.stringify(row, null, 2));
      console.log('---\n');
    });
  }
} catch (error) {
  console.error('❌ Error reading Excel:', error.message);
}
