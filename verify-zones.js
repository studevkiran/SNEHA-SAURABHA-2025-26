// Verify zone mapping against official data
const { ZONE_MAPPING, getZoneForClub } = require('./lib/zone-mapping');

console.log('🔍 ZONE MAPPING VERIFICATION\n');

// Count clubs per zone
const zoneCounts = {};
Object.values(ZONE_MAPPING).forEach(zone => {
  zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
});

console.log('📊 Club Count Per Zone:');
Object.entries(zoneCounts).sort().forEach(([zone, count]) => {
  console.log(`   ${zone}: ${count} clubs`);
});

console.log('\n\n🔍 CHECKING FOR ISSUES:\n');

// Issue 1: Check for duplicate club names with different zones
const clubZones = {};
const duplicates = [];
Object.entries(ZONE_MAPPING).forEach(([club, zone]) => {
  const key = club.toLowerCase();
  if (clubZones[key] && clubZones[key] !== zone) {
    duplicates.push({ club, zone1: clubZones[key], zone2: zone });
  }
  clubZones[key] = zone;
});

if (duplicates.length > 0) {
  console.log('❌ DUPLICATES FOUND (same club mapped to different zones):');
  duplicates.forEach(d => {
    console.log(`   ${d.club}: ${d.zone1} AND ${d.zone2}`);
  });
} else {
  console.log('✅ No duplicate club mappings');
}

// Issue 2: Check specific known clubs
console.log('\n\n🧪 TESTING SPECIFIC CLUBS:\n');

const testCases = [
  { club: 'Mulky', expected: 'Zone 1' },
  { club: 'Bantwal', expected: 'Zone 4' },
  { club: 'Sullia', expected: 'Zone 5' },
  { club: 'Mysore Metro', expected: 'Zone 7' },
  { club: 'Mysore Midtown', expected: 'Zone 7' },
  { club: 'Puttur East', expected: 'Zone 5' },
  { club: 'Virajpete', expected: 'Zone 6' },
  { club: 'Mangalore East', expected: 'Zone 2' },
  { club: 'Mangalore Metro', expected: 'Zone 3' },
  { club: 'Mangalore South', expected: 'Zone 3' },
  { club: 'Bannur', expected: 'Zone 9' },
  { club: 'Gonikoppal', expected: 'Zone 6' },
  { club: 'Virajpet', expected: 'Zone 6' },
];

testCases.forEach(test => {
  const result = getZoneForClub(test.club);
  const status = result === test.expected ? '✅' : '❌';
  console.log(`${status} ${test.club.padEnd(25)} → ${result.padEnd(10)} ${result !== test.expected ? `(Expected: ${test.expected})` : ''}`);
});

// Issue 3: List all zones
console.log('\n\n📋 ALL ZONES IN DETAIL:\n');

for (let i = 1; i <= 9; i++) {
  const clubs = Object.entries(ZONE_MAPPING)
    .filter(([_, zone]) => zone === `Zone ${i}`)
    .map(([club, _]) => club)
    .sort();
  
  console.log(`\n🗺️ ZONE ${i} (${clubs.length} clubs):`);
  clubs.forEach(club => {
    console.log(`   • ${club}`);
  });
}

console.log('\n\n🔍 UNMAPPED:');
const unmapped = Object.entries(ZONE_MAPPING)
  .filter(([_, zone]) => zone === 'Unmapped')
  .map(([club, _]) => club);
unmapped.forEach(club => {
  console.log(`   • ${club}`);
});
