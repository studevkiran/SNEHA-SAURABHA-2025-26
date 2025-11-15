const XLSX = require('xlsx');

try {
  const workbook = XLSX.readFile('./public/DATA.xlsx');
  console.log(`\n📊 Available Sheets: ${workbook.SheetNames.join(', ')}\n`);
  
  const sheetName = workbook.SheetNames[0];
  console.log(`📄 Reading: ${sheetName}\n`);
  
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`📋 Total Rows: ${data.length}\n`);
  
  if (data.length > 0) {
    console.log('🔑 Column Names:');
    Object.keys(data[0]).forEach((col, idx) => {
      console.log(`  ${idx + 1}. "${col}"`);
    });
    console.log('\n');
    
    console.log('👀 First 5 Rows:\n');
    data.slice(0, 5).forEach((row, idx) => {
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
    
    // Check date formats
    console.log('📅 DATE COLUMN ANALYSIS:\n');
    const dateCol = data[0]['Date'] || data[0]['date'] || data[0]['Registration Date'];
    console.log(`First date value: ${dateCol} (Type: ${typeof dateCol})`);
    
    if (typeof dateCol === 'number') {
      const excelDate = new Date((dateCol - 25569) * 86400 * 1000);
      console.log(`Converted to date: ${excelDate.toLocaleDateString('en-IN')}`);
    }
  }
} catch (error) {
  console.error('❌ Error reading Excel:', error.message);
}
