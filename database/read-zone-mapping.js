const XLSX = require('xlsx');

try {
  const workbook = XLSX.readFile('./public/ZONE WISE.xlsx');
  console.log(`\n📊 Available Sheets: ${workbook.SheetNames.join(', ')}\n`);
  
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n📄 Sheet: ${sheetName}\n`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Rows: ${data.length}`);
    
    if (data.length > 0) {
      console.log('\nColumns:', Object.keys(data[0]).join(', '));
      console.log('\nFirst 5 rows:\n');
      data.slice(0, 5).forEach((row, idx) => {
        console.log(`${idx + 1}.`, JSON.stringify(row, null, 2));
      });
    }
    console.log('\n' + '='.repeat(60));
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
