const { Pool } = require('pg');

const connectionString = process.argv[2];

if (!connectionString) {
  console.error('❌ Usage: node sanitize-test-entries.js <POSTGRES_URL>');
  console.error('Get POSTGRES_URL from: https://vercel.com/kirans-projects-cb89f9d8/sneha2026/settings/environment-variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function sanitizeTestEntries() {
  const testEntries = [
    {
      id: 'ROT54V0694',
      name: 'TEST ENTRY',
      email: 'test@test.com',
      mobile: '0000000000',
      club: 'TEST',
      registration_type: 'Guest',
      registration_amount: 1.00,
      meal_preference: 'Veg',
      tshirt_size: 'N/A'
    },
    {
      id: '2026RTY0693',
      name: 'TEST ENTRY',
      email: 'test@test.com',
      mobile: '0000000001',
      club: 'TEST',
      registration_type: 'Guest',
      registration_amount: 1.00,
      meal_preference: 'Veg',
      tshirt_size: 'N/A'
    },
    {
      id: '2026RTY0695',
      name: 'TEST ENTRY',
      email: 'test@test.com',
      mobile: '0000000002',
      club: 'TEST',
      registration_type: 'Guest',
      registration_amount: 1.00,
      meal_preference: 'Veg',
      tshirt_size: 'N/A'
    },
    {
      id: '2026RTY0696',
      name: 'TEST ENTRY',
      email: 'test@test.com',
      mobile: '0000000003',
      club: 'TEST',
      registration_type: 'Guest',
      registration_amount: 1.00,
      meal_preference: 'Veg',
      tshirt_size: 'N/A'
    }
  ];
  
  try {
    console.log('🔄 Sanitizing test entries (keeping Registration IDs unchanged)...\n');
    
    for (const entry of testEntries) {
      console.log(`📝 Updating ${entry.id}...`);
      
      const result = await pool.query(
        `UPDATE registrations 
         SET name = $1,
             email = $2,
             mobile = $3,
             club = $4,
             registration_type = $5,
             registration_amount = $6,
             meal_preference = $7,
             tshirt_size = $8
         WHERE registration_id = $9
         RETURNING registration_id, name, email, mobile, club, registration_type, registration_amount`,
        [
          entry.name,
          entry.email,
          entry.mobile,
          entry.club,
          entry.registration_type,
          entry.registration_amount,
          entry.meal_preference,
          entry.tshirt_size,
          entry.id
        ]
      );
      
      if (result.rowCount > 0) {
        const record = result.rows[0];
        console.log(`✅ Sanitized: ${record.registration_id}`);
        console.log(`   Name: ${record.name}`);
        console.log(`   Email: ${record.email}`);
        console.log(`   Mobile: ${record.mobile}`);
        console.log(`   Club: ${record.club}`);
        console.log(`   Type: ${record.registration_type}`);
        console.log(`   Amount: ₹${record.registration_amount}`);
      } else {
        console.log(`⚠️  Not found: ${entry.id}`);
      }
      console.log('');
    }
    
    console.log('✅ All test entries sanitized successfully!');
    console.log('📊 Registration IDs kept unchanged for sequence integrity.');
    console.log('📋 All personal data replaced with TEST values.');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

sanitizeTestEntries();
