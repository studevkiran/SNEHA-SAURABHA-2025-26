const { Pool } = require('pg');

// Usage: node mark-test-entries.js <POSTGRES_URL>
const connectionString = process.argv[2];

if (!connectionString) {
  console.error('❌ Usage: node mark-test-entries.js <POSTGRES_URL>');
  console.error('Get POSTGRES_URL from Vercel environment variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function markTestEntries() {
  const testEntries = [
    {
      id: 'ROT54V0694',
      updates: {
        name: '[TEST - OLD FORMAT] Rtn. Satish Kumar K R',
        email: 'TEST-satishhkumaarkr@gmail.com',
        // Keep mobile and club as-is for reference
      }
    },
    {
      id: '2026RTY0693',
      updates: {
        name: '[TEST] TESTER',
        email: 'TEST@test.com',
      }
    },
    {
      id: '2026RTY0695',
      updates: {
        name: '[TEST - NEW FORMAT] TEST',
        email: 'TEST-test@test.com',
      }
    },
    {
      id: '2026RTY0696',
      updates: {
        name: '[TEST - ZONE DEBUG] ZONE TEST MYSORE',
        email: 'TEST-zone@test.com',
      }
    }
  ];
  
  try {
    console.log('🔄 Marking test entries (keeping them for sequence integrity)...\n');
    
    for (const entry of testEntries) {
      console.log(`📝 Updating ${entry.id}...`);
      
      const result = await pool.query(
        `UPDATE registrations 
         SET name = $1, email = $2
         WHERE registration_id = $3
         RETURNING registration_id, name, email, mobile, club, zone`,
        [entry.updates.name, entry.updates.email, entry.id]
      );
      
      if (result.rowCount > 0) {
        const record = result.rows[0];
        console.log(`✅ Updated: ${record.name}`);
        console.log(`   Mobile: ${record.mobile}, Club: ${record.club}, Zone: ${record.zone || 'Not set'}`);
      } else {
        console.log(`⚠️  Not found: ${entry.id}`);
      }
      console.log('');
    }
    
    console.log('✅ Test entries marked successfully!');
    console.log('📊 These entries are kept to maintain sequence integrity.');
    console.log('   Real registrations after 2026RTY0696 remain untouched.');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

markTestEntries();
