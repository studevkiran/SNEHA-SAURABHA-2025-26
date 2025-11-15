const XLSX = require('xlsx');

try {
  const workbook = XLSX.readFile('./public/excellfile.xlsx');
  console.log(`\n📊 Available Sheets: ${workbook.SheetNames.join(', ')}\n`);
  
  // Read Sheet 2
  const sheetName = workbook.SheetNames[1]; // Index 1 = Sheet 2
  console.log(`📄 Reading: ${sheetName}\n`);
  
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`📋 Total Rows: ${data.length}\n`);
  
  if (data.length > 0) {
    console.log('🔑 Column Names:');
    Object.keys(data[0]).forEach((col, idx) => {
      console.log(`  ${idx + 1}. ${col}`);
    });
    console.log('\n');
    
    console.log('👀 First 3 Rows:\n');
    data.slice(0, 3).forEach((row, idx) => {
      console.log(`Row ${idx + 1}:`);
      console.log(JSON.stringify(row, null, 2));
      console.log('---\n');
    });
    
    console.log('👀 Last 3 Rows:\n');
    data.slice(-3).forEach((row, idx) => {
      console.log(`Row ${data.length - 2 + idx}:`);
      console.log(JSON.stringify(row, null, 2));
      console.log('---\n');
    });
  }
} catch (error) {
  console.error('❌ Error reading Excel:', error.message);
}
