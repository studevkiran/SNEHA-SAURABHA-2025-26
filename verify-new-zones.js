#!/usr/bin/env node

const { getZoneForClub, getClubMemberCount, getAllZones } = require('./lib/zone-mapping');

console.log('🔍 Verifying New Zone Structure with Sub-zones and Member Counts\n');

// Test cases from your data
const testCases = [
  { club: 'Mulky', expectedZone: 'Zone 1', expectedMembers: 23 },
  { club: 'Surathkal', expectedZone: 'Zone 2A', expectedMembers: 58 },
  { club: 'Baikampady', expectedZone: 'Zone 2B', expectedMembers: 43 },
  { club: 'Mangalore Downtown', expectedZone: 'Zone 3A', expectedMembers: 25 },
  { club: 'Mangalore', expectedZone: 'Zone 3B', expectedMembers: 78 },
  { club: 'Modankap', expectedZone: 'Zone 4A', expectedMembers: 14 },
  { club: 'Bantwal', expectedZone: 'Zone 4B', expectedMembers: 83 },
  { club: 'Moodabidri', expectedZone: 'Zone 4C', expectedMembers: 93 },
  { club: 'Puttur City', expectedZone: 'Zone 4D', expectedMembers: 68 },
  { club: 'Puttur Yuva', expectedZone: 'Zone 5A', expectedMembers: 49 },
  { club: 'Puttur', expectedZone: 'Zone 5B', expectedMembers: 103 },
  { club: 'Sullia', expectedZone: 'Zone 5C', expectedMembers: 84 },
  { club: 'Virajpet', expectedZone: 'Zone 6A', expectedMembers: 27 },
  { club: 'Kushalnagar', expectedZone: 'Zone 6B', expectedMembers: 47 },
  { club: 'Hunsur', expectedZone: 'Zone 6C', expectedMembers: 34 },
  { club: 'Mysore', expectedZone: 'Zone 7A', expectedMembers: 101 },
  { club: 'Mysore Midtown', expectedZone: 'Zone 7B', expectedMembers: 72 },
  { club: 'Mysore North', expectedZone: 'Zone 8A', expectedMembers: 78 },
  { club: 'Mysore West', expectedZone: 'Zone 8B', expectedMembers: 95 },
  { club: 'Chamarajanagar', expectedZone: 'Zone 9A', expectedMembers: 55 },
  { club: 'Bannur', expectedZone: 'Zone 9B', expectedMembers: 38 }
];

let passed = 0;
let failed = 0;

testCases.forEach(({ club, expectedZone, expectedMembers }) => {
  const actualZone = getZoneForClub(club);
  const actualMembers = getClubMemberCount(club);
  const zoneMatch = actualZone === expectedZone;
  const membersMatch = actualMembers === expectedMembers;
  
  if (zoneMatch && membersMatch) {
    console.log(`✅ ${club}: ${actualZone} (${actualMembers} members)`);
    passed++;
  } else {
    console.log(`❌ ${club}:`);
    if (!zoneMatch) console.log(`   Zone: Expected ${expectedZone}, got ${actualZone}`);
    if (!membersMatch) console.log(`   Members: Expected ${expectedMembers}, got ${actualMembers}`);
    failed++;
  }
});

console.log(`\n📊 Test Results: ${passed}/${testCases.length} passed`);

if (failed === 0) {
  console.log('✅ All tests passed!');
  console.log('\n📋 All zones with sub-zones:');
  getAllZones().forEach(zone => console.log(`   ${zone}`));
} else {
  console.log(`❌ ${failed} tests failed`);
  process.exit(1);
}
