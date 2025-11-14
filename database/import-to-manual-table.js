/**
 * QUICK IMPORT: 680 Registrations to Separate Table
 * Import to manual_registrations table (staging)
 * Review, update, and merge later
 */

const { sql } = require('@vercel/postgres');

// Simplified club mapping (top clubs, rest default to Mysore=56)
const CLUBS = {
  'Mysore Midtown': 59, 'Mysore North': 62, 'Mysore Metro': 58, 'Mysore East': 60,
  'Mysore': 56, 'Mysore Royal': 64, 'Mysore Elite': 61, 'Mysore SouthEast': 63,
  'Mysore West': 66, 'Mysore Ambari': 57, 'Mysore Brindavan': 57, 'Mysore Sreegandha': 65,
  'Mysore Stars': 65, 'Mysore Jayaprakash Nagar': 62, 'Mysuru Diamond': 67,
  'Mangalore South': 47, 'Mangalore North': 42, 'Mangalore': 38, 'Mangalore East': 41,
  'Mangalore Hillside': 40, 'Mangalore Metro': 44, 'Mangalore Midtown': 43,
  'Mangalore Central': 39, 'Mangalore City': 39, 'Mangalore Sunrise': 45,
  'Mangalore Coastal': 40, 'Mangalore Down Town': 40, 'Mangalore Seaside': 46,
  'Bannur': 4, 'Bantwal': 5, 'Bantwal Loretto Hills': 6, 'Bantwal Town': 7,
  'Belthangady': 9, 'Kollegala': 32, 'Kollegala Midtown': 33,
  'Sullia': 80, 'Sullia City': 81, 'Puttur': 74, 'Puttur East': 76,
  'Puttur City': 75, 'Puttur Central': 75, 'Puttur Elite': 77,
  'Chamarajanagara': 93, 'Chamarajanagara Silk City': 14,
  'Heritage Mysuru': 27, 'Surathkal': 82, 'Subramanya': 79,
  'Gonikoppal': 25, 'H D Kote': 26, 'Panchasheel': 70,
  'Misty Hills Madikeri': 51, 'Madikeri': 36, 'Vijayanagara Mysore': 88,
  'Kushalnagara': 35, 'Krishnarajanagara': 34, 'Krishnaraja': 34,
  'Nanjangud': 55, 'Periyapatna Midtown': 72, 'Periyapatna Icons': 71,
  'Yelandur Greenway': 92, 'Hunsur': 28, 'Ivory City': 29,
  'Virajpete': 89, 'Central Mysore': 11, 'Somarpete Hills': 78,
  'Moodabidri': 52, 'Moodabidri Temple Town': 53, 'Mulki': 54,
  'Deralakatte': 16, 'Uppinangdi': 87, 'E Club of Mysore Center': 18
};

// Type mapping
const TYPES = {
  'ROTARIAN': ['Rotarian', 7500],
  'ROTARIAN WITH SPOUSE': ['Rotarian with Spouse', 14000],
  'ROTARY ANNE': ['Ann', 7500],
  'SILVER SPONSOR': ['Silver Sponsor', 25000],
  'SILVER DONOR': ['Silver Sponsor', 25000],
  'GOLD SPONSOR': ['Gold Sponsor', 100000],
  'PLATINUM SPONSOR': ['Platinum Sponsor', 200000],
  'PATRON SPONSOR': ['Patron Sponsor', 500000]
};

// Parse date DD-MM-YYYY to YYYY-MM-DD
function parseDate(d) {
  const [day, month, year] = d.split('-');
  return `${year}-${month}-${day}`;
}

// All 680 registrations (paste your data here in format: regNo|date|club|name|type)
const DATA = `
2026RTY0001|24-01-2025|Mysore Midtown|Rtn. Ramakrishna Kannan|ROTARIAN
2026RTY0002|24-01-2025|Mangalore South|Rtn. Satish Bolar|ROTARIAN
2026RTY0003|24-01-2025|Mysore North|Rtn. Yashawini Somashekhar S|ROTARIAN
2026RTY0004|24-01-2025|Vijayanagara Mysore|Rtn. H.M. Harish|ROTARIAN
2026RTY0005|24-01-2025|Mangalore Hillside|Rtn. Ranganath Kini|ROTARIAN
2026RTY0006|24-01-2025|Mysore Midtown|Rtn. Ranganatha Rao|SILVER SPONSOR
2026RTY0007|25-01-2025|Mysore Midtown|Rtn. Prahlad Bayari|SILVER SPONSOR
2026RTY0008|25-01-2025|Sullia|Rtn. P. Ganesh Bhat|ROTARIAN
2026RTY0009|25-01-2025|Sullia|Rtn. Sanjeeva Kudpaje|ROTARIAN WITH SPOUSE
2026RTY0010|25-01-2025|Heritage Mysuru|Rtn. Sundararaja B.C|ROTARIAN WITH SPOUSE
`.trim();

async function importToManualTable() {
  console.log('🚀 Importing to manual_registrations table (staging)\n');
  
  const lines = DATA.split('\n').filter(l => l.trim());
  let success = 0, failed = 0;
  
  for (const line of lines) {
    try {
      const [regNo, date, club, name, type] = line.split('|');
      const [typeName, amount] = TYPES[type] || ['Rotarian', 7500];
      const clubId = CLUBS[club] || 56;
      const regDate = parseDate(date);
      
      await sql`
        INSERT INTO manual_registrations (
          registration_id, name, mobile, email, club, club_id,
          registration_type, registration_amount, meal_preference,
          registration_date, payment_status, needs_contact_update,
          is_verified
        ) VALUES (
          ${regNo}, ${name}, NULL, NULL, ${club}, ${clubId},
          ${typeName}, ${amount}, 'Veg',
          ${regDate}, 'SUCCESS', TRUE, FALSE
        )
        ON CONFLICT (registration_id) DO NOTHING
      `;
      
      success++;
      console.log(`✅ [${success}/${lines.length}] ${regNo} - ${name}`);
      
    } catch (err) {
      failed++;
      console.error(`❌ ${line.split('|')[0]}: ${err.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Success: ${success} | ❌ Failed: ${failed} | Total: ${lines.length}`);
  console.log('='.repeat(60));
  
  // Show summary
  const summary = await sql`
    SELECT registration_type, COUNT(*), SUM(registration_amount)
    FROM manual_registrations
    GROUP BY registration_type
    ORDER BY COUNT(*) DESC
  `;
  
  console.log('\n📊 SUMMARY:');
  summary.rows.forEach(r => {
    console.log(`   ${r.registration_type}: ${r.count} (₹${r.sum})`);
  });
  
  console.log('\n💡 NEXT STEPS:');
  console.log('   1. Review: SELECT * FROM manual_registrations;');
  console.log('   2. Update contacts: SELECT * FROM manual_regs_need_update;');
  console.log('   3. Verify: UPDATE manual_registrations SET is_verified=TRUE WHERE ...;');
  console.log('   4. Merge: SELECT * FROM merge_manual_to_main();');
}

importToManualTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Import failed:', err);
    process.exit(1);
  });
